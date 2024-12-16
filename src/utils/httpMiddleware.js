import axios from 'axios';
import APIConfig from '../utils/APIConfig';

// === FETCH MIDDLEWARE ===
const fetchMiddleware = async (url, options = {}) => {
    const token = sessionStorage.getItem('authToken');
    const refreshToken = sessionStorage.getItem('refreshToken');

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
                'Content-Type': 'application/json',
            };

            const retryOptions = {
                ...options,
                headers: retryHeaders
            };

            response = await fetch(url, retryOptions);
        }

        return response;
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
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosMiddleware.interceptors.response.use(
    (response) => response,
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
