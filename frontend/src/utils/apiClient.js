import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 413) {
      throw new Error('File size too large. Maximum size is 10MB.');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// API methods
export const screeningAPI = {
  // Analyze screening data
  analyzeScreening: async (screeningData, userLocation = null) => {
    const response = await apiClient.post('/analyze', screeningData, {
      params: userLocation ? { user_location: JSON.stringify(userLocation) } : {}
    });
    return response.data;
  },

  // Upload medical files
  uploadFile: async (file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // Extended timeout for file uploads
    });
    return response.data;
  },

  // Get nearby referrals
  getReferrals: async (location = null, urgency = null, radius = 50) => {
    const params = { radius, max_results: 5 };
    if (location?.lat && location?.lng) {
      params.lat = location.lat;
      params.lng = location.lng;
    }
    if (urgency) {
      params.urgency = urgency;
    }
    
    const response = await apiClient.get('/referrals', { params });
    return response.data;
  },

  // Save screening report
  saveReport: async (sessionId, userConsent = true) => {
    const response = await apiClient.post('/reports', {
      session_id: sessionId,
      user_consent: userConsent
    });
    return response.data;
  },

  // Get screening session
  getSession: async (sessionId) => {
    const response = await apiClient.get(`/session/${sessionId}`);
    return response.data;
  },

  // Calculate risk score (utility)
  calculateScore: async (symptoms, deepQuestions = {}) => {
    const params = {
      symptoms: JSON.stringify(symptoms),
      deep_questions: JSON.stringify(deepQuestions)
    };
    
    const response = await apiClient.get('/score', { params });
    return response.data;
  },

  // Download PDF report
  downloadPDF: async (sessionId) => {
    const response = await apiClient.get(`/pdf/report/${sessionId}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TB_Screening_Report_${sessionId.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'PDF downloaded successfully' };
  },

  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};

export default apiClient;