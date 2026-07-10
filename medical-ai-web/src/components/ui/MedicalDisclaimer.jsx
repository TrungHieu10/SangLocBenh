/**
 * MedicalDisclaimer — Persistent footer disclaimer for medical AI app
 */
import { ShieldAlert } from 'lucide-react';

export const MedicalDisclaimer = () => {
  return (
    <div className="mt-auto border-t border-cyan-500/6 bg-midnight-200/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500/60 shrink-0 mt-0.5" />
          <p className="text-[11px] text-glass-500 leading-relaxed">
            <span className="font-semibold text-amber-500/70">Lưu ý quan trọng:</span>{' '}
            Kết quả từ hệ thống AI chỉ mang tính chất <span className="text-glass-400 font-medium">tham khảo</span>, 
            không thay thế chẩn đoán của bác sĩ chuyên khoa. 
            Vui lòng tham khảo ý kiến bác sĩ để được tư vấn chính xác.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
