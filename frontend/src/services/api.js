import axios from 'axios';

// Определяем API URL в зависимости от окружения
const getApiBaseUrl = () => {
  // В production используем переменную окружения или production URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://expensis-analyzer.onrender.com';
  }
  // В development используем переменную окружения или localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// Логирование для отладки (только в development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeStatement = async (statement) => {
  try {
    const response = await api.post('/api/analyze', { statement });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.error || 'Ошибка при анализе выписки');
  }
};

export const parsePDF = async (pdfFile) => {
  try {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    
    const response = await axios.post(`${API_BASE_URL}/api/parse-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(error.response?.data?.error || 'Ошибка при обработке PDF файла');
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
};

