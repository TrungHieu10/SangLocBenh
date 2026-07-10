/**
 * DoctorDashboard — Enhanced with patient search + disease translation
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SkeletonStatCard, SkeletonTable } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import doctorApi from '../api/doctorApi';
import { formatDate } from '../utils/formatMetric';
import { FileText, ChevronRight, Filter, CheckCircle2, Search, Users } from 'lucide-react';

// Dịch tên bệnh sang tiếng Việt
const DISEASE_VN = {
  stroke: 'Đột quỵ',
  diabetes: 'Tiểu đường',
  hypertension: 'Cao huyết áp',
  heart_disease: 'Bệnh tim',
  'heart disease': 'Bệnh tim',
  kidney_disease: 'Bệnh thận',
  'kidney disease': 'Bệnh thận',
  liver_disease: 'Bệnh gan',
  'liver disease': 'Bệnh gan',
  anemia: 'Thiếu máu',
  obesity: 'Béo phì',
};

const translateDisease = (name) => {
  if (!name) return 'Chưa xác định';
  const key = name.toLowerCase().replace(/_/g, ' ');
  return DISEASE_VN[key] || DISEASE_VN[name.toLowerCase()] || name;
};

const PAGE_SIZE = 10;

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [checkups, setCheckups] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewed: 0 });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setIsFetching(true);
      doctorApi.getCheckups(currentPage, PAGE_SIZE, filter, searchQuery)
        .then(d => {
          setCheckups(d.items || []);
          setTotalItems(d.total || 0);
          if (d.stats) {
            setStats({
              total: d.stats.total || 0,
              pending: d.stats.pending || 0,
              reviewed: d.stats.reviewed || 0
            });
          }
        })
        .catch(console.error)
        .finally(() => {
          setIsFetching(false);
          setInitialLoading(false);
        });
    }, 500); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, filter, searchQuery]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  // Reset to page 1 when filter/search changes
  useEffect(() => { setCurrentPage(1); }, [filter, searchQuery]);

  if (initialLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
        </div>
        <div className="glass-card rounded-2xl p-5">
          <SkeletonTable rows={6} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-glass-50 mb-2">Danh sách bệnh nhân chờ khám</h1>
          <p className="text-glass-400 text-sm">Quản lý, phân tích hồ sơ và đưa ra lời khuyên y khoa.</p>
        </div>
        {/* Filter tabs */}
        <div className="flex bg-midnight-200/50 p-1 rounded-xl border border-cyan-500/10">
          {[
            { key: 'all', label: 'Tất cả', activeClass: 'bg-cyan-500/20 text-cyan-400' },
            { key: 'pending', label: 'Chờ phân tích', activeClass: 'bg-amber-500/20 text-amber-400' },
            { key: 'reviewed', label: 'Đã phân tích', activeClass: 'bg-teal-500/20 text-teal-400' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === tab.key ? tab.activeClass : 'text-glass-400 hover:text-glass-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl border-t-2 border-t-cyan-500 p-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <FileText size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-glass-500 text-xs font-medium">Tổng hồ sơ</p>
              <h3 className="text-2xl font-bold text-cyan-400">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl border-t-2 border-t-amber-500 p-5 cursor-pointer hover:bg-midnight-200/30 transition-colors" onClick={() => setFilter('pending')}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Filter size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-glass-500 text-xs font-medium">Cần phân tích</p>
              <h3 className="text-2xl font-bold text-amber-400">{stats.pending}</h3>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl border-t-2 border-t-teal-500 p-5 cursor-pointer hover:bg-midnight-200/30 transition-colors" onClick={() => setFilter('reviewed')}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-teal-400" />
            </div>
            <div>
              <p className="text-glass-500 text-xs font-medium">Đã hoàn thành</p>
              <h3 className="text-2xl font-bold text-teal-400">{stats.reviewed}</h3>
            </div>
          </div>
        </div>
      </div>

      <Card>
        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-glass-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email bệnh nhân..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cyan-500/10 bg-midnight-100/40 text-sm text-glass-100 placeholder:text-glass-500 focus:outline-none focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/10 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto relative">
          {isFetching && (
            <div className="absolute inset-0 bg-midnight/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/8 text-glass-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Bệnh nhân</th>
                <th className="pb-3 font-medium">Ngày khám</th>
                <th className="pb-3 font-medium">Cảnh báo (AI)</th>
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/6">
              {checkups.map((item) => (
                <tr key={item.id} className="hover:bg-midnight-200/30 transition-colors group cursor-pointer" onClick={() => navigate(`/result/${item.id}`)}>
                  <td className="py-4">
                    <div className="font-semibold text-glass-200 text-sm">{item.patientName}</div>
                    <div className="text-xs text-glass-500">{item.patientAge} tuổi • {item.patientGender === 1 ? 'Nam' : 'Nữ'}</div>
                  </td>
                  <td className="py-4 text-glass-400 text-sm">{formatDate(item.checkupDate)}</td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {typeof item.predictions === 'string' ? (
                        <Badge variant="secondary" className="text-[10px]">{item.predictions}</Badge>
                      ) : Array.isArray(item.predictions) ? (
                        item.predictions.slice(0, 3).map((pred, idx) => (
                          <Badge
                            key={idx}
                            variant={pred.riskLevel === 'High' ? 'danger' : pred.riskLevel === 'Medium' ? 'warning' : 'success'}
                            className="text-[10px]"
                          >
                            {translateDisease(pred.disease || pred.diseaseType)} ({pred.riskLevel === 'High' ? 'Cao' : pred.riskLevel === 'Medium' ? 'Vừa' : 'Thấp'})
                          </Badge>
                        ))
                      ) : null}
                    </div>
                  </td>
                  <td className="py-4">
                    {item.status === 'Reviewed'
                      ? <Badge variant="success">Đã phân tích</Badge>
                      : <Badge variant="warning" pulse>Chờ xử lý</Badge>
                    }
                  </td>
                  <td className="py-4 text-right">
                    <ChevronRight className="inline-block text-glass-500 group-hover:text-cyan-400 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {checkups.length === 0 && (
            <EmptyState
              icon={Users}
              title={searchQuery ? 'Không tìm thấy bệnh nhân' : 'Chưa có hồ sơ nào'}
              description={searchQuery ? `Không có kết quả cho "${searchQuery}"` : 'Chưa có lượt khám nào được giao cho bạn.'}
            />
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            className="mt-5 border-t border-cyan-500/8 pt-4"
          />
        )}
      </Card>
    </div>
  );
};

export default DoctorDashboard;
