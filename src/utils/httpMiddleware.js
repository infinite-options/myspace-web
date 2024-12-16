import axios from 'axios';

// === FETCH MIDDLEWARE ===
const fetchMiddleware = async (url, options = {}) => {
  const token = sessionStorage.getItem('authToken'); 

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
