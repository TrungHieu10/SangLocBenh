import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import adminApi from '../api/adminApi';
import { formatDate } from '../utils/formatMetric';
import { Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useContext } from 'react';
import { NotificationContext } from '../store/NotificationContext';

export const AdminCheckups = () => {
  const [loading, setLoading] = useState(true);
  const [checkups, setCheckups] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const notification = useContext(NotificationContext);

  const fetchCheckups = async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getAllCheckups(page, pagination.pageSize);
      setCheckups(data.items);
      setPagination(prev => ({ ...prev, page: data.page, total: data.total }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckups(1);
  }, []);

  const handleDeleteCheckup = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDeleteCheckup = async () => {
    try {
      await adminApi.deleteCheckup(deleteConfirm.id);
      setDeleteConfirm({ open: false, id: null });
      fetchCheckups(pagination.page);
      notification.success('Đã xóa lượt khám thành công');
    } catch (err) {
      notification.error(err.message || 'Lỗi khi xóa lượt khám');
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const getRiskBadge = (score) => {
    if (score >= 0.7) return <Badge variant="danger">Nguy cơ cao ({(score * 100).toFixed(1)}%)</Badge>;
    if (score >= 0.4) return <Badge variant="warning">Nguy cơ vừa ({(score * 100).toFixed(1)}%)</Badge>;
    return <Badge variant="success">Nguy cơ thấp ({(score * 100).toFixed(1)}%)</Badge>;
  };

  if (loading && checkups.length === 0) return (
    <div className="space-y-4">
      <div>
        <div className="h-7 bg-midnight-200/60 rounded w-48 animate-pulse mb-1" />
        <div className="h-4 bg-midnight-200/60 rounded w-80 animate-pulse" />
      </div>
      <div className="glass-card rounded-2xl p-5">
        <SkeletonTable rows={8} cols={5} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-glass-50 mb-2">Quản lý Lượt khám</h1>
        <p className="text-glass-400 text-sm">Xem và quản lý tất cả hồ sơ khám bệnh trên hệ thống.</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/8 text-glass-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Bệnh nhân</th>
                <th className="pb-3 font-medium">Ngày khám</th>
                <th className="pb-3 font-medium">Cảnh báo rủi ro</th>
                <th className="pb-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/6">
              {checkups.map((checkup) => (
                <tr key={checkup.id} className="hover:bg-midnight-200/30 transition-colors">
                  <td className="py-4">
                    <div className="font-semibold text-glass-200 text-sm">{checkup.userFullName}</div>
                    <div className="text-xs text-glass-500">{checkup.userEmail}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-glass-300 text-sm">{formatDate(checkup.checkupDate)}</div>
                  </td>
                  <td className="py-4">
                    {(() => {
                        if (!checkup.predictions || checkup.predictions.length === 0) {
                            return <span className="text-glass-500 text-sm italic">Đang phân tích...</span>;
                        }
                        
                        const translateDisease = (d) => {
                            const map = {
                                "Heart Disease": "Tim mạch",
                                "Diabetes": "Tiểu đường",
                                "Stroke": "Đột quỵ",
                                "Liver Disease": "Gan",
                                "Chronic Kidney Disease": "Thận"
                            };
                            return map[d] || d;
                        };

                        const risks = checkup.predictions
                                        .map(p => ({ ...p, percentage: p.probability * 100 }))
                                        .filter(p => p.percentage > 40)
                                        .sort((a,b) => b.percentage - a.percentage);
                        
                        if (risks.length === 0) {
                            return <Badge variant="success">Nguy cơ thấp</Badge>;
                        }

                        return (
                            <div className="flex flex-col gap-1.5">
                                {risks.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-glass-200 font-medium text-xs min-w-[70px]">{translateDisease(p.diseaseType)}:</span>
                                        {p.percentage > 70 
                                            ? <Badge variant="danger">Cao ({p.percentage.toFixed(1)}%)</Badge>
                                            : <Badge variant="warning">Vừa ({p.percentage.toFixed(1)}%)</Badge>
                                        }
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/result/${checkup.id}`} className="p-1.5 text-glass-400 hover:text-cyan-400 transition-colors" title="Xem chi tiết">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDeleteCheckup(checkup.id)} className="p-1.5 text-glass-400 hover:text-red-400 transition-colors" title="Xóa lượt khám">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {checkups.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-glass-500 text-sm">
                    Chưa có lượt khám nào trên hệ thống
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <Pagination
            currentPage={pagination.page}
            totalPages={Math.ceil(pagination.total / pagination.pageSize)}
            onPageChange={(p) => fetchCheckups(p)}
            totalItems={pagination.total}
            pageSize={pagination.pageSize}
            className="mt-4 border-t border-cyan-500/8 pt-4"
          />
        )}
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={confirmDeleteCheckup}
        title="Xóa lượt khám"
        message="Cảnh báo: Lượt khám và kết quả dự đoán liên quan sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?"
        confirmText="Xóa vĩnh viễn"
        variant="danger"
      />
    </div>
  );
};

export default AdminCheckups;
