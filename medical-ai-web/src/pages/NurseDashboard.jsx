import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Search, UserPlus, FilePlus, User, Calendar, Mail, Phone, Activity, Clock, Edit, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';

export const NurseDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newPatient, setNewPatient] = useState({
    fullName: '',
    patientCode: '',
    phoneNumber: '',
    gender: 1,
    dateOfBirth: ''
  });

  const [checkups, setCheckups] = useState([]);
  const [checkupsLoading, setCheckupsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load checkups history
  const fetchCheckups = async (pageNumber = 1) => {
    setCheckupsLoading(true);
    try {
      const res = await axiosClient.get(`/nurse/checkups?page=${pageNumber}&pageSize=5`);
      if (res.data.success) {
        setCheckups(res.data.data.items);
        setTotalPages(Math.ceil(res.data.data.total / res.data.data.pageSize));
      }
    } catch (e) {
      console.error('Lỗi tải lịch sử', e);
    } finally {
      setCheckupsLoading(false);
    }
  };

  // Tự động fetch lịch sử khi load trang
  useEffect(() => {
    fetchCheckups(page);
  }, [page]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Vui lòng nhập Mã Y Tế, SĐT hoặc Email');
      return;
    }
    
    setLoading(true);
    setPatient(null);
    setShowCreateForm(false);
    
    try {
      const response = await axiosClient.get(`/nurse/search-patient?query=${searchQuery}`);
      if (response.data.success && response.data.data) {
        setPatient(response.data.data);
        toast.success('Đã tìm thấy bệnh nhân');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Không tìm thấy bệnh nhân. Vui lòng tạo mới.');
        setShowCreateForm(true);
        fetchGeneratedCode();
      } else {
        toast.error('Có lỗi xảy ra khi tìm kiếm');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneratedCode = async () => {
    try {
      const res = await axiosClient.get('/nurse/generate-patient-code');
      if (res.data.success) {
        setNewPatient(prev => ({ ...prev, patientCode: res.data.data }));
      }
    } catch (e) {
      console.error('Không thể sinh mã tự động', e);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatient.fullName || !newPatient.patientCode || !newPatient.dateOfBirth) {
      toast.error('Vui lòng nhập các thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: newPatient.fullName,
        patientCode: newPatient.patientCode,
        phoneNumber: newPatient.phoneNumber,
        gender: parseInt(newPatient.gender),
        dateOfBirth: new Date(newPatient.dateOfBirth).toISOString()
      };
      
      const response = await axiosClient.post('/nurse/create-patient', payload);
      if (response.data.success) {
        toast.success('Tạo bệnh nhân thành công!');
        setPatient(response.data.data);
        setShowCreateForm(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckup = () => {
    if (!patient) return;
    
    navigate('/clinical-form', { 
      state: { 
        patientForNurse: {
          id: patient.id,
          fullName: patient.fullName,
          gender: patient.gender,
          dateOfBirth: patient.dateOfBirth
        } 
      } 
    });
  };

  const handleEditCheckup = (checkup) => {
    navigate('/clinical-form', {
      state: {
        isEdit: true,
        checkupId: checkup.id,
        patientForNurse: {
          fullName: checkup.patientName,
          patientCode: checkup.patientCode,
          gender: checkup.patientGender,
          dateOfBirth: checkup.patientDob
        },
        initialData: checkup.metrics
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
          <Activity size={24} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">Tiếp nhận Bệnh nhân</h1>
          <p className="text-glass-400 text-sm">Tra cứu thông tin và tạo hồ sơ xét nghiệm mới</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              icon={<Search size={18} />}
              label="Tra cứu Bệnh nhân"
              placeholder="Nhập Mã Y Tế, SĐT hoặc Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading && !showCreateForm}
            className="h-11 px-6 shadow-glow-cyan"
          >
            Tìm kiếm
          </Button>
        </form>
      </Card>

      {/* Patient Found */}
      {patient && (
        <Card className="p-6 animate-fade-in border-cyan-500/30 bg-cyan-900/10">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                <User size={32} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-glass-50">{patient.fullName}</h3>
                <div className="mt-2 space-y-1 text-sm text-glass-300">
                  <p className="flex items-center gap-2"><Mail size={14} className="text-cyan-500/70" /> {patient.patientCode || patient.email}</p>
                  <p className="flex items-center gap-2"><Phone size={14} className="text-cyan-500/70" /> {patient.phoneNumber || 'Chưa cập nhật'}</p>
                  <p className="flex items-center gap-2">
                    <Calendar size={14} className="text-cyan-500/70" /> 
                    {new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')} ({patient.gender === 1 ? 'Nam' : patient.gender === 0 ? 'Nữ' : 'Khác'})
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleCreateCheckup} variant="primary" icon={<FilePlus size={18} />} className="shadow-glow-cyan">
              Tạo Hồ sơ Xét nghiệm OCR
            </Button>
          </div>
        </Card>
      )}

      {/* Create Patient Form */}
      {showCreateForm && (
        <Card className="p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus size={20} className="text-cyan-400" />
            <h2 className="text-xl font-bold text-glass-50">Tạo mới Bệnh nhân</h2>
          </div>
          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ và tên (*)"
                placeholder="Nhập họ tên"
                value={newPatient.fullName}
                onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                required
              />
              <Input
                label="Mã Y Tế (Hệ thống tự cấp)"
                type="text"
                placeholder="Đang tạo mã..."
                value={newPatient.patientCode}
                disabled
              />
              <Input
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                value={newPatient.phoneNumber}
                onChange={(e) => setNewPatient({ ...newPatient, phoneNumber: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="select"
                  label="Giới tính"
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  options={[{ label: 'Nam', value: 1 }, { label: 'Nữ', value: 0 }]}
                />
                <Input
                  type="date"
                  label="Ngày sinh (*)"
                  value={newPatient.dateOfBirth}
                  onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="mr-3">
                Hủy
              </Button>
              <Button type="submit" variant="primary" loading={loading} icon={<UserPlus size={18} />}>
                Lưu Bệnh nhân
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Checkup History Table */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock size={20} className="text-cyan-400" />
          <h2 className="text-xl font-bold text-glass-50">Lịch sử Phiếu khám</h2>
        </div>

        {checkupsLoading ? (
          <div className="text-center py-8 text-glass-400">Đang tải...</div>
        ) : checkups.length === 0 ? (
          <div className="text-center py-8 text-glass-400">Chưa có phiếu khám nào được tiếp nhận</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-700/50">
                  <th className="py-3 px-4 font-semibold text-glass-300">Ngày khám</th>
                  <th className="py-3 px-4 font-semibold text-glass-300">Bệnh nhân</th>
                  <th className="py-3 px-4 font-semibold text-glass-300">Mã YT</th>
                  <th className="py-3 px-4 font-semibold text-glass-300">Trạng thái</th>
                  <th className="py-3 px-4 text-right font-semibold text-glass-300">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-700/50">
                {checkups.map((c) => (
                  <tr key={c.id} className="hover:bg-glass-800/20 transition-colors">
                    <td className="py-3 px-4 text-glass-100 whitespace-nowrap">
                      {new Date(c.date).toLocaleDateString('vi-VN')} {new Date(c.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-glass-100">{c.patientName}</td>
                    <td className="py-3 px-4 text-glass-300">{c.patientCode}</td>
                    <td className="py-3 px-4">
                      {c.status === 'Pending' ? (
                        <Badge variant="warning">Chờ duyệt</Badge>
                      ) : (
                        <Badge variant="success">Đã duyệt</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Eye size={14} />} 
                        className="text-glass-300 hover:text-white hover:bg-glass-800"
                        onClick={() => navigate(`/result/${c.id}`)}
                      >
                        Xem
                      </Button>
                      {c.status === 'Pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={<Edit size={14} />} 
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30"
                          onClick={() => handleEditCheckup(c)}
                        >
                          Sửa
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default NurseDashboard;
