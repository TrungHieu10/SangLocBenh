# Medical AI Frontend

Đây là thư mục chứa source code Frontend cho **Hệ Thống Phân Tích Và Dự Đoán Bệnh Mãn Tính**.

## 🛠 Công Nghệ Sử Dụng

- **React 19** & **Vite 8**
- **TailwindCSS 3** (Styling)
- **Recharts** (Vẽ biểu đồ phân tích)
- **Axios** (HTTP Client gọi API)
- **SignalR Client** (Nhận thông báo thời gian thực)
- **Google OAuth 2.0** (Đăng nhập bằng Google)
- **React Router DOM 7** (Điều hướng các trang)

## 📂 Các Trang Chức Năng (Pages)

- Đăng nhập / Đăng ký / Quên mật khẩu
- Dashboard cho Bệnh nhân (Xem kết quả, lịch sử, biểu đồ sức khỏe)
- Dashboard cho Bác sĩ (Quản lý bệnh nhân, xem hồ sơ bệnh án)
- Dashboard cho Y tá (Quản lý lịch khám, nhập liệu)
- Dashboard cho Quản trị viên (Admin quản lý người dùng)
- Form nhập liệu lâm sàng (Medical Form)
- Màn hình kết quả dự đoán (Result Dashboard với biểu đồ SHAP & Neo4j Advice)
- Màn hình Hồ sơ cá nhân (Profile)

## 🚀 Hướng Dẫn Cài Đặt

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

2. **Cấu hình môi trường**:
   Tạo file `.env` (hoặc copy từ `.env.example` nếu có) và cấu hình:
   ```env
   VITE_API_URL=http://localhost:5182/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

3. **Chạy ứng dụng trong môi trường Dev**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại `http://localhost:5173/`
