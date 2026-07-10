/**
 * Modal — Dark glassmorphism dialog
 */
import { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    }
    return () => { 
      document.body.style.overflow = ''; 
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-midnight/80 backdrop-blur-sm" />
      {/* Modal */}
      <div
        className={`relative glass-card-elevated rounded-2xl shadow-glass-lg w-full max-w-lg animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/8">
            <h3 className="text-lg font-semibold text-glass-50">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-glass-500 hover:text-glass-200 hover:bg-midnight-200/50 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};
export default Modal;
