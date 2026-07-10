import { Shield, Lock, Eye, UserCheck, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
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
            <Shield size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3">Chính sách Bảo mật</h1>
          <p className="text-glass-400 text-sm sm:text-base max-w-2xl mx-auto">
            Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. Vui lòng đọc kỹ chính sách bảo mật dưới đây.
          </p>
          <p className="text-glass-500 text-xs mt-3">Cập nhật lần cuối: 01/06/2026</p>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <Eye size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">1. Thông tin thu thập</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p>Khi sử dụng MedicalAI, chúng tôi có thể thu thập các loại thông tin sau:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li><span className="text-glass-300 font-medium">Thông tin cá nhân:</span> Họ tên, email, ngày sinh, giới tính khi bạn đăng ký tài khoản.</li>
                <li><span className="text-glass-300 font-medium">Dữ liệu sức khỏe:</span> Các chỉ số y tế, triệu chứng, tiền sử bệnh mà bạn cung cấp qua biểu mẫu khám lâm sàng.</li>
                <li><span className="text-glass-300 font-medium">Kết quả phân tích AI:</span> Các dự đoán, đánh giá nguy cơ sức khỏe được tạo bởi hệ thống trí tuệ nhân tạo.</li>
                <li><span className="text-glass-300 font-medium">Dữ liệu kỹ thuật:</span> Địa chỉ IP, loại trình duyệt, thời gian truy cập nhằm cải thiện trải nghiệm người dùng.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">2. Mục đích sử dụng</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p>Thông tin của bạn được sử dụng cho các mục đích sau:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li><span className="text-glass-300 font-medium">Hỗ trợ chẩn đoán AI:</span> Phân tích dữ liệu sức khỏe để đưa ra dự đoán và khuyến nghị phòng ngừa bệnh lý.</li>
                <li><span className="text-glass-300 font-medium">Cá nhân hóa trải nghiệm:</span> Cung cấp nội dung và khuyến nghị sức khỏe phù hợp với từng người dùng.</li>
                <li><span className="text-glass-300 font-medium">Cải thiện hệ thống:</span> Nâng cao độ chính xác của mô hình AI và cải thiện chất lượng dịch vụ.</li>
                <li><span className="text-glass-300 font-medium">Liên lạc:</span> Gửi thông báo quan trọng về tài khoản, cập nhật dịch vụ hoặc cảnh báo sức khỏe.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <Lock size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">3. Bảo mật dữ liệu</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p>Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt để bảo vệ dữ liệu của bạn:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li><span className="text-glass-300 font-medium">Mã hóa dữ liệu:</span> Tất cả dữ liệu được mã hóa bằng chuẩn AES-256 khi lưu trữ và TLS 1.3 khi truyền tải.</li>
                <li><span className="text-glass-300 font-medium">Kiểm soát truy cập:</span> Chỉ nhân viên được ủy quyền mới có quyền truy cập vào dữ liệu người dùng, với hệ thống phân quyền chặt chẽ.</li>
                <li><span className="text-glass-300 font-medium">Giám sát liên tục:</span> Hệ thống được giám sát 24/7 để phát hiện và ngăn chặn các mối đe dọa bảo mật.</li>
                <li><span className="text-glass-300 font-medium">Sao lưu định kỳ:</span> Dữ liệu được sao lưu thường xuyên để đảm bảo khả năng phục hồi trong trường hợp sự cố.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <UserCheck size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">4. Quyền của người dùng</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p>Bạn có các quyền sau đối với dữ liệu cá nhân của mình:</p>
              <ul className="list-disc list-inside space-y-2 text-glass-400">
                <li><span className="text-glass-300 font-medium">Quyền truy cập:</span> Bạn có quyền yêu cầu xem toàn bộ dữ liệu cá nhân mà chúng tôi lưu trữ về bạn.</li>
                <li><span className="text-glass-300 font-medium">Quyền chỉnh sửa:</span> Bạn có thể yêu cầu cập nhật hoặc sửa đổi thông tin cá nhân không chính xác.</li>
                <li><span className="text-glass-300 font-medium">Quyền xóa:</span> Bạn có quyền yêu cầu xóa toàn bộ dữ liệu cá nhân khỏi hệ thống của chúng tôi.</li>
                <li><span className="text-glass-300 font-medium">Quyền xuất dữ liệu:</span> Bạn có thể yêu cầu xuất dữ liệu của mình dưới định dạng phổ biến (CSV, PDF).</li>
                <li><span className="text-glass-300 font-medium">Quyền từ chối:</span> Bạn có thể từ chối việc xử lý dữ liệu cho mục đích tiếp thị hoặc nghiên cứu.</li>
              </ul>
            </div>
          </div>

          {/* Section 5 - Contact */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-50">5. Liên hệ</h2>
            </div>
            <div className="space-y-3 text-sm text-glass-300 leading-relaxed pl-[52px]">
              <p>Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào liên quan đến chính sách bảo mật, vui lòng liên hệ với chúng tôi:</p>
              <div className="bg-white/[0.03] border border-cyan-500/8 rounded-xl p-4 space-y-2">
                <p className="text-glass-300"><span className="font-medium text-glass-200">Email:</span> support@medicalai.vn</p>
                <p className="text-glass-300"><span className="font-medium text-glass-200">Điện thoại:</span> 1900-xxxx</p>
                <p className="text-glass-300"><span className="font-medium text-glass-200">Địa chỉ:</span> TP. Đà Nẵng, Việt Nam</p>
              </div>
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

export default PrivacyPolicyPage;
