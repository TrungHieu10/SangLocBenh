/**
 * ErrorBoundary — Catches JS errors in React component tree
 */
import { Component } from 'react';
import { HeartPulse, RefreshCw, Home, AlertOctagon } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-midnight medical-bg p-6">
          <div className="absolute top-1/3 left-1/4 w-56 h-56 bg-red-500/[0.03] rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-cyan-500/[0.03] rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

          <div className="glass-card-elevated rounded-2xl p-10 max-w-md w-full text-center relative animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/15 mb-6">
              <AlertOctagon className="w-8 h-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-glass-100 mb-3">Đã xảy ra lỗi</h1>

            <p className="text-glass-400 text-sm leading-relaxed mb-3">
              Ứng dụng gặp lỗi không mong muốn. Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message || 'Unknown error'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                  bg-gradient-to-r from-cyan-500 to-teal-500 text-midnight
                  hover:shadow-glow-cyan hover:brightness-110 transition-all duration-300 active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" /> Tải lại trang
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                  border border-cyan-500/20 text-glass-300 hover:text-glass-100 hover:border-cyan-500/40
                  transition-all duration-300 active:scale-[0.98]"
              >
                <Home className="w-4 h-4" /> Về trang chủ
              </button>
            </div>

            {/* Branding */}
            <div className="mt-8 flex items-center justify-center gap-2 text-glass-600">
              <HeartPulse className="w-4 h-4" />
              <span className="text-xs font-medium">MedicalAI</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
