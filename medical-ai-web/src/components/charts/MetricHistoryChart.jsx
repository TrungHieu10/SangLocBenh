import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { translateFeature } from '../../utils/formatMetric';
import { REFERENCE_RANGES, convertDbToDisplay } from '../../utils/referenceRanges';

const METRIC_OPTIONS = [
  { value: 'BloodGlucose', label: 'Đường huyết (mmol/L)' },
  { value: 'HbA1c', label: 'HbA1c (%)' },
  { value: 'Cholesterol_Total', label: 'Cholesterol (mmol/L)' },
  { value: 'SystolicBP', label: 'Huyết áp tâm thu (mmHg)' },
  { value: 'DiastolicBP', label: 'Huyết áp tâm trương (mmHg)' },
  { value: 'ALT_SGPT', label: 'Men gan ALT (U/L)' },
  { value: 'AST_SGOT', label: 'Men gan AST (U/L)' },
  { value: 'SerumCreatinine', label: 'Creatinine (µmol/L)' },
];

export const MetricHistoryChart = ({ checkups = [], loading = false }) => {
  const [selectedMetric, setSelectedMetric] = useState(METRIC_OPTIONS[0].value);

  const chartData = useMemo(() => {
    // Chỉ lấy các lượt khám đã Reviewed và đảo ngược mảng để sắp xếp từ cũ đến mới (trái qua phải)
    const validCheckups = checkups
      .filter(c => c.status === 'Reviewed' && c.metrics)
      .slice()
      .reverse();

    return validCheckups.map((c, i) => {
      const metricsObj = c.metrics || {};
      const metricKey = Object.keys(metricsObj).find(k => k.toLowerCase() === selectedMetric.toLowerCase());
      const rawValue = metricKey ? metricsObj[metricKey] : null;

      return {
        date: new Date(c.date || c.createdAt).toLocaleDateString('vi-VN'),
        value: convertDbToDisplay(selectedMetric, rawValue) || 0,
        label: `Lần ${i + 1}`
      };
    });
  }, [checkups, selectedMetric]);

  const normalizedKey = Object.keys(REFERENCE_RANGES).find(k => k.toLowerCase() === selectedMetric.toLowerCase());
  const ranges = normalizedKey ? REFERENCE_RANGES[normalizedKey] : null;
  let safeZone = null;
  if (ranges && (ranges.min !== undefined || ranges.max !== undefined)) {
    safeZone = {
      min: ranges.min !== undefined ? ranges.min : 0,
      max: ranges.max !== undefined ? ranges.max : (ranges.min * 2 || 100)
    };
  }

  if (loading) return (
    <Card header={<div className="font-semibold text-glass-200 text-sm">Diễn biến chỉ số xét nghiệm</div>}>
      <div className="h-[300px] flex items-center justify-center"><Spinner text="Đang tải..." /></div>
    </Card>
  );

  return (
    <Card header={
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
        <span className="font-semibold text-glass-200 text-sm">Diễn biến chỉ số xét nghiệm</span>
        <select 
          className="bg-midnight-200 text-xs text-glass-200 border border-cyan-500/20 rounded-lg px-2 py-1.5 outline-none focus:border-cyan-500 transition-colors"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          {METRIC_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    }>
      <div className="p-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,212,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(13,27,42,0.95)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  color: '#F8FAFC',
                }}
                labelStyle={{ color: '#94A3B8' }}
                formatter={(v) => [v, translateFeature(selectedMetric)]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00D4FF" 
                name={translateFeature(selectedMetric)} 
                strokeWidth={2.5}
                isAnimationActive={false}
                dot={{ r: 4, strokeWidth: 2, fill: '#0d1b2a' }} 
                activeDot={{ r: 6, fill: '#00D4FF', stroke: '#0d1b2a', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-glass-500">
            <p className="mb-2 text-sm">Chưa có đủ lịch sử xét nghiệm (Đã được Bác sĩ phân tích).</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricHistoryChart;
