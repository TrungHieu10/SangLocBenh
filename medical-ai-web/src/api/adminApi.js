import axiosClient from './axiosClient';

const adminApi = {
  getStats: async () => {
    try {
      const response = await axiosClient.get('/admin/stats');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải thống kê' };
    }
  },
  
  getUsers: async (role = '') => {
    try {
      const response = await axiosClient.get('/admin/users', { params: { role } });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải danh sách người dùng' };
    }
  },

  updateRole: async (userId, role) => {
    try {
      const response = await axiosClient.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật vai trò' };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosClient.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tạo người dùng' };
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axiosClient.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật người dùng' };
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const response = await axiosClient.put(`/admin/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật trạng thái' };
    }
  },

  resetPassword: async (userId, newPassword) => {
    try {
      const response = await axiosClient.put(`/admin/users/${userId}/reset-password`, { newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi đặt lại mật khẩu' };
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axiosClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa người dùng' };
    }
  },

  getAllCheckups: async (page = 1, pageSize = 20) => {
    try {
      const response = await axiosClient.get('/admin/checkups', { params: { page, pageSize } });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tải danh sách khám' };
    }
  },

  deleteCheckup: async (checkupId) => {
    try {
      const response = await axiosClient.delete(`/admin/checkups/${checkupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa lượt khám' };
    }
  }
};

export default adminApi;
