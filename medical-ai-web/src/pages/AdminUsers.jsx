import { useState, useEffect, useContext } from 'react';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import adminApi from '../api/adminApi';
import { formatDate } from '../utils/formatMetric';
import { MoreVertical, Edit2, Key, Lock, Unlock, Trash2, Plus, X } from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { SkeletonTable } from '../components/ui/Skeleton';
import { NotificationContext } from '../store/NotificationContext';

export const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [editingUser, setEditingUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', gender: 1, dateOfBirth: '', password: '', role: 'Patient'
  });
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ open: false, type: '', userId: null, message: '' });
  const notification = useContext(NotificationContext);

  const fetchUsers = async () => {
    setLoading(true);
    try { setUsers(await adminApi.getUsers()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        gender: user.gender,
        dateOfBirth: user.dateOfBirth.split('T')[0],
        role: user.role,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '', email: '', phoneNumber: '', gender: 1, dateOfBirth: '', password: '', role: 'Patient'
      });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, formData);
      } else {
        await adminApi.createUser(formData);
      }
      setShowUserModal(false);
      fetchUsers();
      notification.success(editingUser ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
    } catch (err) {
      notification.error(err.message || 'Lỗi khi lưu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (userId) => {
    setConfirmAction({ open: true, type: 'toggle', userId, message: 'Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này?' });
  };

  const handleDeleteUser = (userId) => {
    setConfirmAction({ open: true, type: 'delete', userId, message: 'Cảnh báo: Hành động này không thể hoàn tác. Bạn có chắc chắn xóa người dùng này?' });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.resetPassword(editingUser.id, newPassword);
      setShowPasswordModal(false);
      notification.success('Đổi mật khẩu thành công');
    } catch (err) {
      notification.error(err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeConfirmAction = async () => {
    try {
      if (confirmAction.type === 'toggle') {
        await adminApi.toggleUserStatus(confirmAction.userId);
        notification.success('Thay đổi trạng thái thành công');
      } else if (confirmAction.type === 'delete') {
        await adminApi.deleteUser(confirmAction.userId);
        notification.success('Xóa người dùng thành công');
      }
      fetchUsers();
    } catch (err) {
      notification.error(err.message || 'Đã xảy ra lỗi');
    } finally {
      setConfirmAction({ open: false, type: '', userId: null, message: '' });
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <div className="h-7 bg-midnight-200/60 rounded w-48 animate-pulse mb-2" />
          <div className="h-4 bg-midnight-200/60 rounded w-64 animate-pulse" />
        </div>
        <div className="h-10 bg-midnight-200/60 rounded-xl w-36 animate-pulse" />
      </div>
      <div className="glass-card rounded-2xl p-5">
        <SkeletonTable rows={8} cols={5} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-glass-50 mb-2">Quản lý Người dùng</h1>
          <p className="text-glass-400 text-sm">Tạo, sửa, phân quyền và quản lý tài khoản.</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenUserModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/8 text-glass-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Người dùng</th>
                <th className="pb-3 font-medium">Liên hệ</th>
                <th className="pb-3 font-medium">Vai trò</th>
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/6">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-midnight-200/30 transition-colors">
                  <td className="py-4">
                    <div className="font-semibold text-glass-200 text-sm">{user.fullName}</div>
                    <div className="text-xs text-glass-500">Tham gia: {formatDate(user.createdAt)}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-glass-300 text-sm">{user.email}</div>
                    <div className="text-xs text-glass-500">{user.phoneNumber || 'Không có SĐT'}</div>
                  </td>
                  <td className="py-4">
                    <Badge variant={user.role === 'Admin' ? 'danger' : user.role === 'Doctor' ? 'primary' : 'default'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleOpenUserModal(user)} className="p-1.5 text-glass-400 hover:text-cyan-400 transition-colors" title="Sửa thông tin">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditingUser(user); setNewPassword(''); setShowPasswordModal(true); }} className="p-1.5 text-glass-400 hover:text-blue-400 transition-colors" title="Đổi mật khẩu">
                        <Key className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleStatus(user.id)} className={`p-1.5 transition-colors ${user.isActive ? 'text-glass-400 hover:text-orange-400' : 'text-orange-500 hover:text-green-400'}`} title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}>
                        {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-glass-400 hover:text-red-400 transition-colors" title="Xóa tài khoản">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Form Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? 'Sửa thông tin' : 'Thêm người dùng mới'}>
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Họ và tên" required type="text" value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <Input label="Email" required type="email" disabled={!!editingUser} value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Số điện thoại" type="text" value={formData.phoneNumber}
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
            <Input label="Ngày sinh" required type="date" value={formData.dateOfBirth}
              onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Giới tính" type="select" value={formData.gender}
              onChange={e => setFormData({...formData, gender: parseInt(e.target.value)})}
              options={[{ value: 1, label: 'Nam' }, { value: 0, label: 'Nữ' }]} />
            <Input label="Vai trò" type="select" value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              options={[{ value: 'Patient', label: 'Bệnh nhân' }, { value: 'Nurse', label: 'Y tá / KTV' }, { value: 'Doctor', label: 'Bác sĩ' }, { value: 'Admin', label: 'Quản trị viên' }]} />
          </div>
          {!editingUser && (
            <Input label="Mật khẩu" required type="password" value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})} showStrength />
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setShowUserModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Đổi mật khẩu" className="max-w-sm">
        <div className="mb-4 text-sm text-glass-300">
          Đổi mật khẩu cho: <span className="font-semibold text-glass-100">{editingUser?.email}</span>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input label="Mật khẩu mới" required type="password" placeholder="Nhập ít nhất 6 ký tự"
            value={newPassword} onChange={e => setNewPassword(e.target.value)} showStrength />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setShowPasswordModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmAction.open}
        onClose={() => setConfirmAction({ open: false, type: '', userId: null, message: '' })}
        onConfirm={executeConfirmAction}
        title={confirmAction.type === 'delete' ? 'Xóa người dùng' : 'Thay đổi trạng thái'}
        message={confirmAction.message}
        confirmText={confirmAction.type === 'delete' ? 'Xóa vĩnh viễn' : 'Xác nhận'}
        variant={confirmAction.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default AdminUsers;
