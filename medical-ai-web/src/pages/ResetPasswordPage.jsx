import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, HeartPulse } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('Mã liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!token) {
      setErrorMsg('Mã xác nhận khôi phục mật khẩu không tồn tại.');
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các trường.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPasswordWithToken(token, password);
      setSuccessMsg(response.message || 'Mật khẩu đã được khôi phục thành công!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight p-6 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-20 left-16 w-56 h-56 rounded-full bg-cyan-500/[0.04] animate-float" />
      <div className="absolute bottom-32 right-10 w-40 h-40 rounded-full bg-teal-500/[0.04] animate-float" style={{ animationDelay: '1s' }} />

      <div className="glass-card-elevated rounded-2xl p-8 w-full max-w-[420px] animate-scale-in relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-cyan-teal shadow-glow-cyan/20 mb-4">
            <HeartPulse className="w-6 h-6 text-midnight" />
          </div>
          <h2 className="text-2xl font-bold text-glass-50 mb-1.5">Đặt lại mật khẩu</h2>
          <p className="text-glass-500 text-sm">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 flex items-start gap-3 animate-scale-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl p-3.5 flex items-start gap-3 animate-scale-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="Mật khẩu mới"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            icon={<Lock size={16} />}
            required
            disabled={loading || !token || !!successMsg}
          />

          <Input
            type="password"
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            icon={<Lock size={16} />}
            required
            disabled={loading || !token || !!successMsg}
          />

          <Button type="submit" className="w-full flex justify-center gap-2" loading={loading} disabled={!token || !!successMsg}>
            Xác nhận mật khẩu mới
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-cyan-400 font-medium hover:text-cyan-300 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
