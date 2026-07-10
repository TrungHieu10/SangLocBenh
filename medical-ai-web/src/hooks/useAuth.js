import { useContext, useEffect } from 'react';
import { AuthContext } from '../store/AuthContext';
import authApi from '../api/authApi';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }

  const { user, token, loading, error, login, logout, setUser, setAuthLoading } = context;

  // Khởi tạo từ localStorage
  useEffect(() => {
    const checkAuth = async () => {
      // Chỉ kiểm tra nếu có token nhưng chưa có user (VD: user mới F5 trình duyệt)
      if (token && !user) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Auth check failed:', err);
          authApi.logout();
          logout();
          setAuthLoading(false); // Tắt loading nếu lỗi
        }
      } else {
        setAuthLoading(false); // Nếu không có token, tắt loading ngay
      }
    };

    checkAuth();
  }, [token, user, setUser, logout, setAuthLoading]);

  const loginWithGoogle = async (idToken) => {
    try {
      const data = await authApi.googleLogin(idToken);
      // data trả về là { accessToken, refreshToken, user }
      login(data.user || data, data.accessToken);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      login(data.user || data, data.accessToken);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const isAuthenticated = () => {
    return !!token && authApi.isAuthenticated();
  };

  return {
    user,
    loading,
    error,
    login: loginWithEmail,
    loginWithGoogle,
    logout,
    isAuthenticated,
    setUser,
  };
};

export default useAuth;
