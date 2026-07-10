/**
 * RiskGaugeChart — Dark themed risk gauge
 */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { translateDisease } from '../../utils/formatMetric';

export const RiskGaugeChart = ({ riskLevel = 'medium', probability = 50, predictions = [] }) => {
  const data = [
    { name: 'Nguy cơ', value: probability },
    { name: 'An toàn', value: 100 - probability },
  ];

  const riskColors = { low: '#00F5D4', medium: '#f59e0b', high: '#ef4444' };
  const color = riskColors[riskLevel] || riskColors.medium;

  return (
    <Card header={<div className="font-semibold text-glass-200 text-sm">Đánh giá nguy cơ</div>}>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" isAnimationActive={false}>
              <Cell fill={color} />
              <Cell fill="rgba(0,212,255,0.08)" />
            </Pie>
            <Tooltip
              formatter={(v) => `${v}%`}
              contentStyle={{ backgroundColor: 'rgba(13,27,42,0.95)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', color: '#F8FAFC' }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="text-center mt-[-40px] mb-6">
          <p className="text-3xl font-bold" style={{ color }}>{probability}%</p>
          <p className="text-sm text-glass-400 mt-1">
            Mức độ: <span className="font-semibold uppercase" style={{ color }}>{riskLevel === 'low' ? 'Thấp' : riskLevel === 'medium' ? 'Trung bình' : 'Cao'}</span>
          </p>
        </div>

        {predictions?.length > 0 && (
          <div className="mt-4 w-full bg-midnight-100/30 p-4 rounded-xl border border-cyan-500/6">
            <h4 className="text-xs font-semibold text-glass-400 uppercase tracking-wider mb-3">Dự đoán:</h4>
            <ul className="space-y-3">
              {predictions.map((pred, i) => (
                <li key={i} className="flex justify-between items-center text-sm">
                  <span className="text-glass-300 font-medium">{translateDisease(pred.disease)}</span>
                  <Badge variant={pred.probability > 0.7 ? 'danger' : pred.probability > 0.4 ? 'warning' : 'success'}>
                    {(pred.probability * 100).toFixed(1)}%
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskGaugeChart;
