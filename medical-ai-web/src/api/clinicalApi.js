import axiosClient from './axiosClient';

/**
 * Clinical API - Quản lý khám sức khỏe
 */
const clinicalApi = {
  /**
   * Submit checkup mới
   * @param {Object} checkupData - { metrics: {...}, userId }
   * @returns {Promise} { checkupId, predictions, shapValues }
   */
  submitCheckup: async (checkupData) => {
    try {
      const response = await axiosClient.post('/clinical/submit', checkupData);
      return response.data.data || response.data; // Handle wrapped response
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi gửi kết quả khám' };
    }
  },

  /**
   * Trích xuất OCR từ ảnh
   * @param {string} base64Image
   * @param {string} mimeType
   */
  extractOcr: async (base64Image, mimeType) => {
    try {
      const response = await axiosClient.post('/clinical/extract-ocr', { base64Image, mimeType });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi trích xuất văn bản từ ảnh' };
    }
  },

  /**
   * Lấy chi tiết khám theo ID
   * @param {string} checkupId
   * @returns {Promise}
   */
  getCheckupById: async (checkupId) => {
    try {
      const response = await axiosClient.get(`/clinical/${checkupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải thông tin lượt khám' };
    }
  },

  /**
   * Lấy lịch sử khám của người dùng
   * @param {Object} options - { page, pageSize, sortBy }
   * @returns {Promise} { items, total, page, pageSize }
   */
  getHistory: async (options = {}) => {
    try {
      const { page = 1, pageSize = 10, sortBy = 'createdAt' } = options;
      const response = await axiosClient.get('/clinical/history', {
        params: {
          page,
          pageSize,
          sortBy,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải lịch sử khám' };
    }
  },

  /**
   * Lấy tất cả khám của user hiện tại
   * @returns {Promise}
   */
  getMyCheckups: async () => {
    try {
      const response = await axiosClient.get('/clinical/my-checkups');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải danh sách khám của bạn' };
    }
  },

  /**
   * Lấy thống kê nguy cơ
   */
  getRiskStats: async () => {
    try {
      const response = await axiosClient.get('/clinical/predictions/risk-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải thống kê nguy cơ' };
    }
  },

  /**
   * Cập nhật khám
   * @param {string} checkupId
   * @param {Object} updateData
   * @returns {Promise}
   */
  updateCheckup: async (checkupId, updateData) => {
    try {
      const response = await axiosClient.put(`/clinical/${checkupId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật thông tin khám' };
    }
  },

  /**
   * Xóa khám
   * @param {string} checkupId
   * @returns {Promise}
   */
  deleteCheckup: async (checkupId) => {
    try {
      const response = await axiosClient.delete(`/clinical/${checkupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa lượt khám' };
    }
  },
};

export default clinicalApi;
