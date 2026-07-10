import { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../api/authApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, HeartPulse } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Vui lòng nhập Email.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      setSuccessMsg(response.message || 'Yêu cầu khôi phục mật khẩu đã được gửi!');
      setEmail('');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi gửi yêu cầu khôi phục mật khẩu.');
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
          <h2 className="text-2xl font-bold text-glass-50 mb-1.5">Quên mật khẩu</h2>
          <p className="text-glass-500 text-sm">
            Nhập email của bạn và chúng tôi sẽ gửi liên kết khôi phục mật khẩu mới.
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
            type="email"
            label="Email đăng ký"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            icon={<Mail size={16} />}
            required
            disabled={loading || !!successMsg}
          />

          <Button type="submit" className="w-full flex justify-center gap-2" loading={loading} disabled={!!successMsg}>
            Gửi liên kết khôi phục
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

export default ForgotPasswordPage;
