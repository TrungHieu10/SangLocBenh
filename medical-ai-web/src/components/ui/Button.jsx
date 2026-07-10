/**
 * Button — Futuristic buttons with glow effects
 */
export const Button = ({
  children, variant = 'primary', size = 'md', disabled = false,
  loading = false, onClick, className = '', type = 'button', ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-teal-500 text-midnight hover:shadow-glow-cyan hover:brightness-110 font-semibold',
    secondary: 'bg-midnight-200/60 border border-cyan-500/10 text-glass-300 hover:bg-midnight-200 hover:text-white hover:border-cyan-500/20',
    danger: 'bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:text-red-300',
    success: 'bg-teal-500/15 border border-teal-500/20 text-teal-400 hover:bg-teal-500/25 hover:text-teal-300',
    outline: 'border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40 bg-transparent',
    ghost: 'text-glass-400 hover:bg-midnight-200/40 hover:text-glass-200 bg-transparent',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-xl font-medium
        transition-all duration-300 active:scale-[0.98]
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-40 cursor-not-allowed !scale-100 !shadow-none' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-80" />
        </svg>
      )}
      {loading ? 'Đang xử lý...' : children}
    </button>
  );
};
export default Button;
