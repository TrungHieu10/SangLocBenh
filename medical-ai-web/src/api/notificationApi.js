import axiosClient from './axiosClient';

const notificationApi = {
  async getNotifications(limit = 20) {
    const res = await axiosClient.get(`/Notification?limit=${limit}`);
    return Array.isArray(res.data) ? res.data : [];
  },
  
  async getUnreadCount() {
    const res = await axiosClient.get('/Notification/unread-count');
    return res.data;
  },
  
  async markAsRead(id) {
    const res = await axiosClient.put(`/Notification/${id}/read`);
    return res.data;
  },
  
  async markAllAsRead() {
    const res = await axiosClient.put('/Notification/read-all');
    return res.data;
  }
};

export default notificationApi;
