import axios from 'axios';
import CryptoJS from 'crypto-js';

// AES Encryption Key
const AES_KEY = 'IO95120secretkey';

// Encrypt Function using AES
const encryptPayload = (payload) => {
  try {
      const jsonPayload = JSON.stringify(payload);
      return CryptoJS.AES.encrypt(jsonPayload, AES_KEY).toString();
  } catch (error) {
      console.error('Encryption Error:', error);
      throw new Error('Failed to encrypt payload.');
  }
};

// Decrypt Function using AES
const decryptPayload = (encryptedPayload) => {
  try {
      const bytes = CryptoJS.AES.decrypt(encryptedPayload, AES_KEY);
      const decryptedPayload = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedPayload);
  } catch (error) {
      console.error('Decryption Error:', error);
      throw new Error('Failed to decrypt payload.');
  }
};


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
    console.log('printing url', url, updatedOptions);
    const response = await fetch(url, updatedOptions);
    
    if (response.status === 401) {
      console.warn('Token expired.');
    }

    const responseText = await response.text();
    const responseData = JSON.parse(responseText);

    // Decrypt the response data if encrypted
    if (responseData.encrypted_data) {
        return decryptPayload(responseData.encrypted_data);
    }

    return responseData;
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
