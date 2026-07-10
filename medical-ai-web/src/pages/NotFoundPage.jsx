/**
 * NotFoundPage — 404 Dark futuristic page
 */
import { Link } from 'react-router-dom';
import { HeartPulse, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight medical-bg p-6">
      {/* Floating decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/[0.03] rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-teal-500/[0.03] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="glass-card-elevated rounded-2xl p-10 max-w-md w-full text-center relative animate-fade-in">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-cyan-teal shadow-glow-cyan/20 mb-6">
          <HeartPulse className="w-8 h-8 text-midnight" />
        </div>

        {/* 404 number */}
        <h1 className="text-8xl font-black text-gradient tracking-tighter mb-2">404</h1>

        {/* Title */}
        <h2 className="text-xl font-bold text-glass-100 mb-3">Không tìm thấy trang</h2>

        {/* Description */}
        <p className="text-glass-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. 
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chính.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Home className="w-4 h-4" /> Về trang chủ
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
