/**
 * HealthTrendChart — Dark themed health trend chart
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

export const HealthTrendChart = ({ data = [], loading = false }) => {
  if (loading) return (
    <Card header={<div className="font-semibold text-glass-200 text-sm">Xu hướng sức khỏe</div>}>
      <div className="h-[300px] flex items-center justify-center"><Spinner text="Đang tải..." /></div>
    </Card>
  );

  if (!data?.length) return (
    <Card header={<div className="font-semibold text-glass-200 text-sm">Xu hướng sức khỏe</div>}>
      <div className="h-[300px] flex items-center justify-center text-glass-500">Chưa có dữ liệu</div>
    </Card>
  );

  return (
    <Card header={<div className="font-semibold text-glass-200 text-sm">Xu hướng sức khỏe theo thời gian</div>}>
      <div className="p-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,212,255,0.06)" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(13,27,42,0.95)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                color: '#F8FAFC',
              }}
              labelStyle={{ color: '#94A3B8' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#94A3B8' }} />
            <Line type="monotone" dataKey="riskScore" stroke="#ef4444" name="Điểm nguy cơ" strokeWidth={2.5} isAnimationActive={false}
              dot={{ r: 3, strokeWidth: 2, fill: '#0d1b2a' }} activeDot={{ r: 5, fill: '#ef4444', stroke: '#0d1b2a', strokeWidth: 2 }} />
            <Line type="monotone" dataKey="healthScore" stroke="#00F5D4" name="Điểm sức khỏe" strokeWidth={2.5} isAnimationActive={false}
              dot={{ r: 3, strokeWidth: 2, fill: '#0d1b2a' }} activeDot={{ r: 5, fill: '#00F5D4', stroke: '#0d1b2a', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default HealthTrendChart;
