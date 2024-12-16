import axios from 'axios';
import CryptoJS from 'crypto-js';

// AES Encryption Key
const AES_KEY = "IO95120secretkey"; // Must match the backend
const BLOCK_SIZE = 16; // Block size in bytes

// Encrypt Function using AES
function encryptPayload(payload) {
  try {
    // Convert dictionary to JSON string
    const jsonString = JSON.stringify(payload);

    // Generate a random IV (16 bytes)
    const iv = CryptoJS.lib.WordArray.random(BLOCK_SIZE);

    // Encrypt using AES in CBC mode with PKCS7 padding
    const encrypted = CryptoJS.AES.encrypt(jsonString, CryptoJS.enc.Utf8.parse(AES_KEY), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Combine IV and ciphertext, then encode to Base64
    const combined = iv.concat(encrypted.ciphertext);
    const encryptedBlob = CryptoJS.enc.Base64.stringify(combined);

    return encryptedBlob;
  } catch (error) {
    console.error("Encryption Error:", error);
    throw new Error("Failed to encrypt payload.");
  }
}

// Decrypt Function using AES
function decryptPayload(encryptedBlob) {
  try {
    // Decode Base64-encoded encrypted blob
    const encryptedData = CryptoJS.enc.Base64.parse(encryptedBlob);

    // Extract the IV (first 16 bytes) and the ciphertext
    const iv = CryptoJS.lib.WordArray.create(encryptedData.words.slice(0, BLOCK_SIZE / 4));
    const ciphertext = CryptoJS.lib.WordArray.create(
      encryptedData.words.slice(BLOCK_SIZE / 4),
      encryptedData.sigBytes - BLOCK_SIZE
    );

    // Decrypt using AES in CBC mode with PKCS7 padding
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      CryptoJS.enc.Utf8.parse(AES_KEY),
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convert decrypted data to UTF-8 string and parse as JSON
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

  } catch (error) {
    console.error("Decryption Error:", error);
    throw new Error("Failed to decrypt payload.");
  }
}


// === FETCH MIDDLEWARE ===
const fetchMiddleware = async (url, options = {}) => {
  const token = sessionStorage.getItem('authToken'); 

  // Encrypt the request body if present
  if (options.body) {
    const payload = JSON.parse(options.body);
    options.body = JSON.stringify({ encrypted_data: encryptPayload(payload) });
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const updatedOptions = { 
    ...options, 
    headers 
  };

  try {
    // console.log('printing url', url, updatedOptions);
    const response = await fetch(url, updatedOptions);
    
    if (response.status === 401) {
      console.warn('Token expired.');
    }

    
    const responseText = await response.text();
    const responseData = JSON.parse(responseText);
    
    
    // Decrypt the response data if encrypted
    if (responseData.encrypted_data) {
        let decryptedData  = decryptPayload(responseData.encrypted_data);
        console.log(" -- fetch response - ", decryptedData)
        // return tempObject;
        return {
          json: async () => decryptedData, // Allows dashboardData.json() to work
          text: async () => JSON.stringify(decryptedData), // Optionally return as text
        };
    }

    return {
      json: async () => responseData,
      text: async () => responseText,
    };

  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
};

// === AXIOS MIDDLEWARE ===
const axiosMiddleware = axios.create({});

axiosMiddleware.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');

    if (config.data) {
      // Encrypt the request data
      config.data = { encrypted_data: encryptPayload(config.data) };
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosMiddleware.interceptors.response.use(
  (response) => {
    console.log("response - ", response)
    if (response.data?.encrypted_data) {
        // Decrypt the response data
        response.data = decryptPayload(response.data.encrypted_data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token expired.');
    }
    return Promise.reject(error);
  }
);

export {
    axiosMiddleware,
    fetchMiddleware
  };
