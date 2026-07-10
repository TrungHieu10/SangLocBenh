import axiosClient from './axiosClient';

const doctorApi = {
  getCheckups: async (page = 1, pageSize = 10, status = 'all', search = '') => {
    try {
      const response = await axiosClient.get('/doctor/checkups', { params: { page, pageSize, status, search } });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải danh sách lượt khám' };
    }
  },

  submitReview: async (checkupId, data) => {
    try {
      const response = await axiosClient.put(`/doctor/checkups/${checkupId}/review`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật ghi chú' };
    }
  }
};

export default doctorApi;
