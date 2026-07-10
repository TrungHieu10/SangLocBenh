/**
 * Spinner — Futuristic dual-ring loading
 */
export const Spinner = ({ size = 'md', className = '', text }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`relative ${sizes[size] || sizes.md}`}>
        <svg className="absolute inset-0 animate-spin" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="17" stroke="rgba(0,212,255,0.1)" strokeWidth="3" />
          <path d="M20 3a17 17 0 0 1 17 17" stroke="url(#cyanGrad)" strokeWidth="3" strokeLinecap="round" />
          <defs><linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4FF"/><stop offset="100%" stopColor="#00F5D4"/></linearGradient></defs>
        </svg>
        <svg className="absolute inset-0 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="10" stroke="rgba(0,245,212,0.08)" strokeWidth="2.5" />
          <path d="M20 10a10 10 0 0 0-10 10" stroke="#00F5D4" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
      {text && <p className={`text-glass-400 font-medium ${textSizes[size]}`}>{text}</p>}
    </div>
  );
};
export default Spinner;
