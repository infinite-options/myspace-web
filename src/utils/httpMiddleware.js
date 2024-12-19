import axios from 'axios';
import CryptoJS from 'crypto-js';
import APIConfig from './APIConfig';
import { json } from 'react-router-dom';

// AES Encryption Key
const AES_KEY = "IO95120secretkey"; // Must match the backend
const BLOCK_SIZE = 16; // Block size in bytes


// Encrypt Function For FormData
const encryptFormDataPayload = async (formData) => {
  const formObject = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
        const fileData = await fileToBase64(value); // Convert file to Base64
        formObject[key] = {
            fileName: value.name,
            fileType: value.type,
            fileData: fileData, // Base64 encoded data
        };
    } else {
        formObject[key] = value.toString();
    }
  }

  console.log(" === debug === before encryption = ", formObject)
  const encryptedPayload = encryptPayload(formObject); // Encrypt the payload
  return encryptedPayload;
};

// Encrypt file or image to base64 String
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Get Base64 content only
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
};

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
    const refreshToken = sessionStorage.getItem('refreshToken');

    
    // Encrypt the request body if present
    if(options.body){
      if (options.body instanceof FormData) {
        // console.log(" ==before form data = ", options.body)
        const encryptedFormData = new FormData();
        const encryptedData = await encryptFormDataPayload(options.body);
        encryptedFormData.append("encrypted_data", encryptedData);
        options.body = encryptedFormData;
        // options.body = JSON.stringify({encrypted_data: encryptedFormData, data_type: true});
  
      }else{
        const payload = JSON.parse(options.body);
        console.log(" === debug === before encryption json data = ", payload)
        options.body = JSON.stringify({encrypted_data: encryptPayload(payload), data_type: false});
      }
    }

    // console.log(" == after form data = ", options.body)

    // const headers = {
    //     ...options.headers,
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    // };

    // Set headers
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    // Remove 'Content-Type' for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const updatedOptions = {
        ...options,
        headers
    };

    try {
        
      // console.log('printing url', url, updatedOptions);
      let response = await fetch(url, updatedOptions);

      if (response.status === 401) {
          console.warn('Token expired. Attempting to refresh token...');

          // Call the refresh token endpoint
          const refreshResponse = await fetch(`${APIConfig.baseURL.dev}/auth/refreshToken`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${refreshToken}`
              }
          });

          if (!refreshResponse.ok) {
              console.error('Failed to refresh token');
              throw new Error('Token refresh failed');
          }

          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.access_token;
          console.log('refreshData--', refreshData);
          // Update the token in sessionStorage
          sessionStorage.setItem('authToken', newAccessToken);

          // Retry the original request with the new token
          const retryHeaders = {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          };

          const retryOptions = {
              ...options,
              headers: retryHeaders
          };

          response = await fetch(url, retryOptions);
      }

      // console.log(" == here debug = = ")
      const responseText = await response.text();
      const responseData = JSON.parse(responseText);
      
      // Decrypt the response data if encrypted
      if (responseData.encrypted_data) {
          let decryptedData  = decryptPayload(responseData.encrypted_data);
          console.log(" == DEBUG == fetch response: ", decryptedData)
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
  async (config) => {
    const token = sessionStorage.getItem('authToken');
    // console.log(" == data = ", config)

    if (config.data) {
      if (config.data instanceof FormData) {
        const encryptedFormData = new FormData();
        const encryptedData = await encryptFormDataPayload(config.data);
        encryptedFormData.append("encrypted_data", encryptedData);
        config.data = encryptedFormData;
        // config.data = { encrypted_data: encryptFormDataPayload(config.data), data_type : true};
      } else {
        console.log(" === debug === before encryption json data = ", config.data)
        config.data = { encrypted_data: encryptPayload(config.data), data_type: false};
      }
      // config.data = { encrypted_data: encryptPayload(config.data) };
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
    // console.log("response - ", response)
    if (response.data?.encrypted_data) {
        // Decrypt the response data
        response.data = decryptPayload(response.data.encrypted_data);
    }
    return response;
  },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn('Token expired. Attempting to refresh token...');
            originalRequest._retry = true; 

            const refreshToken = sessionStorage.getItem('refreshToken');
            try {
                // Call the refresh token endpoint
                const refreshResponse = await axios.post(`${APIConfig.baseURL.dev}/auth/refreshToken`, null, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${refreshToken}`
                    }
                });

                const newAccessToken = refreshResponse.data.access_token;

                // Update the token in sessionStorage
                sessionStorage.setItem('authToken', newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Retry the original request
                return axiosMiddleware(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export {
    axiosMiddleware,
    fetchMiddleware
};
