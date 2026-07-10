/**
 * DashboardPage — Dark futuristic medical dashboard
 */
import { useCheckupHistory } from '../hooks/useCheckupHistory';
import { usePredictionHistory } from '../hooks/usePredictionHistory';
import { useAuth } from '../hooks/useAuth';
import HealthTrendChart from '../components/charts/HealthTrendChart';
import MetricHistoryChart from '../components/charts/MetricHistoryChart';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import { ClipboardList, TrendingUp, Calendar, Plus, Activity, Moon, Salad, HeartPulse, Dumbbell, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { checkups, loading: checkupLoading, total, error: checkupError } = useCheckupHistory();
  const { predictions, loading: predictionsLoading, error: predictionsError } = usePredictionHistory();

  const safePredictions = Array.isArray(predictions) ? predictions : [];
  // API trả về sắp xếp tăng dần theo ngày → item mới nhất ở cuối mảng
  const latestPrediction = safePredictions.length > 0 ? safePredictions[safePredictions.length - 1] : null;
  
  const latestRisk = (() => {
    if (!latestPrediction) return null;
    if (latestPrediction.status === 'Pending') return null;
    // Tính từ predictions array (probability)
    if (Array.isArray(latestPrediction.predictions) && latestPrediction.predictions.length) {
      return (Math.max(...latestPrediction.predictions.map(x => x.probability)) * 100).toFixed(1);
    }
    if (latestPrediction.riskScore) {
      return (latestPrediction.riskScore * 100).toFixed(1);
    }
    return null;
  })();

  const lastCheckupDate = checkups[0]
    ? new Date(checkups[0].date || checkups[0].createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  const chartData = safePredictions.map(p => {
    const maxProb = Array.isArray(p.predictions) && p.predictions.length ? Math.max(...p.predictions.map(x => x.probability)) : p.riskScore || 0;
    return {
      date: new Date(p.date || p.createdAt).toLocaleDateString('vi-VN'),
      riskScore: parseFloat((maxProb * 100).toFixed(1)),
      healthScore: parseFloat(((1 - maxProb) * 100).toFixed(1)),
    };
  });

  const healthTips = [
    { icon: Moon, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Ngủ đủ giấc', desc: 'Ngủ 7-9 tiếng mỗi ngày giúp phục hồi năng lượng và tăng cường miễn dịch.' },
    { icon: Dumbbell, color: 'text-cyan-400', bg: 'bg-cyan-500/10', title: 'Tập thể dục', desc: 'Ít nhất 150 phút vận động vừa phải mỗi tuần để bảo vệ tim mạch.' },
    { icon: Salad, color: 'text-teal-400', bg: 'bg-teal-500/10', title: 'Ăn cân bằng', desc: 'Bổ sung rau xanh, trái cây tươi và ngũ cốc nguyên hạt hằng ngày.' },
  ];

  const statCards = [
    { label: 'Tổng lượt khám', value: total || 0, suffix: '', icon: ClipboardList, color: 'text-cyan-400', border: 'border-t-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Nguy cơ gần nhất', value: latestPrediction?.status === 'Pending' ? 'Chờ KQ' : (latestRisk ?? 'N/A'), suffix: latestRisk ? '%' : '', icon: TrendingUp, color: 'text-amber-400', border: 'border-t-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Lần khám cuối', value: lastCheckupDate ?? 'Chưa có', suffix: '', icon: Calendar, color: 'text-purple-400', border: 'border-t-purple-500', bg: 'bg-purple-500/10' },
  ];

  if (checkupError || predictionsError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-glass-50">Đã xảy ra lỗi</h2>
        <p className="text-glass-400 max-w-md text-center">
          {checkupError || predictionsError || 'Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.'}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WELCOME BANNER */}
      <section className="relative overflow-hidden glass-card rounded-2xl p-8 md:p-10 animate-fade-in gradient-banner">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 -mb-14 w-40 h-40 bg-teal-500/[0.04] rounded-full blur-2xl pointer-events-none" />
        <HeartPulse className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 text-cyan-500/[0.06] hidden md:block" strokeWidth={1} />

        <div className="relative z-10">
          <p className="text-glass-500 text-sm font-medium mb-1">Bảng điều khiển sức khỏe</p>
          <h1 className="text-2xl md:text-3xl font-bold text-glass-50 mb-2">
            Xin chào, {user?.fullName || 'bạn'}! 👋
          </h1>
          <p className="text-glass-400 text-sm max-w-lg">Theo dõi sức khỏe và kết quả khám của bạn tại đây.</p>
        </div>
      </section>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-1">
        {statCards.map(s => (
          <div key={s.label} className={`glass-card rounded-2xl border-t-2 ${s.border} p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-[18px] h-[18px] ${s.color}`} />
              </div>
              <span className="text-glass-500 text-xs font-medium uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-glass-50">{s.value}<span className="text-lg text-glass-400">{s.suffix}</span></p>
          </div>
        ))}

        {/* CTA card */}
        <Link to="/clinical-form" className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/15 hover:border-cyan-500/30 hover:shadow-glow-cyan transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl gradient-cyan-teal flex items-center justify-center shadow-glow-cyan/20">
              <Plus className="w-[18px] h-[18px] text-midnight" />
            </div>
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse-soft" />
          </div>
          <p className="text-lg font-bold text-gradient">Khám mới</p>
          <p className="text-glass-500 text-xs mt-1">Bắt đầu phân tích AI →</p>
        </Link>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in stagger-2">
        {/* Left: Chart + History */}
        <div className="lg:col-span-2 space-y-6">
          {predictionsLoading ? (
            <div className="flex justify-center py-20"><Spinner text="Đang tải biểu đồ..." /></div>
          ) : chartData.length > 0 ? (
            <div className="space-y-6">
              <Card header={<span className="text-sm font-semibold text-glass-200">Xu hướng sức khỏe (AI)</span>}>
                <HealthTrendChart data={chartData} />
              </Card>
              <MetricHistoryChart checkups={checkups} loading={checkupLoading} />
            </div>
          ) : null}

          <Card header={
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-semibold text-glass-200">Lịch sử khám gần đây</span>
              {checkups.length > 0 && (
                <Link to="/profile" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors">
                  Xem tất cả <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          }>
            {checkupLoading ? (
              <div className="flex justify-center py-12"><Spinner text="Đang tải..." /></div>
            ) : checkups.length > 0 ? (
              <div className="space-y-2">
                {checkups.slice(0, 5).map((c, i) => (
                  <Link key={c.id} to={`/result/${c.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-midnight-100/30 hover:bg-midnight-200/40 border border-transparent hover:border-cyan-500/10 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">
                        {checkups.length - i}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-glass-200">Lượt khám #{checkups.length - i}</p>
                        <p className="text-xs text-glass-500">{new Date(c.date || c.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-glass-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="Chưa có dữ liệu khám"
                description="Bắt đầu lượt khám đầu tiên để theo dõi sức khỏe của bạn."
                actionLabel="Tạo lượt khám đầu tiên"
                actionLink="/clinical-form"
              />
            )}
          </Card>
        </div>

        {/* Right: Tips */}
        <div className="space-y-6">
          <Card header={<span className="text-sm font-semibold text-glass-200">Mẹo sức khỏe</span>}>
            <div className="space-y-4">
              {healthTips.map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-xl ${tip.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <tip.icon className={`w-[18px] h-[18px] ${tip.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-glass-200 mb-0.5">{tip.title}</p>
                    <p className="text-xs text-glass-500 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-cyan-500/6 text-center">
              <p className="text-xs text-glass-500 flex items-center justify-center gap-1.5">
                <HeartPulse className="w-3 h-3 text-cyan-400" />
                Sức khỏe là tài sản quý giá nhất
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
