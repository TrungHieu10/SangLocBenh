/**
 * ResultDashboard — B2B2C Hospital Workflow Results
 */
import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePrediction from '../hooks/usePrediction';
import useAuth from '../hooks/useAuth';
import doctorApi from '../api/doctorApi';

import RiskGaugeChart from '../components/charts/RiskGaugeChart';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { getRiskLevelColor } from '../utils/riskLevelColor';
import { translateDisease, getDiseaseDescription, translateFeature } from '../utils/formatMetric';
import { evaluateMetric, convertDbToDisplay } from '../utils/referenceRanges';
import { Activity, ShieldAlert, CheckCircle2, ArrowRight, HeartPulse, Stethoscope, Save, FileText, Clock, AlertTriangle, TrendingUp, TrendingDown, Printer, ArrowLeft } from 'lucide-react';
import { NotificationContext } from '../store/NotificationContext';
import { useReactToPrint } from 'react-to-print';

const RISK_LABELS = { low: 'Thấp', medium: 'Trung bình', high: 'Cao', 'Very High': 'Rất Cao' };

const riskColorMap = {
  danger: { text: 'text-red-400', bar: 'bg-red-500' },
  warning: { text: 'text-amber-400', bar: 'bg-amber-500' },
  success: { text: 'text-teal-400', bar: 'bg-teal-500' },
};

const probVariant = (p) => (p > 70 ? 'danger' : p > 40 ? 'warning' : 'success');
const probLabel = (p) => (p > 70 ? 'Cao' : p > 40 ? 'Vừa' : 'Thấp');

const isValidMetric = (v) => v !== undefined && v !== null && v !== '';

export const ResultDashboard = () => {
  const { checkupId } = useParams();
  const { user } = useAuth();
  const { prediction, shapValues, loading, error, refetch } = usePrediction(checkupId);
  const [doctorNote, setDoctorNote] = useState('');
  const [doctorAdvice, setDoctorAdvice] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveNoteSuccess, setSaveNoteSuccess] = useState(false);
  const notification = useContext(NotificationContext);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `KetQuaKham_${checkupId?.slice(0, 8) || 'MedicalAI'}`,
    pageStyle: `
      @media print {
        body { background: white !important; color: #0f172a !important; }
        .no-print { display: none !important; }
      }
    `,
  });

  useEffect(() => { 
    if (prediction?.notes) setDoctorNote(prediction.notes); 
  }, [prediction]);

  const handleSaveNote = async () => {
    setIsSavingNote(true); setSaveNoteSuccess(false);
    try {
      await doctorApi.submitReview(checkupId, { notes: doctorNote, advice: doctorAdvice });
      setSaveNoteSuccess(true); 
      setTimeout(() => {
        setSaveNoteSuccess(false);
        refetch(); // Tải lại để cập nhật status
      }, 2000);
    } catch (err) { 
      console.error(err); 
      notification.error(err.message || 'Đã xảy ra lỗi khi lưu kết luận');
    } finally { 
      setIsSavingNote(false); 
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-[70vh]"><Spinner size="lg" text="Đang tải dữ liệu hồ sơ..." /></div>;

  if (error) return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex gap-4 items-start">
        <ShieldAlert className="shrink-0 w-8 h-8" /><div><h2 className="text-lg font-bold mb-2">Không thể tải kết quả</h2><p>{error}</p></div>
      </div>
    </div>
  );

  if (!prediction) return (
    <div className="max-w-4xl mx-auto text-center p-16 glass-card rounded-2xl animate-fade-in">
      <Activity className="w-14 h-14 text-glass-600 mx-auto mb-4" /><p className="text-glass-400">Không tìm thấy dữ liệu.</p>
    </div>
  );

  const isPending = prediction.status === 'Pending';
  const isDoctorOrAdmin = user?.role === 'Doctor' || user?.role === 'Admin';

  // 1. Nếu là Bệnh nhân và Hồ sơ đang chờ duyệt
  if (isPending && !isDoctorOrAdmin) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 glass-card rounded-2xl text-center animate-fade-in border border-amber-500/20 shadow-glow-amber/10">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-400 animate-pulse-soft" />
        </div>
        <h2 className="text-2xl font-bold text-glass-100 mb-4">Hồ sơ đang được xử lý</h2>
        <p className="text-glass-400 mb-8 max-w-lg mx-auto leading-relaxed">
          Kết quả xét nghiệm của bạn đã được ghi nhận và hệ thống AI đang phân tích sơ bộ. <br/><br/>
          Hồ sơ hiện đang được gửi đến Bác sĩ chuyên khoa để xem xét, đánh giá và đưa ra kết luận chính thức. 
          Vui lòng quay lại kiểm tra sau.
        </p>
        <div className="p-4 bg-midnight-200/50 rounded-xl inline-block text-sm text-glass-300 font-mono">
          Mã hồ sơ: {checkupId}
        </div>
      </div>
    );
  }

  // 2. Màn hình Chi tiết (Bác sĩ, hoặc Bệnh nhân khi đã duyệt)
  
  // Tính điểm tổng (nếu có dự đoán)
  let topRiskLevel = 'Low';
  let topRiskScore = 0;
  let topPredictionDate = prediction.checkupDate || new Date().toISOString();

  if (prediction.predictions && prediction.predictions.length > 0) {
    const sorted = [...prediction.predictions].sort((a, b) => b.probability - a.probability);
    topRiskLevel = sorted[0].riskLevel;
    topRiskScore = sorted[0].probability;
    topPredictionDate = sorted[0].createdAt || prediction.checkupDate || new Date().toISOString();
  }

  const riskVariant = getRiskLevelColor(topRiskLevel);
  const colors = riskColorMap[riskVariant] || riskColorMap.success;

  // Chuẩn bị dữ liệu chỉ số xét nghiệm kèm Hệ tham chiếu
  const m = prediction.metrics || {};
  
  // Ghi đè hiển thị tuổi từ localStorage nếu có (Ngoại kiểm AI)
  try {
      const latestAge = localStorage.getItem('latest_submitted_age');
      const latestGender = localStorage.getItem('latest_submitted_gender');
      if (latestAge) m.age = parseInt(latestAge, 10);
      if (latestGender !== null) m.gender = parseInt(latestGender, 10);
  } catch(e) {}
  const metricGroups = [
    {
      title: 'Sinh hiệu & Chỉ số cơ bản', icon: <HeartPulse size={16} className="text-cyan-400" />,
      items: [
        { key: 'age', label: 'Tuổi', value: m.age },
        { key: 'gender', label: 'Giới tính', value: m.gender !== undefined ? (m.gender === 1 ? 'Nam' : 'Nữ') : null },
        { key: 'height_cm', label: 'Chiều cao', value: m.height_cm },
        { key: 'weight_kg', label: 'Cân nặng', value: m.weight_kg },
        { key: 'systolicBP', label: 'HA tâm thu', value: m.systolicBP },
        { key: 'diastolicBP', label: 'HA tâm trương', value: m.diastolicBP },
      ],
    },
    {
      title: 'Xét nghiệm Máu & Tiểu đường', icon: <Activity size={16} className="text-teal-400" />,
      items: [
        { key: 'bloodGlucose', label: 'Đường huyết', value: m.bloodGlucose },
        { key: 'hbA1c', label: 'HbA1c', value: m.hbA1c },
        { key: 'cholesterol_Total', label: 'Cholesterol', value: m.cholesterol_Total },
        { key: 'hemoglobin', label: 'Hemoglobin', value: m.hemoglobin },
        { key: 'packedCellVolume_pcv', label: 'Thể tích hồng cầu (PCV)', value: m.packedCellVolume_pcv },
        { key: 'whiteBloodCell_wc', label: 'Bạch cầu (WBC)', value: m.whiteBloodCell_wc },
        { key: 'redBloodCell_rc', label: 'Hồng cầu (RBC)', value: m.redBloodCell_rc },
      ],
    },
    {
      title: 'Chức năng Gan', icon: <Activity size={16} className="text-purple-400" />,
      items: [
        { key: 'ast_SGOT', label: 'AST (SGOT)', value: m.asT_SGOT || m.ast_SGOT },
        { key: 'alt_SGPT', label: 'ALT (SGPT)', value: m.alT_SGPT || m.alt_SGPT },
        { key: 'totalBilirubin', label: 'Bilirubin toàn phần', value: m.totalBilirubin },
        { key: 'directBilirubin', label: 'Bilirubin trực tiếp', value: m.directBilirubin },
        { key: 'alkaline_Phosphotase', label: 'Alkaline Phosphatase', value: m.alkaline_Phosphotase },
        { key: 'total_Protiens', label: 'Protein tổng', value: m.total_Protiens },
        { key: 'albumin_Blood', label: 'Albumin máu', value: m.albumin_Blood },
        { key: 'a_G_Ratio', label: 'Tỉ lệ A/G', value: m.a_G_Ratio },
      ],
    },
    {
      title: 'Chức năng Thận & Điện giải', icon: <Activity size={16} className="text-blue-400" />,
      items: [
        { key: 'bloodUrea', label: 'Ure máu', value: m.bloodUrea },
        { key: 'serumCreatinine', label: 'Creatinine', value: m.serumCreatinine },
        { key: 'sodium_sod', label: 'Natri', value: m.sodium_sod },
        { key: 'potassium_pot', label: 'Kali', value: m.potassium_pot },
      ],
    },
    {
      title: 'Xét nghiệm Nước tiểu', icon: <Activity size={16} className="text-amber-400" />,
      items: [
        { key: 'specificGravity_sg', label: 'Tỷ trọng nước tiểu (SG)', value: m.specificGravity_sg },
        { key: 'albumin_Urine', label: 'Albumin nước tiểu', value: m.albumin_Urine },
        { key: 'sugar_Urine', label: 'Đường nước tiểu', value: m.sugar_Urine },
        { key: 'pusCells_pc', label: 'Tế bào mủ', value: m.pusCells_pc },
        { key: 'pusCellClumps_pcc', label: 'Cụm tế bào mủ', value: m.pusCellClumps_pcc },
        { key: 'bacteria_ba', label: 'Vi khuẩn', value: m.bacteria_ba },
      ],
    }
  ];

  const hasMetrics = Object.values(m).some(isValidMetric);

  return (
    <div ref={printRef} className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* HEADER BANNER */}
      <section className="glass-card rounded-2xl gradient-banner animate-fade-in relative overflow-hidden">
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-glass-50 tracking-tight mb-3">Kết quả phân tích y khoa</h1>
            <p className="text-glass-400 text-sm flex items-center gap-3">
              Mã khám: <span className="font-mono text-xs bg-midnight-200/60 text-cyan-400 px-3 py-1 rounded-lg border border-cyan-500/10">{checkupId?.substring(0, 8) || '—'}</span>
              {isPending && isDoctorOrAdmin && (
                <Badge variant="warning" className="ml-2 animate-pulse">Cần Bác sĩ phân tích</Badge>
              )}
            </p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-2 no-print">
            <button onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-glass-400 bg-midnight-200/40 hover:bg-midnight-200/70 border border-cyan-500/10 hover:border-cyan-500/20 transition-all">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-500/30 transition-all"
              aria-label="In / Xuất PDF kết quả"
            >
              <Printer className="w-4 h-4" /> In / Xuất PDF
            </button>
          </div>
        </div>
        <HeartPulse className="absolute right-6 md:right-10 bottom-0 w-28 h-28 md:w-36 md:h-36 text-cyan-500/[0.06] animate-pulse-soft" />
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-cyan-500/[0.04] rounded-full blur-3xl" />
      </section>

      {/* AI PREDICTION SECTION (Dành cho bác sĩ tham khảo) */}
      {prediction.predictions && prediction.predictions.length > 0 && (
        <>
          <section className="animate-fade-in stagger-1">
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              {isDoctorOrAdmin && <div className="absolute top-3 left-3 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded border border-purple-500/20">AI Suggestion</div>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-cyan-500/8 mt-2">
                <div className="flex flex-col items-center justify-center gap-3 pt-4 md:pt-0 md:px-4">
                  <p className="text-xs font-semibold text-glass-500 uppercase tracking-wider">Cảnh báo rủi ro (AI)</p>
                  <Badge variant={riskVariant} pulse className="text-base px-6 py-2.5 font-bold uppercase tracking-wide">
                    {RISK_LABELS[topRiskLevel] || topRiskLevel}
                  </Badge>
                </div>
                <div className="flex flex-col items-center justify-center pt-4 md:pt-0 md:px-4">
                  <p className="text-xs font-semibold text-glass-500 uppercase tracking-wider mb-1">Mức độ rủi ro cao nhất</p>
                  <p className={`text-5xl md:text-6xl font-black tabular-nums tracking-tight ${colors.text}`}>
                    {(topRiskScore * 100).toFixed(1)}<span className="text-2xl font-bold ml-0.5 text-glass-500">%</span>
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center pt-4 md:pt-0 md:px-4">
                  <p className="text-xs font-semibold text-glass-500 uppercase tracking-wider mb-2">Ngày phân tích AI</p>
                  <p className="text-xl font-bold text-glass-200">{new Date(topPredictionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in stagger-2">
            <div className="lg:col-span-1">
              <RiskGaugeChart riskLevel={topRiskLevel} probability={topRiskScore * 100} predictions={prediction.predictions} />
            </div>

            <div className="lg:col-span-2">
              <Card header={<div className="font-semibold text-glass-200 flex items-center gap-2"><Activity size={18} className="text-purple-400" /> Phân tích các bệnh lý từ hệ thống AI</div>}>
                <div className="space-y-4">
                  {Array.isArray(prediction.predictions) && prediction.predictions.map((pred, idx) => {
                    const prob = pred.probability * 100;
                    const variant = probVariant(prob);
                    const barColor = riskColorMap[variant]?.bar || 'bg-teal-500';

                    let topFeature = null;
                    let topFeatureImpact = 0;
                    let shapList = [];
                    if (pred.shapValuesJSON) {
                      try { 
                        const parsed = JSON.parse(pred.shapValuesJSON); 
                        if (Array.isArray(parsed)) {
                          shapList = parsed;
                          if (shapList.length > 0) {
                            topFeature = shapList[0].feature;
                            topFeatureImpact = shapList[0].impact;
                          }
                        }
                      } catch (_) {}
                    }
                    const { baseDesc, deepEval } = getDiseaseDescription(pred.disease, topFeature, topFeatureImpact);

                    return (
                      <div key={idx} className="p-5 bg-midnight-100/30 rounded-2xl border border-cyan-500/6 transition-all duration-300 hover:border-cyan-500/15 group">
                        <div className="flex justify-between items-start mb-3 gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-glass-100 text-base group-hover:text-cyan-400 transition-colors">{translateDisease(pred.disease)}</h4>
                            <div className="mt-2 text-xs text-glass-400 bg-midnight-200/40 p-3 rounded-xl border border-cyan-500/6 leading-relaxed">
                              {baseDesc}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-3xl font-black tabular-nums tracking-tight ${riskColorMap[variant]?.text || 'text-teal-400'}`}>{prob.toFixed(1)}%</p>
                            <Badge variant={variant} className="mt-1.5 uppercase text-[10px] tracking-wider font-bold">{probLabel(prob)}</Badge>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-midnight-300/40 rounded-full overflow-hidden mb-4">
                          <div className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} style={{ width: `${prob}%` }} />
                        </div>
                        
                        {/* Inline Explainable AI cho từng bệnh */}
                        {shapList.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-cyan-500/10">
                            <h5 className="text-[11px] font-bold text-glass-500 uppercase tracking-wider mb-3">Yếu tố ảnh hưởng chính (AI dự báo):</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {shapList.map((shap, sIdx) => {
                                const isPositive = shap.impact > 0;
                                return (
                                  <div key={sIdx} className="flex items-center gap-2.5 bg-midnight-200/30 p-2.5 rounded-lg border border-cyan-500/5">
                                    <div className={`p-1.5 rounded-md ${isPositive ? 'bg-red-500/10 text-red-400' : 'bg-teal-500/10 text-teal-400'}`}>
                                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-glass-200 truncate">{translateFeature(shap.feature)}</p>
                                      <p className={`text-[10px] ${isPositive ? 'text-red-400/80' : 'text-teal-400/80'}`}>
                                        {isPositive ? 'Làm tăng rủi ro' : 'Làm giảm rủi ro'}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {deepEval && <div className="mt-3 text-xs text-purple-400/90 font-medium bg-purple-500/5 p-2 rounded border border-purple-500/10">{deepEval}</div>}
                          </div>
                        )}

                        {/* Lời khuyên từ Knowledge Graph (Neo4j) */}
                        {pred.adviceJSON && (
                          <div className="mt-4 pt-4 border-t border-cyan-500/10">
                            <h5 className="text-[11px] font-bold text-glass-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Stethoscope size={14} className="text-teal-400" />
                              Lời khuyên Y khoa (Neo4j AI):
                            </h5>
                            <div className="text-sm text-glass-200 bg-teal-500/5 p-3 rounded-xl border border-teal-500/10 leading-relaxed">
                              {(() => {
                                try { return JSON.parse(pred.adviceJSON).vi || "Hãy duy trì lối sống lành mạnh."; }
                                catch { return pred.adviceJSON; }
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </section>


        </>
      )}

      {/* METRICS WITH REFERENCE RANGES */}
      {hasMetrics && (
        <section className="animate-fade-in stagger-4">
          <Card header={<div className="font-semibold text-glass-200 flex items-center gap-2"><FileText size={18} className="text-cyan-400" /> Dữ liệu Xét nghiệm & Hệ tham chiếu</div>}>
            <div className="space-y-8">
              {metricGroups.map((group, gIdx) => {
                const valid = group.items.filter(i => isValidMetric(i.value));
                if (!valid.length) return null;
                return (
                  <div key={gIdx}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="p-1.5 rounded-lg bg-midnight-200/50">{group.icon}</span>
                      <h4 className="text-xs font-bold text-glass-400 uppercase tracking-wider">{group.title}</h4>
                      <div className="flex-1 h-px bg-cyan-500/6 ml-2" />
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-cyan-500/10 text-glass-500">
                            <th className="py-3 px-4 font-medium w-1/3">Chỉ số</th>
                            <th className="py-3 px-4 font-medium text-center">Kết quả</th>
                            <th className="py-3 px-4 font-medium text-center">Khoảng tham chiếu</th>
                            <th className="py-3 px-4 font-medium text-right">Đánh giá</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-500/5">
                          {valid.map((item, iIdx) => {
                            const displayValue = convertDbToDisplay(item.key, item.value);
                            const evalResult = evaluateMetric(item.key, displayValue, prediction.patientGender);
                            
                            let valueColor = "text-glass-200";
                            let statusBadge = null;
                            
                            if (evalResult.status === 'high') {
                              valueColor = "text-red-400 font-bold";
                              statusBadge = <Badge variant="danger" className="text-[10px]">Cao</Badge>;
                            } else if (evalResult.status === 'low') {
                              valueColor = "text-amber-400 font-bold";
                              statusBadge = <Badge variant="warning" className="text-[10px]">Thấp</Badge>;
                            } else if (evalResult.status === 'normal') {
                              valueColor = "text-teal-400 font-medium";
                              statusBadge = <span className="text-teal-500/70 text-xs">Bình thường</span>;
                            } else {
                              statusBadge = <span className="text-glass-500 text-xs">-</span>;
                            }

                            return (
                              <tr key={iIdx} className="hover:bg-midnight-200/30 transition-colors">
                                <td className="py-3 px-4 text-glass-300 font-medium">{item.label}</td>
                                <td className={`py-3 px-4 text-center tabular-nums ${valueColor}`}>
                                  {displayValue} {evalResult.unit && <span className="text-[10px] text-glass-500 ml-1">{evalResult.unit}</span>}
                                  {evalResult.status === 'high' && <ArrowRight className="inline ml-1 w-3 h-3 text-red-400 -rotate-45" />}
                                  {evalResult.status === 'low' && <ArrowRight className="inline ml-1 w-3 h-3 text-amber-400 rotate-45" />}
                                </td>
                                <td className="py-3 px-4 text-center text-glass-500 text-xs font-mono">{evalResult.rangeText}</td>
                                <td className="py-3 px-4 text-right">{statusBadge}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* DOCTOR NOTES & CONCLUSIONS */}
      <section className="animate-fade-in stagger-5">
        <Card header={<div className="font-semibold text-glass-200 flex items-center gap-2"><Stethoscope size={18} className="text-cyan-400" /> Kết luận y khoa & Lời khuyên</div>}>
          {isDoctorOrAdmin ? (
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-400/80">
                  Bác sĩ vui lòng xem xét các dự đoán của AI và chỉ số xét nghiệm, sau đó điền Kết luận để chốt hồ sơ cho bệnh nhân.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-glass-300 mb-2">Kết luận lâm sàng</label>
                <textarea
                  className="w-full h-24 p-4 rounded-xl border border-cyan-500/10 bg-midnight-100/40 text-glass-200 placeholder:text-glass-500 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30 transition-all resize-none"
                  placeholder="Nhập kết luận chuyên môn về tình trạng bệnh..."
                  value={doctorNote} onChange={(e) => setDoctorNote(e.target.value)}
                />
              </div>

              {/* Tạm ẩn Lời khuyên nếu chưa tách riêng trường Advice trong Database, 
                  tuy nhiên đã setup biến state doctorAdvice, có thể gộp vào Note nếu DB chưa update kịp */}
              
              <div className="flex justify-end items-center gap-4 pt-4 border-t border-cyan-500/10">
                {saveNoteSuccess && <span className="text-teal-400 font-medium text-sm flex items-center gap-1.5 animate-scale-in"><CheckCircle2 size={16} /> Đã hoàn tất phân tích</span>}
                <Button variant="primary" onClick={handleSaveNote} loading={isSavingNote}>
                  <CheckCircle2 size={16} className="mr-2" /> 
                  Hoàn tất & Cập nhật trạng thái
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-midnight-100/30 rounded-xl border border-cyan-500/6 min-h-[120px]">
              {prediction.notes ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="w-5 h-5 text-cyan-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-glass-100 mb-1">Kết luận từ Bác sĩ:</h4>
                      <p className="text-glass-300 whitespace-pre-wrap leading-relaxed">{prediction.notes}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-glass-500 py-4">
                  <Stethoscope size={32} className="mb-3 opacity-30" />
                  <p className="italic text-center text-sm max-w-md">Bác sĩ chưa ghi chú thêm thông tin cho hồ sơ này.</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </section>

      {/* DISCLAIMER */}
      <section className="animate-fade-in stagger-6">
        <div className="p-5 bg-midnight-200/50 border border-cyan-500/10 rounded-2xl flex gap-4 items-start">
          <div className="shrink-0 p-2 bg-midnight-100 rounded-lg mt-0.5"><ShieldAlert size={18} className="text-glass-400" /></div>
          <div>
            <p className="font-bold text-glass-300 text-sm mb-1">Lưu ý hệ thống</p>
            <p className="text-sm text-glass-500 leading-relaxed">
              Các dự đoán từ hệ thống AI (Artificial Intelligence) đóng vai trò hỗ trợ bác sĩ trong việc chẩn đoán nhanh. Kết luận chuyên môn cuối cùng thuộc thẩm quyền của Bác sĩ điều trị.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default ResultDashboard;