/**
 * AdminDashboard — Enhanced with activity stats + chart + clickable cards
 */
import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { SkeletonStatCard, SkeletonChart } from '../components/ui/Skeleton';
import adminApi from '../api/adminApi';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Activity, Heart, TrendingUp, Database, Server, Cpu } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart
} from 'recharts';

// Recharts custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-midnight-200/90 backdrop-blur-sm border border-cyan-500/15 rounded-xl px-3 py-2 text-xs shadow-glass">
        <p className="text-glass-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getAllCheckups(1, 500)
    ])
      .then(([statsData, checkupsData]) => {
        setStats(statsData);
        
        // Calculate weekly data (last 7 days including today)
        const checkups = checkupsData.items || [];
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const today = new Date();
        const past7Days = [];
        
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          d.setHours(0, 0, 0, 0);
          past7Days.push(d);
        }

        const calculatedWeeklyData = past7Days.map(date => {
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);
          
          const count = checkups.filter(c => {
            const checkupDate = new Date(c.checkupDate || c.createdAt || c.date);
            return checkupDate >= date && checkupDate < nextDay;
          }).length;

          return {
            name: `${days[date.getDay()]} (${date.getDate()}/${date.getMonth() + 1})`,
            checkups: count,
            users: Math.ceil(count * 0.8) // mockup since we don't fetch users timeline
          };
        });
        
        setWeeklyData(calculatedWeeklyData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="h-8 bg-midnight-200/60 rounded-lg w-48 animate-pulse mb-2" />
          <div className="h-4 bg-midnight-200/60 rounded w-72 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Tổng người dùng', value: stats?.totalUsers || 0,
      icon: Users, color: 'text-cyan-400', border: 'border-t-cyan-500', bg: 'bg-cyan-500/10',
      link: '/admin/users', delta: null
    },
    {
      label: 'Lượt khám', value: stats?.totalCheckups || 0,
      icon: FileText, color: 'text-teal-400', border: 'border-t-teal-500', bg: 'bg-teal-500/10',
      link: '/admin/checkups', delta: null
    },
    {
      label: 'Bác sĩ', value: stats?.doctorsCount || 0,
      icon: Activity, color: 'text-amber-400', border: 'border-t-amber-500', bg: 'bg-amber-500/10',
      link: '/admin/users', delta: null
    },
    {
      label: 'Bệnh nhân', value: stats?.patientsCount || 0,
      icon: Heart, color: 'text-purple-400', border: 'border-t-purple-500', bg: 'bg-purple-500/10',
      link: '/admin/users', delta: null
    },
  ];

  const riskData = [
    { name: 'Thấp', value: stats?.riskStats?.low || 0, fill: '#14b8a6' },
    { name: 'Trung bình', value: stats?.riskStats?.medium || 0, fill: '#f59e0b' },
    { name: 'Cao', value: stats?.riskStats?.high || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-glass-50 mb-2">Quản lý hệ thống</h1>
        <p className="text-glass-400 text-sm">Tổng quan tình hình hoạt động của MedicalAI.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div
            key={c.label}
            onClick={() => c.link && navigate(c.link)}
            className={`glass-card rounded-2xl border-t-2 ${c.border} p-5 ${c.link ? 'cursor-pointer hover:bg-midnight-200/30 transition-colors' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                <c.icon size={20} className={c.color} />
              </div>
              {c.delta && (
                <span className="text-xs font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} /> {c.delta}
                </span>
              )}
            </div>
            <p className="text-glass-500 text-xs font-medium">{c.label}</p>
            <h3 className={`text-2xl font-bold ${c.color} mt-0.5`}>{c.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Checkup trend */}
        <Card header={<span className="font-semibold text-glass-200 text-sm flex items-center gap-2"><TrendingUp size={16} className="text-cyan-400" />Lượt khám trong tuần</span>}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="checkups" name="Lượt khám" stroke="#06b6d4" strokeWidth={2} fill="url(#gradCyan)" dot={{ fill: '#06b6d4', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk distribution */}
        <Card header={<span className="font-semibold text-glass-200 text-sm flex items-center gap-2"><Database size={16} className="text-purple-400" />Phân bố mức độ rủi ro</span>}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Lượt khám" radius={[6, 6, 0, 0]}>
                {riskData.map((entry, index) => (
                  <rect key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI System Info */}
      <Card header={<span className="font-semibold text-glass-200 text-sm flex items-center gap-2"><Cpu size={16} className="text-cyan-400" />Hệ thống AI</span>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-midnight-100/30 rounded-xl border border-cyan-500/6 flex items-start gap-4">
            <div className="shrink-0 p-2.5 bg-cyan-500/10 rounded-xl"><Activity className="text-cyan-400" size={20} /></div>
            <div>
              <h4 className="font-semibold text-glass-200 text-sm">Mô hình Python</h4>
              <p className="text-xs text-glass-400 mt-1">5 mô hình học máy đang hoạt động</p>
            </div>
          </div>
          <div className="p-4 bg-midnight-100/30 rounded-xl border border-teal-500/6 flex items-start gap-4">
            <div className="shrink-0 p-2.5 bg-teal-500/10 rounded-xl"><Database className="text-teal-400" size={20} /></div>
            <div>
              <h4 className="font-semibold text-glass-200 text-sm">Neo4j RAG</h4>
              <p className="text-xs text-glass-400 mt-1">Cơ sở tri thức y khoa kết nối</p>
            </div>
          </div>
          <div className="p-4 bg-midnight-100/30 rounded-xl border border-purple-500/6 flex items-start gap-4">
            <div className="shrink-0 p-2.5 bg-purple-500/10 rounded-xl"><Server className="text-purple-400" size={20} /></div>
            <div>
              <h4 className="font-semibold text-glass-200 text-sm">Tổng suy luận</h4>
              <p className="text-xs text-glass-400 mt-1"><strong className="text-cyan-400">{stats?.totalPredictions || 0}</strong> lượt dự đoán</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
