/**
 * EmptyState — Reusable empty state component for dashboards and lists
 */
import Button from './Button';

export const EmptyState = ({
  icon: Icon,
  title = 'Không có dữ liệu',
  description,
  actionLabel,
  actionLink,
  actionOnClick,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Decorative circle + icon */}
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-cyan-500/[0.06] flex items-center justify-center border border-cyan-500/[0.08]">
          {Icon && <Icon className="w-9 h-9 text-glass-500" strokeWidth={1.5} />}
        </div>
        <div className="absolute -inset-2 bg-cyan-500/[0.03] rounded-3xl blur-xl -z-10" />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-glass-300 mb-1.5">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-glass-500 max-w-xs leading-relaxed mb-6">{description}</p>
      )}

      {/* Action */}
      {(actionLabel && (actionLink || actionOnClick)) && (
        actionLink ? (
          <a href={actionLink}>
            <Button variant="primary">{actionLabel}</Button>
          </a>
        ) : (
          <Button variant="primary" onClick={actionOnClick}>{actionLabel}</Button>
        )
      )}
    </div>
  );
};

export default EmptyState;
