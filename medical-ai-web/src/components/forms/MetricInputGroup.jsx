/**
 * MetricInputGroup — Dark themed metric input group
 */
import { Activity } from 'lucide-react';
import Input from '../ui/Input';

export const MetricInputGroup = ({ title, icon: Icon = Activity, metrics = [], values = {}, onChange, errors = {} }) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-glow-cyan/20">
          <Icon className="w-[18px] h-[18px] text-midnight" />
        </div>
        <h3 className="text-base font-semibold text-glass-100">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
        {metrics.map((metric) => (
          <Input
            key={metric.name}
            label={metric.label}
            type={metric.type || 'number'}
            placeholder={metric.placeholder}
            value={values[metric.name] !== undefined ? values[metric.name] : ''}
            onChange={(val) => {
              if (metric.type === 'checkbox') onChange(metric.name, val);
              else onChange(metric.name, val.target.value);
            }}
            error={errors[metric.name]}
            required={metric.required}
            step={metric.step || '0.1'}
            options={metric.options}
            addonRight={
              metric.units ? (
                <select
                  value={metric.selectedUnit || metric.units[0]}
                  onChange={(e) => metric.onUnitChange && metric.onUnitChange(metric.name, e.target.value)}
                  className="w-full h-[44px] border border-cyan-500/10 bg-midnight-100/40 text-glass-300 rounded-xl px-2 focus:outline-none focus:border-cyan-500/30 cursor-pointer text-sm transition-colors"
                >
                  {metric.units.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              ) : null
            }
          />
        ))}
      </div>
    </div>
  );
};
export default MetricInputGroup;
