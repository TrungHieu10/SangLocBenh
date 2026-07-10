import axiosClient from './axiosClient';

/**
 * Auth API - Quản lý authentication
 */
const authApi = {
  /**
   * Helper to extract error message from response
   */
  _extractError: (error) => {
    const data = error.response?.data;
    if (data?.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0];
      return { message: data.errors[firstKey][0] };
    }
    return data || { message: error.message || 'Lỗi không xác định' };
  },

  /**
   * Đăng nhập
   * @param {string} identifier
   * @param {string} password
   * @returns {Promise} { accessToken, refreshToken, user }
   */
  login: async (identifier, password) => {
    try {
      const response = await axiosClient.post('/auth/login', { identifier, password });
      
      const accessToken = response.data.accessToken || response.data.token || response.data.access_token;
      const refreshToken = response.data.refreshToken || response.data.refresh_token;

      if (!accessToken) {
         throw new Error("Không tìm thấy accessToken trong response từ Backend!");
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Lấy thông tin user đầy đủ (bao gồm id, dateOfBirth, gender)
      const userResponse = await axiosClient.get('/auth/me');
      const user = userResponse.data;
      
      return { accessToken, refreshToken, user };
    } catch (error) {
      throw authApi._extractError(error);
    }
  },
  /**
   * Đăng nhập bằng Google
   */
  googleLogin: async (idToken) => {
    try {
      const response = await axiosClient.post('/auth/google-login', { idToken });
      
      const accessToken = response.data.accessToken || response.data.token || response.data.access_token;
      const refreshToken = response.data.refreshToken || response.data.refresh_token;

      if (!accessToken) {
         throw new Error("Không tìm thấy accessToken trong response từ Backend!");
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Lấy thông tin user đầy đủ
      const userResponse = await axiosClient.get('/auth/me');
      const user = userResponse.data;
      
      return { accessToken, refreshToken, user };
    } catch (error) {
      throw authApi._extractError(error);
    }
  },
  /**
   * Đăng ký tài khoản
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   * @returns {Promise} { message, user }
   */
  register: async (email, password, fullName, gender, dateOfBirth, phoneNumber, patientCode) => {
    try {
      const response = await axiosClient.post('/auth/register', {
        email,
        password,
        fullName,
        gender: gender || 0,
        dateOfBirth: dateOfBirth || new Date().toISOString(),
        phoneNumber,
        patientCode
      });
      return response.data;
    } catch (error) {
      throw authApi._extractError(error);
    }
  },

  /**
   * Refresh access token
   * @returns {Promise} { accessToken, refreshToken }
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      if (!refreshToken || !accessToken) {
        throw new Error('Không tìm thấy token');
      }

      const response = await axiosClient.post('/auth/refresh-token', { accessToken, refreshToken });
      const { newRefreshToken } = response.data;
      const newAccessToken = response.data.accessToken || response.data.token;

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw authApi._extractError(error);
    }
  },

  /**
   * Đăng xuất
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Verify token còn hạn
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise}
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw authApi._extractError(error);
    }
  },

  /**
   * Liên kết Mã Y Tế (PatientCode)
   * @param {string} patientCode 
   * @returns {Promise}
   */
  linkPatientCode: async (patientCode) => {
    try {
      const response = await axiosClient.post('/auth/link-patient-code', { patientCode });
      return response.data;
    } catch (error) {
      throw authApi._extractError(error);
    }
  },

  /**
   * Cập nhật thông tin hồ sơ cá nhân
   * @param {Object} profileData { fullName, phoneNumber, gender, dateOfBirth }
   * @returns {Promise}
   */
  updateProfile: async (profileData) => {
    try {
      const response = await axiosClient.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw authApi._extractError(error);
    }
  },

  /**
   * Tải lên ảnh đại diện
   * @param {File} file
   * @returns {Promise}
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosClient.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw authApi._extractError(error);
    }
  },

  /**
   * Đổi mật khẩu
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise}
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await axiosClient.put('/auth/change-password', { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      throw authApi._extractError(error);
    }
  },

  /**
   * Quên mật khẩu - gửi email yêu cầu khôi phục
   * @param {string} email
   * @returns {Promise}
   */
  forgotPassword: async (email) => {
    try {
      const response = await axiosClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw authApi._extractError(error);
    }
  },

  /**
   * Đặt lại mật khẩu mới bằng Token
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise}
   */
  resetPasswordWithToken: async (token, newPassword) => {
    try {
      const response = await axiosClient.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw authApi._extractError(error);
    }
  },
};

export default authApi;
