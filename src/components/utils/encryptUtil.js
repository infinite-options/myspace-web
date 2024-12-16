// import { Fernet } from 'fernet';
// import axios from 'axios';

// // Fernet Encryption Key
// const FERNET_KEY = "pIx9COzr_KLO87D7d8lkr08p5tpsDOU6dhZW9LZ_hPw=";

// // Set up the Fernet Secret
// const secret = new Fernet.Secret(FERNET_KEY);

// // Encrypt Function using Fernet
// export const encryptPayload = (payload) => {
//     try {
//         const jsonPayload = JSON.stringify(payload);
//         const token = new Fernet({ secret, ttl: 0 }); // ttl = 0 for no expiration
//         const encryptedPayload = token.encode(jsonPayload);
//         return { encrypted_data: encryptedPayload };
//     } catch (error) {
//         console.error('Encryption Error:', error);
//         throw new Error('Failed to encrypt payload.');
//     }
// };

// // Decrypt Function using Fernet
// export const decryptPayload = (encryptedPayload) => {
//     try {
//         const token = new Fernet({ secret, ttl: 0 }); // ttl = 0 for no expiration
//         const decryptedPayload = token.decode(encryptedPayload);
//         return JSON.parse(decryptedPayload);
//     } catch (error) {
//         console.error('Decryption Error:', error);
//         throw new Error('Failed to decrypt payload.');
//     }
// };

// // Axios Interceptor Setup
// axios.interceptors.request.use((config) => {
//     console.log(" -- in interceptor - ", config)
//     if (config.data) {
//         config.data = encryptPayload(config.data);
//     }
//     return config;
// }, (error) => Promise.reject(error));

// axios.interceptors.response.use((response) => {
//     if (response.data) {
//         response.data = decryptPayload(response.data);
//     }
//     return response;
// }, (error) => Promise.reject(error));

// // Fetch Wrapper
// export const fetchWithEncryption = async (url, options = {}) => {
//     try {
//         if (options.body) {
//             const encryptedBody = encryptPayload(JSON.parse(options.body));
//             options.body = JSON.stringify(encryptedBody);
//         }

//         const response = await fetch(url, options);
//         const text = await response.text();
//         const decryptedResponse = decryptPayload(text);
//         return decryptedResponse;
//     } catch (error) {
//         console.error('Fetch Error:', error);
//         throw error;
//     }
// };


import { Fernet } from 'fernet';
import axios from 'axios';

// Fernet Encryption Key
const FERNET_KEY = "pIx9COzr_KLO87D7d8lkr08p5tpsDOU6dhZW9LZ_hPw=";

// Set up the Fernet Secret
// const secret = new Fernet.Secret(FERNET_KEY);

// Custom Axios instance with interceptors
const axiosInstance = axios.create({
    baseURL: 'https://your-api-base-url.com', // Set your API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Encrypt function using Fernet
export const encryptPayload = (payload) => {
    try {
        const jsonPayload = JSON.stringify(payload);
        const token = new Fernet(FERNET_KEY, {ttl: 0 }); // ttl = 0 for no expiration
        const encryptedPayload = token.encode(jsonPayload);
        return { encrypted_data: encryptedPayload };
    } catch (error) {
        console.error('Encryption Error:', error);
        throw new Error('Failed to encrypt payload.');
    }
};

// Decrypt function using Fernet
export const decryptPayload = (encryptedPayload) => {
    try {
        const token = new Fernet(FERNET_KEY, {ttl: 0 }); // ttl = 0 for no expiration
        const decryptedPayload = token.decode(encryptedPayload);
        return JSON.parse(decryptedPayload);
    } catch (error) {
        console.error('Decryption Error:', error);
        throw new Error('Failed to decrypt payload.');
    }
};

// Axios Interceptors Setup
axiosInstance.interceptors.request.use((config) => {
    if (config.data) {
        config.data = encryptPayload(config.data);
    }
    return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use((response) => {
    if (response.data && response.data.encrypted_data) {
        response.data = decryptPayload(response.data.encrypted_data);
    }
    return response;
}, (error) => Promise.reject(error));

// Fetch Wrapper for encrypted requests and decrypted responses
export const fetchWithEncryption = async (url, options = {}) => {
    try {
        if (options.body) {
            const encryptedBody = encryptPayload(JSON.parse(options.body));
            options.body = JSON.stringify(encryptedBody);
        }

        const response = await axiosInstance(url, options);
        return response.data; // Data is already decrypted by the response interceptor
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
};
