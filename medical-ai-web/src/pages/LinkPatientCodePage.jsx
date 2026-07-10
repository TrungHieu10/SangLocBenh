import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import authApi from '../api/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const LinkPatientCodePage = () => {
  const { user, login } = useAuth(); // We might need to refresh user state
  const navigate = useNavigate();
  const [patientCode, setPatientCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientCode.trim()) {
      toast.error('Vui lòng nhập Mã Y Tế');
      return;
    }

    setLoading(true);
    try {
      await authApi.linkPatientCode(patientCode.trim());
      toast.success('Liên kết Mã Y Tế thành công!');
      window.location.href = '/dashboard'; 
    } catch (err) {
      toast.error(err.message || 'Liên kết thất bại. Vui lòng kiểm tra lại Mã Y Tế.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-midnight items-center justify-center p-6">
      <div className="max-w-md w-full glass-card-elevated p-8 rounded-3xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>

          <h1 className="text-2xl font-bold text-center text-glass-50 mb-3">Liên kết Hồ Sơ Y Tế</h1>
          <p className="text-sm text-glass-400 text-center mb-8 leading-relaxed">
            Để xem kết quả khám bệnh từ phòng khám, vui lòng nhập <strong>Mã Y Tế</strong> mà Y tá đã cung cấp cho bạn.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              icon={<FileText size={18} />}
              type="text"
              placeholder="VD: BN-12345"
              label="Mã Y Tế của bạn"
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
            />

            <div className="space-y-3">
              <Button type="submit" className="w-full h-12 shadow-glow-cyan" loading={loading}>
                Xác nhận liên kết
              </Button>
              <button 
                type="button" 
                onClick={handleSkip}
                className="w-full py-3 text-sm font-medium text-glass-500 hover:text-glass-300 transition-colors"
              >
                Bỏ qua, tôi chưa từng khám ở đây
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LinkPatientCodePage;
