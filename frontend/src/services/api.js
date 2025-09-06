import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Health API calls
export const healthAPI = {
  getHealthProfile: async () => {
    const response = await api.get('/health/profile');
    return response.data;
  },
  // Keep both method names for compatibility
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
    const response = await api.post('/health/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  saveHealthTestResults: async (testResults) => {
    const response = await api.post('/health/health-test', {
      test_results: testResults
    });
    return response.data;
  },
};

// Food API calls
export const foodAPI = {
  searchFoods: async (query, limit = 20) => {
    const response = await api.get('/food/search', {
      params: { q: query, limit }
    });
    return response.data;
  },
  getFoodDetails: async (fdcId) => {
    const response = await api.get(`/food/usda/${fdcId}`);
    return response.data;
  },
  createOrder: async (orderData) => {
    const response = await api.post('/food/order', orderData);
    return response.data;
  },
  getUserOrders: async (params = {}) => {
    const response = await api.get('/food/orders', { params });
    return response.data;
  },
  getOrder: async (orderId) => {
    const response = await api.get(`/food/order/${orderId}`);
    return response.data;
  }
};

// ML API calls
export const mlAPI = {
  getRecommendations: async (availableFoods, nRecommendations = 10) => {
    try {
      const response = await api.post('/food/recommendations', {
        available_foods: availableFoods,
        n_recommendations: nRecommendations
      });
      return response.data;
    } catch (error) {
      console.error('ML recommendations API error:', error);
      return {
        success: false,
        recommendations: [],
        model_status: 'error',
        total_found: 0,
        message: 'ML service temporarily unavailable'
      };
    }
  },
  
  getHealthRiskAssessment: async () => {
    try {
      const response = await api.get('/food/health-risk');
      return response.data;
    } catch (error) {
      console.error('Health risk API error:', error);
      return {
        success: false,
        message: 'Health risk assessment temporarily unavailable'
      };
    }
  }
};

export default api;
