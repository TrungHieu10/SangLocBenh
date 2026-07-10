/**
 * Sidebar — Dark futuristic navigation (responsive)
 * Desktop (lg+): static w-64 sidebar
 * Mobile (<lg): slide-in from left with overlay, controlled by isOpen/onClose
 */
import { useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, Stethoscope, User, LogOut, Settings, Users, FileText, X } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const menuItemsByRole = {
  Patient: [
    { path: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/profile', label: 'Hồ sơ cá nhân', icon: User },
  ],
  Doctor: [
    { path: '/doctor/dashboard', label: 'Bệnh nhân', icon: FileText },
    { path: '/clinical-form', label: 'Nhập dữ liệu', icon: Stethoscope },
    { path: '/profile', label: 'Hồ sơ cá nhân', icon: User },
  ],
  Nurse: [
    { path: '/nurse/dashboard', label: 'Bệnh nhân', icon: FileText },
    { path: '/clinical-form', label: 'Tạo phiếu khám', icon: Stethoscope },
    { path: '/profile', label: 'Hồ sơ cá nhân', icon: User },
  ],
  Admin: [
    { path: '/admin/dashboard', label: 'Hệ thống', icon: Settings },
    { path: '/admin/users', label: 'Người dùng', icon: Users },
    { path: '/admin/checkups', label: 'Lượt khám', icon: FileText },
    { path: '/profile', label: 'Hồ sơ cá nhân', icon: User },
  ],
};

const getInitials = (n) => {
  if (!n) return 'U';
  const p = n.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const roleLabels = { Admin: 'Quản trị viên', Doctor: 'Bác sĩ', Patient: 'Bệnh nhân', Nurse: 'Y tá / KTV' };

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const role = user?.role || 'Patient';
  const items = menuItemsByRole[role] || menuItemsByRole.Patient;

  const isActive = (path) => location.pathname.startsWith(path);

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Xóa tokens khỏi localStorage trước khi reset React state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    logout();
    navigate('/login');
  };

  // Close sidebar on link click (mobile only)
  const handleLinkClick = () => {
    onClose();
  };

  const sidebarContent = (
    <aside className="w-64 sidebar-bg flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={handleLinkClick}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-glow-cyan/30 group-hover:shadow-glow-cyan transition-all duration-300">
            <HeartPulse className="w-[18px] h-[18px] text-midnight" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold text-glass-50 tracking-tight">MedicalAI</h1>
            <p className="text-[10px] text-glass-500 font-medium tracking-wider uppercase">{roleLabels[role] || 'Y tế thông minh'}</p>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-glass-500 hover:text-glass-300 hover:bg-midnight-200/40 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mx-4 border-t border-cyan-500/6" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path === '/clinical-form' && role === 'Nurse' ? '/nurse/dashboard' : item.path}
              onClick={(e) => {
                if (item.path === '/clinical-form' && role === 'Nurse') {
                  e.preventDefault();
                  toast.error('Vui lòng tìm kiếm hoặc tạo bệnh nhân trước khi nhập phiếu khám!');
                  if (location.pathname !== '/nurse/dashboard') {
                    navigate('/nurse/dashboard');
                  }
                }
                handleLinkClick();
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                ${active
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-[3px] border-cyan-400 ml-0'
                  : 'text-glass-400 hover:text-glass-200 hover:bg-white/[0.03] border-l-[3px] border-transparent'
                }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-cyan-400' : 'text-glass-500'}`} strokeWidth={active ? 2 : 1.8} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4">
        <div className="mx-1 mb-3 border-t border-cyan-500/6" />

        {/* User card */}
        <div className="bg-midnight-200/40 rounded-xl p-3 mb-3 border border-cyan-500/6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-cyan-teal text-cyan-400 flex items-center justify-center text-xs font-bold p-[1px] shadow-sm">
              <div className="w-full h-full bg-midnight rounded-[6px] overflow-hidden flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}${user.avatarUrl}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
                    {getInitials(user?.fullName)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-glass-200 font-medium truncate">{user?.fullName || 'Người dùng'}</p>
              <p className="text-[10px] text-glass-500">{roleLabels[role]}</p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-glass-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200">
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        variant="logout"
      />
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — slide-in overlay */}
      <div className="lg:hidden">
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
          />
        )}
        {/* Slide-in panel */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};
export default Sidebar;
