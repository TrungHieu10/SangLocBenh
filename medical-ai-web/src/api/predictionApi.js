import axiosClient from './axiosClient';

/**
 * Prediction API - Quản lý dự đoán AI
 */
const predictionApi = {
  /**
   * Lấy kết quả dự đoán theo checkupId
   * @param {string} checkupId
   * @returns {Promise} { predictions: [...], shapValues, riskLevel, advice }
   */
  getPredictionsByCheckupId: async (checkupId) => {
    try {
      // Sửa lại endpoint để trỏ vào ClinicalRAGController, giống với lúc POST submit
      const response = await axiosClient.get(`/ClinicalRAG/${checkupId}/result`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải dự đoán' };
    }
  },

  /**
   * Lấy lịch sử dự đoán (health trend)
   * @param {Object} options - { limit, from, to }
   * @returns {Promise} [{ date, predictions, riskLevel }, ...]
   */
  getPredictionHistory: async (options = {}) => {
    try {
      const { limit = 10, from, to } = options;
      const params = { limit };
      
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await axiosClient.get('/clinical/predictions/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải lịch sử dự đoán' };
    }
  },

  /**
   * Lấy mô hình đặc trưng (feature importance)
   * @param {string} diseaseType - e.g., 'diabetes', 'hypertension'
   * @returns {Promise} { features: [...], importance: [...] }
   */
  getFeatureImportance: async (diseaseType = 'all') => {
    try {
      const response = await axiosClient.get('/clinical/predictions/feature-importance', {
        params: { diseaseType },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải đặc trưng dự đoán' };
    }
  },

  /**
   * Lấy thống kê risk level
   * @returns {Promise} { low: number, medium: number, high: number }
   */
  getRiskStatistics: async () => {
    try {
      const response = await axiosClient.get('/clinical/predictions/risk-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải thống kê nguy cơ' };
    }
  },
};

export default predictionApi;
