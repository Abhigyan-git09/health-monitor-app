import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Add this to your existing api.js file, after authAPI

// Health API calls
export const healthAPI = {
  getProfile: async () => {
    const response = await api.get('/health/profile');
    return response.data;
  },
  
  updateBasicInfo: async (data) => {
    const response = await api.put('/health/basic-info', data);
    return response.data;
  },
  
  updateMedicalHistory: async (data) => {
    const response = await api.put('/health/medical-history', data);
    return response.data;
  },
  
  updateDietaryInfo: async (data) => {
    const response = await api.put('/health/dietary-info', data);
    return response.data;
  },
  
  updateLifestyle: async (data) => {
    const response = await api.put('/health/lifestyle', data);
    return response.data;
  },
  
  uploadDocument: async (formData) => {
    const response = await api.post('/health/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};


export default api;
