/**
 * Card — Glass card with cyan glow border accents
 */
export const Card = ({
  children, className = '', header, footer,
  hover = false, glow = false, noPadding = false,
}) => {
  return (
    <div className={`
      glass-card rounded-2xl overflow-hidden transition-all duration-300
      ${hover ? 'hover:border-cyan-500/20 hover:shadow-glow-cyan hover:-translate-y-0.5 cursor-pointer' : ''}
      ${glow ? 'animate-glow-pulse' : ''}
      ${className}
    `}>
      {header && (
        <div className="px-6 py-4 border-b border-cyan-500/8 flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-gradient-cyan-teal flex-shrink-0" />
          <div className="flex-1 min-w-0">{header}</div>
        </div>
      )}
      <div className={noPadding ? '' : 'px-6 py-5'}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-cyan-500/8 bg-midnight-100/30">{footer}</div>
      )}
    </div>
  );
};
export default Card;
