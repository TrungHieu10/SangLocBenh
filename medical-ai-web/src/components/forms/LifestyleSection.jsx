/**
 * LifestyleSection Component - Nhập thông tin lối sống (glassmorphism design)
 */
import { Heart } from 'lucide-react';
import Input from '../ui/Input';

export const LifestyleSection = ({
  values = {},
  onChange,
  errors = {},
}) => {
  const lifestyleMetrics = [
    {
      name: 'sleepHours',
      label: 'Số giờ ngủ mỗi ngày',
      placeholder: 'VD: 7',
      type: 'number',
      step: '0.5',
    },
    {
      name: 'exerciseMinutes',
      label: 'Phút tập thể dục mỗi tuần',
      placeholder: 'VD: 150',
      type: 'number',
    },
    {
      name: 'stressLevel',
      label: 'Mức độ căng thẳng (1-10)',
      placeholder: 'VD: 5',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'smokingStatus',
      label: 'Tình trạng hút thuốc',
      placeholder: 'VD: Không/Đã bỏ/Đang hút',
      type: 'text',
    },
    {
      name: 'alcoholConsumption',
      label: 'Mức độ uống rượu (đơn vị/tuần)',
      placeholder: 'VD: 5',
      type: 'number',
    },
    {
      name: 'fruitsVegetablesServings',
      label: 'Khẩu phần rau củ quả (phần/ngày)',
      placeholder: 'VD: 5',
      type: 'number',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-glow-cyan/20">
          <Heart className="w-4.5 h-4.5 text-midnight" />
        </div>
        <h3 className="text-lg font-semibold text-glass-100">
          Thông tin lối sống
        </h3>
      </div>

      {/* Input grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lifestyleMetrics.map((metric) => (
          <Input
            key={metric.name}
            label={metric.label}
            type={metric.type}
            placeholder={metric.placeholder}
            value={values[metric.name] || ''}
            onChange={(e) => onChange(metric.name, e.target.value)}
            error={errors[metric.name]}
            step={metric.step}
            min={metric.min}
            max={metric.max}
          />
        ))}
      </div>
    </div>
  );
};

export default LifestyleSection;
