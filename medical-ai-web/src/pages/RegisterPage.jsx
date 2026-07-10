import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import { GoogleLogin } from '@react-oauth/google';
import useAuth from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { HeartPulse, Mail, Lock, Shield, Brain, Activity, User, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '1',
    dateOfBirth: '',
    phoneNumber: '',
    patientCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp!');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.password || !formData.dateOfBirth) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const dob = new Date(formData.dateOfBirth);
    const now = new Date();
    if (dob >= now) {
      toast.error('Ngày sinh phải nhỏ hơn ngày hiện tại');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(
        formData.email,
        formData.password,
        formData.fullName,
        parseInt(formData.gender),
        new Date(formData.dateOfBirth).toISOString(),
        formData.phoneNumber,
        formData.patientCode
      );
      
      // Auto login after register
      await login(formData.email, formData.password);

      if (formData.patientCode) {
        try {
          await authApi.linkPatientCode(formData.patientCode);
        } catch (e) {
          console.error("Lỗi liên kết mã y tế", e);
        }
      }

      toast.success('Đăng ký thành công!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Đã có lỗi xảy ra khi đăng ký!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-midnight">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden medical-bg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/[0.04] rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/[0.04] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
          <div className="relative z-10 w-full flex flex-col items-center justify-center p-12">
            <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/15 rounded-2xl flex items-center justify-center mb-8">
              <HeartPulse size={36} className="text-cyan-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-gradient mb-6 text-center leading-tight">
              MedicalAI
            </h1>
            <p className="text-base text-glass-400 mb-12 text-center max-w-md">
              Bắt đầu hành trình theo dõi và bảo vệ sức khỏe cùng Trí tuệ Nhân tạo.
            </p>

          <div className="space-y-6 w-full max-w-sm">
            <div className="flex items-center gap-4 bg-white/[0.03] border border-cyan-500/8 p-4 rounded-2xl backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Shield size={18} className="text-cyan-400" />
              </div>
              <p className="font-medium text-glass-300 text-sm">Bảo mật dữ liệu y tế tuyệt đối</p>
            </div>
            <div className="flex items-center gap-4 bg-white/[0.03] border border-cyan-500/8 p-4 rounded-2xl backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Brain size={18} className="text-cyan-400" />
              </div>
              <p className="font-medium text-glass-300 text-sm">Dự đoán nguy cơ bệnh sớm</p>
            </div>
            <div className="flex items-center gap-4 bg-white/[0.03] border border-cyan-500/8 p-4 rounded-2xl backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Activity size={18} className="text-cyan-400" />
              </div>
              <p className="font-medium text-glass-300 text-sm">Khuyến nghị sức khỏe cá nhân hóa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 gradient-cyan-teal rounded-2xl flex items-center justify-center mb-4 shadow-glow-cyan">
              <HeartPulse size={28} className="text-midnight" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">MedicalAI</h1>
          </div>

          <div className="glass-card-elevated rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-glass-50 mb-2">Đăng ký tài khoản</h2>
              <p className="text-glass-500 text-sm">Tạo tài khoản để truy cập hệ thống</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <Input
                icon={<User size={18} />}
                type="text"
                name="fullName"
                placeholder="Họ và tên"
                label="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              
              <Input
                icon={<Mail size={18} />}
                type="email"
                name="email"
                placeholder="Nhập địa chỉ email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  icon={<User size={18} />}
                  type="text"
                  name="phoneNumber"
                  placeholder="0912345678"
                  label="Số điện thoại"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                
                <Input
                  icon={<FileText size={18} />}
                  type="text"
                  name="patientCode"
                  placeholder="VD: BN-12345"
                  label="Mã Y Tế (Nếu có)"
                  value={formData.patientCode}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="select"
                  name="gender"
                  label="Giới tính"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { label: 'Nam', value: '1' },
                    { label: 'Nữ', value: '0' }
                  ]}
                  required
                />
                
                <Input
                  icon={<Calendar size={18} />}
                  type="date"
                  name="dateOfBirth"
                  label="Ngày sinh"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                icon={<Lock size={18} />}
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                label="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
              
              <Input
                icon={<Lock size={18} />}
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                label="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <div className="flex items-start gap-2.5">
                <input type="checkbox" id="agree-terms" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-cyan-500/20 bg-midnight-200/40 text-cyan-500 focus:ring-cyan-500/30" />
                <label htmlFor="agree-terms" className="text-xs text-glass-400 leading-relaxed">
                  Tôi đồng ý với <Link to="/terms-of-service" className="text-cyan-400 hover:text-cyan-300 underline">Điều khoản dịch vụ</Link> và <Link to="/privacy-policy" className="text-cyan-400 hover:text-cyan-300 underline">Chính sách bảo mật</Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-12 text-sm mt-2 shadow-glow-cyan"
                loading={loading}
                disabled={!agreedTerms}
              >
                Đăng ký ngay
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-cyan-500/8"></div>
              <span className="px-4 text-xs text-glass-500">Hoặc</span>
              <div className="flex-1 border-t border-cyan-500/8"></div>
            </div>

            {/* Google Login */}
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const userData = await loginWithGoogle(credentialResponse.credential);
                    toast.success('Đăng nhập thành công!');
                    const role = userData?.role || 'Patient';
                    const redirectPath = role === 'Admin' ? '/admin/dashboard' : role === 'Doctor' ? '/doctor/dashboard' : role === 'Nurse' ? '/nurse/dashboard' : '/dashboard';
                    setTimeout(() => {
                      navigate(redirectPath);
                    }, 1000);
                  } catch (err) {
                    toast.error(err.message || 'Đăng nhập Google thất bại');
                  }
                }}
                onError={() => {
                  toast.error('Đăng nhập Google bị hủy hoặc thất bại');
                }}
                shape="pill"
                theme="filled_black"
                size="large"
              />
            </div>

            <div className="mt-8 text-center">
              <p className="text-glass-500 text-sm">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-all">
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
