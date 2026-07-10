/**
 * ProfilePage — Dark futuristic profile
 */
import { useState, useEffect, useContext, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { useCheckupHistory } from '../hooks/useCheckupHistory';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import clinicalApi from '../api/clinicalApi';
import authApi from '../api/authApi';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { User, Mail, Calendar, Activity, ArrowRight, LogOut, Edit2, TrendingUp, AlertTriangle, CheckCircle2, Stethoscope, FileText, Phone, X, Save, Key, Lock, Camera } from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { NotificationContext } from '../store/NotificationContext';

const getInitials = (name, email) => {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return email ? email.slice(0, 2).toUpperCase() : 'U';
};

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Gần đây';

const roleMap = { Admin: { label: 'Quản trị viên', variant: 'danger' }, Doctor: { label: 'Bác sĩ', variant: 'info' }, Patient: { label: 'Bệnh nhân', variant: 'primary' } };

export const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const { checkups, loading } = useCheckupHistory();
  const [riskStats, setRiskStats] = useState({ low: 0, medium: 0, high: 0 });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notification = useContext(NotificationContext);
  const isPatient = user?.role === 'Patient';

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    gender: user?.gender ?? 1,
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Change password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleOpenPasswordModal = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ tất cả các trường.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      timeoutRef.current = setTimeout(() => {
        setShowPasswordModal(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err.message || 'Lỗi khi đổi mật khẩu.');
    } finally {
      setChangingPassword(false);
    }
  };

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isPatient) {
      clinicalApi.getRiskStats()
        .then(d => { if (isMounted && d) setRiskStats(d); })
        .catch(console.error);
    }
    return () => { isMounted = false; };
  }, [isPatient]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    window.location.href = '/login';
  };
  const rb = roleMap[user?.role] || roleMap.Patient;
  const total = riskStats.low + riskStats.medium + riskStats.high;

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        gender: parseInt(editForm.gender),
        dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString() : null
      });
      setUser({
        ...user,
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        gender: parseInt(editForm.gender),
        dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString() : null
      });
      setIsEditing(false);
    } catch (err) {
      notification.error(err.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notification.error('Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await authApi.uploadAvatar(file);
      // Construct full URL if needed, depending on how backend sends it. Usually just the path is fine.
      const baseUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
        : '';
        
      setUser({
        ...user,
        avatarUrl: result.avatarUrl // We store the raw path in the context
      });
      notification.success('Đã cập nhật ảnh đại diện');
    } catch (error) {
      notification.error(error.message || 'Không thể tải lên ảnh đại diện');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const stats = [
    { label: 'Tổng suy luận', value: total, border: 'border-t-cyan-500', color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: TrendingUp },
    { label: 'Nguy cơ cao', value: riskStats.high, border: 'border-t-red-500', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
    { label: 'Nguy cơ vừa', value: riskStats.medium, border: 'border-t-amber-500', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Activity },
    { label: 'Nguy cơ thấp', value: riskStats.low, border: 'border-t-teal-500', color: 'text-teal-400', bg: 'bg-teal-500/10', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* PROFILE CARD */}
      <div className="animate-fade-in">
        <div className="h-32 rounded-t-2xl bg-gradient-to-br from-cyan-500/10 via-midnight-200 to-purple-500/8 border border-cyan-500/6 border-b-0 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-cyan-500/[0.04] rounded-full" />
          <div className="absolute bottom-0 left-12 w-20 h-20 bg-teal-500/[0.04] rounded-full" />
        </div>

        <div className="glass-card-elevated rounded-b-2xl border-t-0 -mt-1">
          <div className="flex flex-col items-center px-6 pb-8">
            {/* Avatar */}
            <div className="-mt-12 mb-5 relative group">
              <div className="relative w-24 h-24 rounded-3xl gradient-cyan-teal p-[2px] shadow-glow-cyan overflow-hidden">
                <div className="w-full h-full bg-midnight rounded-[22px] overflow-hidden flex items-center justify-center relative">
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}${user.avatarUrl}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center text-cyan-400 text-3xl font-bold select-none">
                      {getInitials(user?.fullName, user?.email)}
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                  >
                    {uploadingAvatar ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-[10px] text-white/90 font-medium">Thay đổi</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
            </div>

            {isEditing ? (
              <div className="w-full max-w-md space-y-4 mt-2">
                <Input label="Họ và tên" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} icon={<User size={16} />} />
                <Input label="Số điện thoại" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} icon={<Phone size={16} />} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-glass-400 mb-1.5 ml-1">Giới tính</label>
                    <select 
                      className="w-full h-11 bg-midnight-50 border border-cyan-500/20 rounded-xl px-4 text-sm text-glass-100 focus:border-cyan-500 outline-none transition-all"
                      value={editForm.gender} 
                      onChange={e => setEditForm({...editForm, gender: e.target.value})}
                    >
                      <option value={1}>Nam</option>
                      <option value={0}>Nữ</option>
                    </select>
                  </div>
                  <Input type="date" label="Ngày sinh" value={editForm.dateOfBirth} onChange={e => setEditForm({...editForm, dateOfBirth: e.target.value})} icon={<Calendar size={16} />} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 flex justify-center gap-2" onClick={() => setIsEditing(false)}>
                    <X size={16} /> Hủy
                  </Button>
                  <Button className="flex-1 flex justify-center gap-2" onClick={handleSave} disabled={saving}>
                    {saving ? <Spinner size="sm" /> : <Save size={16} />} Lưu thay đổi
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-glass-50">{user?.fullName || 'Người dùng'}</h2>
                <p className="text-glass-400 text-sm mt-1 flex items-center gap-1.5"><Mail size={14} />{user?.email}</p>
                <div className="mt-3"><Badge variant={rb.variant} pulse>{rb.label}</Badge></div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/15">
                    <Calendar size={14} /> {user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Chưa cập nhật ngày sinh'}
                  </span>
                  {user?.phoneNumber && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500/10 text-teal-400 rounded-full text-sm font-medium border border-teal-500/15">
                      <Phone size={14} /> {user.phoneNumber}
                    </span>
                  )}
                  {isPatient && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium border border-purple-500/15">
                      <Activity size={14} /> {checkups.length} lượt khám
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditing(true)}>
                    <Edit2 size={15} /> Chỉnh sửa
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleOpenPasswordModal}>
                    <Key size={15} /> Đổi mật khẩu
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2 !text-red-400 hover:!bg-red-500/10">
                    <LogOut size={15} /> Đăng xuất
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isPatient && (
        <>
          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in stagger-1">
            {stats.map(s => (
              <div key={s.label} className={`glass-card rounded-2xl border-t-2 ${s.border} p-4 text-center`}>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-glass-500 text-xs font-medium mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* TIMELINE */}
          <Card header={<span className="text-sm font-semibold text-glass-200 flex items-center gap-2"><Stethoscope size={16} className="text-cyan-400" />Lịch sử khám bệnh</span>} className="animate-fade-in stagger-2">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner text="Đang tải..." /></div>
            ) : checkups.length > 0 ? (
              <div className="space-y-3">
                {checkups.map((c, i) => (
                  <Link key={c.id} to={`/result/${c.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-midnight-100/30 hover:bg-midnight-200/40 border border-transparent hover:border-cyan-500/10 transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-glass-200">Lượt khám #{checkups.length - i}</p>
                        <p className="text-xs text-glass-500">{new Date(c.date || c.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Xem <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-glass-600 mx-auto mb-3" />
                <p className="text-glass-500 text-sm mb-4">Chưa có lịch sử khám.</p>
                <Link to="/clinical-form"><Button>Tạo lượt khám đầu tiên</Button></Link>
              </div>
            )}
          </Card>
        </>
      )}

      {/* CHANGE PASSWORD MODAL */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Đổi mật khẩu tài khoản">
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl animate-fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}
          {passwordSuccess && (
            <div className="flex items-center gap-2 p-3.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm rounded-xl animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <Input
            type="password"
            label="Mật khẩu cũ"
            placeholder="Nhập mật khẩu hiện tại"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
            icon={<Lock size={16} />}
            required
          />

          <Input
            type="password"
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            icon={<Lock size={16} />}
            required
          />

          <Input
            type="password"
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            icon={<Lock size={16} />}
            required
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 flex justify-center gap-2"
              onClick={() => setShowPasswordModal(false)}
            >
              <X size={16} /> Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 flex justify-center gap-2"
              loading={changingPassword}
            >
              <Save size={16} /> Xác nhận
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        variant="logout"
      />
    </div>
  );
};
export default ProfilePage;
