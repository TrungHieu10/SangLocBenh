/**
 * Badge — Glowing status pills
 */
export const Badge = ({ children, variant = 'default', className = '', pulse = false }) => {
  const variants = {
    default: 'bg-glass-600/30 text-glass-300 border-glass-500/20',
    primary: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    success: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/15 text-red-400 border-red-500/20',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  };

  const pulseColors = {
    default: 'bg-glass-400', primary: 'bg-cyan-400', success: 'bg-teal-400',
    warning: 'bg-amber-400', danger: 'bg-red-400', info: 'bg-sky-400',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full
      text-xs font-semibold tracking-wide border transition-all duration-300
      ${variants[variant]} ${className}
    `}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColors[variant]}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pulseColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};
export default Badge;
