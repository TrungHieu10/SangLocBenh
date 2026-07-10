/**
 * ConfirmDialog — Glassmorphism confirmation dialog to replace window.confirm()
 */
import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, LogOut, ShieldAlert, X } from 'lucide-react';
import Button from './Button';

const iconMap = {
  danger: Trash2,
  warning: AlertTriangle,
  logout: LogOut,
  info: ShieldAlert,
};

const variantStyles = {
  danger: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    confirmVariant: 'danger',
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    confirmVariant: 'primary',
  },
  logout: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    confirmVariant: 'danger',
  },
  info: {
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    confirmVariant: 'primary',
  },
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'warning', // danger | warning | logout | info
  loading = false,
}) => {
  const dialogRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // Lock body scroll & trap focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      cancelBtnRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const style = variantStyles[variant] || variantStyles.warning;
  const Icon = iconMap[variant] || AlertTriangle;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-midnight/80 backdrop-blur-sm animate-fade-in" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative glass-card-elevated rounded-2xl shadow-glass-lg w-full max-w-sm animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-glass-500 hover:text-glass-200 hover:bg-midnight-200/50 transition-all"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-6 pb-5 text-center">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-7 h-7 ${style.iconColor}`} />
          </div>

          {/* Title */}
          <h3 id="confirm-dialog-title" className="text-lg font-bold text-glass-50 mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-glass-400 leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            ref={cancelBtnRef}
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={style.confirmVariant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
