import { Shield, Lock, Eye, UserCheck, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-midnight relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/[0.03] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back button */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-glass-400 hover:text-cyan-400 transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Quay lại</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3">Điều khoản Dịch vụ</h1>
          <p className="text-glass-400 text-sm sm:text-base max-w-2xl mx-auto">
            Vui lòng đọc kỹ các điều khoản dịch vụ trước khi sử dụng hệ thống MedicalAI.
          </p>
          <p className="text-glass-500 text-xs mt-3">Cập nhật lần cuối: 01/06/2026</p>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">1. Điều khoản sử dụng</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p>Bằng việc truy cập và sử dụng MedicalAI, bạn đồng ý tuân thủ các điều khoản sau:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li><span className="text-glass-300 font-medium">Tài khoản:</span> Bạn phải cung cấp thông tin chính xác khi đăng ký và chịu trách nhiệm bảo mật tài khoản của mình.</li>
                <li><span className="text-glass-300 font-medium">Độ tuổi:</span> Bạn phải từ 18 tuổi trở lên hoặc có sự đồng ý của phụ huynh/người giám hộ để sử dụng dịch vụ.</li>
                <li><span className="text-glass-300 font-medium">Sử dụng hợp pháp:</span> Bạn cam kết sử dụng dịch vụ cho mục đích hợp pháp và không vi phạm quy định pháp luật Việt Nam.</li>
                <li><span className="text-glass-300 font-medium">Nội dung:</span> Bạn chịu trách nhiệm về tính chính xác của thông tin sức khỏe mà bạn cung cấp cho hệ thống.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">2. Giới hạn trách nhiệm</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-3">
                <p className="text-amber-300 text-sm font-medium">⚠️ Lưu ý quan trọng</p>
                <p className="text-amber-200/80 text-sm mt-1">
                  MedicalAI là công cụ hỗ trợ tham khảo, KHÔNG thay thế chẩn đoán y khoa chuyên nghiệp.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li><span className="text-glass-300 font-medium">Tính chất tham khảo:</span> Kết quả phân tích AI chỉ mang tính chất tham khảo và hỗ trợ, không phải là chẩn đoán y khoa chính thức.</li>
                <li><span className="text-glass-300 font-medium">Tham vấn bác sĩ:</span> Bạn nên tham khảo ý kiến bác sĩ hoặc chuyên gia y tế trước khi đưa ra bất kỳ quyết định điều trị nào.</li>
                <li><span className="text-glass-300 font-medium">Độ chính xác:</span> Chúng tôi nỗ lực cải thiện độ chính xác của AI nhưng không đảm bảo kết quả luôn chính xác 100%.</li>
                <li><span className="text-glass-300 font-medium">Miễn trừ:</span> MedicalAI không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh từ việc sử dụng kết quả phân tích AI mà không tham vấn chuyên gia y tế.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <UserCheck size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">3. Quyền và nghĩa vụ người dùng</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p className="font-medium text-glass-200">Quyền của bạn:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400 mb-4">
                <li>Truy cập và sử dụng đầy đủ các tính năng của hệ thống sau khi đăng ký.</li>
                <li>Yêu cầu hỗ trợ kỹ thuật khi gặp sự cố trong quá trình sử dụng.</li>
                <li>Nhận thông báo kịp thời về các thay đổi quan trọng của dịch vụ.</li>
                <li>Hủy tài khoản và yêu cầu xóa dữ liệu bất kỳ lúc nào.</li>
              </ul>
              <p className="font-medium text-glass-200">Nghĩa vụ của bạn:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li>Cung cấp thông tin sức khỏe trung thực và chính xác.</li>
                <li>Không chia sẻ tài khoản hoặc mật khẩu cho người khác.</li>
                <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp hoặc gây hại.</li>
                <li>Không cố gắng truy cập trái phép vào hệ thống hoặc dữ liệu của người dùng khác.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <Lock size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">4. Điều khoản bảo mật</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p>Chúng tôi cam kết bảo vệ thông tin cá nhân và dữ liệu sức khỏe của bạn:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li>Dữ liệu y tế của bạn được mã hóa và lưu trữ an toàn theo tiêu chuẩn quốc tế.</li>
                <li>Chúng tôi không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại.</li>
                <li>Dữ liệu chỉ được sử dụng cho mục đích phân tích sức khỏe và cải thiện dịch vụ.</li>
                <li>Bạn có quyền yêu cầu xóa toàn bộ dữ liệu theo <Link to="/privacy-policy" className="text-cyan-400 hover:text-cyan-300 underline">Chính sách Bảo mật</Link> của chúng tôi.</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <Eye size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">5. Thay đổi điều khoản</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p>Chúng tôi có quyền cập nhật hoặc thay đổi các điều khoản dịch vụ này vào bất kỳ thời điểm nào:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li>Mọi thay đổi sẽ được thông báo qua email hoặc thông báo trên hệ thống trước ít nhất 7 ngày.</li>
                <li>Việc tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi.</li>
                <li>Nếu không đồng ý với điều khoản mới, bạn có quyền ngừng sử dụng dịch vụ và yêu cầu xóa tài khoản.</li>
                <li>Phiên bản điều khoản hiện tại luôn được hiển thị tại trang này với ngày cập nhật rõ ràng.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-glass-500 text-xs">
            © 2026 MedicalAI. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
