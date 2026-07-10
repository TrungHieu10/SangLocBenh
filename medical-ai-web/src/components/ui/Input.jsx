/**
 * Input — Dark futuristic input fields with password toggle & strength indicator
 */
import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { level: 0, label: '', color: '' },
    { level: 1, label: 'Yếu', color: 'bg-red-500' },
    { level: 2, label: 'Trung bình', color: 'bg-amber-500' },
    { level: 3, label: 'Khá', color: 'bg-amber-400' },
    { level: 4, label: 'Mạnh', color: 'bg-teal-500' },
    { level: 5, label: 'Rất mạnh', color: 'bg-cyan-500' },
  ];
  return levels[Math.min(score, 5)];
};

export const Input = forwardRef(({
  label, placeholder, type = 'text', value, onChange, error,
  disabled = false, className = '', required = false, icon, options = [],
  addonRight, showStrength = false, ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const effectiveType = isPasswordType && showPassword ? 'text' : type;
  const strength = showStrength && isPasswordType ? getPasswordStrength(value) : null;

  const baseClasses = `
    w-full rounded-xl border bg-midnight-100/40 backdrop-blur-sm
    px-4 py-2.5 text-sm text-glass-50 placeholder:text-glass-500
    transition-all duration-200 focus:outline-none
    ${icon ? 'pl-11' : ''}
    ${isPasswordType ? 'pr-11' : ''}
    ${error
      ? 'border-red-500/30 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10'
      : 'border-cyan-500/10 focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/10 hover:border-cyan-500/20'
    }
    ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
  `;

  if (type === 'checkbox') {
    return (
      <div className="w-full flex flex-col justify-end h-full">
        <div className="flex items-center justify-between px-4 py-[10px] border border-cyan-500/10 rounded-xl bg-midnight-100/40 hover:border-cyan-500/20 transition-colors min-h-[44px]">
          <label className="text-sm font-medium text-glass-300 cursor-pointer flex-1 select-none">
            {label}
            {required && <span className="text-cyan-400 ml-0.5">*</span>}
          </label>
          <button
            type="button" role="switch" aria-checked={value}
            onClick={() => onChange(!value)} disabled={disabled}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30
              ${value ? 'bg-cyan-500' : 'bg-midnight-300'}
              ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition duration-200
              ${value ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-glass-300 mb-1.5">
          {label}
          {required && <span className="text-cyan-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex gap-2 items-end">
        <div className="relative flex-1">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-glass-500">{icon}</div>
          )}
          {type === 'select' ? (
            <select value={value} onChange={onChange} disabled={disabled}
              ref={ref}
              className={`${baseClasses} appearance-none cursor-pointer pr-10 ${className}`} {...props}>
              <option value="" disabled>{placeholder || 'Chọn...'}</option>
              {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
            </select>
          ) : (
            <input type={effectiveType} placeholder={placeholder} value={value} onChange={onChange}
              ref={ref}
              disabled={disabled} className={`${baseClasses} ${className}`} {...props} />
          )}
          {type === 'select' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-glass-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          )}
          {/* Password toggle */}
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-glass-500 hover:text-glass-300 transition-colors"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {addonRight && <div className="flex-shrink-0 w-24">{addonRight}</div>}
      </div>

      {/* Password strength indicator */}
      {strength && strength.level > 0 && (
        <div className="mt-2 space-y-1 animate-fade-in">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-midnight-300'}`} />
            ))}
          </div>
          <p className={`text-xs ${strength.level <= 2 ? 'text-red-400' : strength.level <= 3 ? 'text-amber-400' : 'text-teal-400'}`}>
            Độ mạnh: {strength.label}
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-1.5 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
