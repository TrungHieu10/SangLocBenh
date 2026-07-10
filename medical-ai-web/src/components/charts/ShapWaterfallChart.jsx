/**
 * ShapWaterfallChart — Dark themed SHAP feature importance
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { translateFeature } from '../../utils/formatMetric';

export const ShapWaterfallChart = ({ shapValues = [], loading = false }) => {
  const headerText = <span className="font-semibold text-glass-200 text-sm">SHAP — Mức độ ảnh hưởng đặc trưng</span>;

  if (loading) return (
    <Card header={headerText}><div className="h-[350px] flex items-center justify-center"><Spinner text="Đang phân tích..." /></div></Card>
  );

  if (!shapValues?.length) return (
    <Card header={headerText}><div className="h-[350px] flex items-center justify-center text-glass-500">Chưa có dữ liệu</div></Card>
  );

  const chartData = shapValues.slice(0, 10).map((item) => {
    const rawFeature = item.feature || item.feature_name || item.name;
    const rawImpact = item.impact !== undefined ? item.impact : (item.shap_value !== undefined ? item.shap_value : item.value);
    return {
      feature: translateFeature(rawFeature),
      importance: Math.abs(rawImpact || 0),
      impact: (rawImpact || 0) > 0 ? 'Positive' : 'Negative',
    };
  });

  return (
    <Card header={headerText}>
      <div className="p-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,212,255,0.06)" />
            <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis dataKey="feature" type="category" width={140} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(v) => v.toFixed(4)}
              contentStyle={{
                backgroundColor: 'rgba(13,27,42,0.95)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: '12px',
                color: '#F8FAFC',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#94A3B8' }} />
            <Bar dataKey="importance" fill="url(#cyanTealGrad)" name="Điểm quan trọng" radius={[0, 6, 6, 0]} />
            <defs>
              <linearGradient id="cyanTealGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00D4FF" />
                <stop offset="100%" stopColor="#00F5D4" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/8 text-sm text-glass-300 flex items-start gap-3">
        <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div>
          <strong className="block mb-1 text-glass-200">Diễn giải:</strong>
          <span className="text-glass-400">Độ dài thanh cho thấy mức ảnh hưởng — thanh càng dài = ảnh hưởng càng mạnh đến kết quả dự đoán.</span>
        </div>
      </div>
    </Card>
  );
};

export default ShapWaterfallChart;
