/**
 * LoginPage — Dark futuristic split-screen login
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuth from '../hooks/useAuth';
import Input from '../components/ui/Input';
import { HeartPulse, Shield, Brain, Activity, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: Shield, text: 'Phân tích sức khỏe chính xác với AI' },
  { icon: Brain, text: 'Dự đoán nguy cơ bệnh sớm' },
  { icon: Activity, text: 'Tư vấn sức khỏe cá nhân hóa' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login, loginWithGoogle, loading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, navigate]);

  const validateForm = () => {
    const e = {};
    if (!identifier) e.identifier = 'Vui lòng nhập email hoặc số điện thoại';
    if (!password) e.password = 'Vui lòng nhập mật khẩu';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ne = validateForm();
    if (Object.keys(ne).length > 0) { setErrors(ne); return; }
    try {
      const userData = await login(identifier, password);
      toast.success('Đăng nhập thành công!');
      const role = userData?.role || 'Patient';
      const redirectPath = role === 'Admin' ? '/admin/dashboard' : role === 'Doctor' ? '/doctor/dashboard' : role === 'Nurse' ? '/nurse/dashboard' : '/dashboard';
      timeoutRef.current = setTimeout(() => { navigate(redirectPath); }, 1500);
    } catch (err) { 
      toast.error(err.message || 'Đăng nhập thất bại.');
    }
  };

  return (
    <div className="min-h-screen flex bg-midnight">
      {/* LEFT */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden medical-bg">
        <div className="absolute top-20 left-16 w-56 h-56 rounded-full bg-cyan-500/[0.04] animate-float" />
        <div className="absolute bottom-32 right-10 w-40 h-40 rounded-full bg-teal-500/[0.04] animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-purple-500/[0.03] animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/15 mb-6">
              <HeartPulse className="w-9 h-9 text-cyan-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-3 tracking-tight">MedicalAI</h1>
            <p className="text-glass-400 text-base max-w-sm leading-relaxed mb-10">
              Hệ thống dự đoán sức khỏe thông minh bằng trí tuệ nhân tạo
            </p>
          </div>

          <div className="space-y-3 w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-left bg-white/[0.03] border border-cyan-500/8 backdrop-blur-sm rounded-xl px-5 py-3.5 hover:bg-white/[0.06] hover:border-cyan-500/15 transition-all duration-300">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-glass-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8">
        <div className="glass-card-elevated rounded-2xl p-8 w-full max-w-[420px] animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-cyan-teal shadow-glow-cyan/20 mb-4">
              <HeartPulse className="w-6 h-6 text-midnight" />
            </div>
            <h2 className="text-2xl font-bold text-glass-50 mb-1">Đăng nhập</h2>
            <p className="text-glass-500 text-sm">Nhập thông tin để truy cập hệ thống</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email / Số điện thoại"
              type="text"
              placeholder="Nhập email hoặc số điện thoại"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); if (errors.identifier) setErrors(p => ({ ...p, identifier: '' })); }}
              error={errors.identifier}
            />

            <div className="relative">
              <div className="absolute top-0 right-0 flex h-5 items-center">
                <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-all">Quên mật khẩu?</Link>
              </div>
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                error={errors.password}
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-1 py-2.5 px-6 rounded-xl font-semibold text-midnight text-sm
                bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-glow-cyan hover:brightness-110
                disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
              {loading ? <div className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                : <><span>Đăng nhập</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-cyan-500/8" /><span className="px-3 text-xs text-glass-500">Hoặc</span><div className="flex-1 border-t border-cyan-500/8" />
          </div>

          <div className="mt-5 flex justify-center">
            <GoogleLogin
              onSuccess={async (cr) => { try { const userData = await loginWithGoogle(cr.credential); toast.success('Đăng nhập thành công!'); const role = userData?.role || 'Patient'; const redirectPath = role === 'Admin' ? '/admin/dashboard' : role === 'Doctor' ? '/doctor/dashboard' : role === 'Nurse' ? '/nurse/dashboard' : '/dashboard'; setTimeout(() => { navigate(redirectPath); }, 1500); } catch (e) { toast.error(e.message || 'Đăng nhập Google thất bại'); } }}
              onError={() => toast.error('Đăng nhập Google thất bại')}
              shape="pill" theme="filled_black" size="large"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-glass-500">Chưa có tài khoản?{' '}
              <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-all">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
