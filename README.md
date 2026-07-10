# 🏥 Hệ Thống Phân Tích Và Dự Đoán Bệnh Mãn Tính Dựa Trên Dữ Liệu Bệnh Sử Khám Sức Khỏe

> **Đồ án tốt nghiệp**
> **Sinh viên thực hiện:** Lê Trung Hiếu — MSSV: 102220187

---

## 📌 Tổng Quan

Dự án ứng dụng **Trí Tuệ Nhân Tạo (AI)** và **Machine Learning** vào lĩnh vực y tế nhằm phân tích dữ liệu bệnh sử khám sức khỏe và đưa ra dự đoán về nguy cơ mắc các bệnh mãn tính. Hệ thống hỗ trợ y bác sĩ trong quá trình **sàng lọc, chẩn đoán sớm** và đưa ra **lời khuyên y tế cá nhân hóa** cho bệnh nhân thông qua Knowledge Graph (Neo4j RAG).

Hệ thống được thiết kế theo kiến trúc **Microservices**, bao gồm:
- **Backend API** xử lý logic nghiệp vụ (C# .NET 8.0)
- **Frontend Web** cung cấp giao diện người dùng (React 19)
- **AI/ML Service** chạy các mô hình dự đoán (Python FastAPI)
- **Knowledge Graph** cung cấp lời khuyên y tế (Neo4j)

---

## 🌟 Tính Năng Chính

### 🔮 Dự Đoán Bệnh Mãn Tính
- Dự đoán nguy cơ mắc **5 bệnh mãn tính**: Tim mạch, Đái tháo đường, Đột quỵ, Thận, Gan
- Sử dụng mô hình **XGBoost** kết hợp **SHAP** để giải thích kết quả dự đoán
- Hiển thị xác suất, mức độ nguy cơ và các chỉ số ảnh hưởng

### 🧠 Knowledge Graph & RAG (Neo4j)
- Tích hợp **Neo4j Knowledge Graph** chứa kiến thức y khoa
- **Retrieval-Augmented Generation (RAG)** cung cấp lời khuyên y tế cá nhân hóa
- Tự động khớp kết quả dự đoán với đồ thị kiến thức để đưa ra khuyến nghị

### 🔔 Thông Báo Thời Gian Thực
- Sử dụng **SignalR** để gửi thông báo real-time
- Thông báo kết quả dự đoán, nhắc nhở khám sức khỏe

### 📄 OCR Phiếu Xét Nghiệm
- Hỗ trợ **OCR** nhận dạng phiếu xét nghiệm sức khỏe
- Tự động trích xuất các chỉ số xét nghiệm từ ảnh/file scan

### 🔐 Xác Thực & Phân Quyền
- Đăng nhập bằng **Google OAuth 2.0**
- Xác thực **JWT** với phân quyền theo vai trò (Bệnh nhân, Bác sĩ, Y tá, Quản trị viên)

### 📊 Dashboard & Biểu Đồ
- Dashboard tổng quan theo từng vai trò
- Biểu đồ phân tích kết quả dự đoán bằng **Recharts**

---

## 🛠️ Công Nghệ Sử Dụng

### Backend (C# .NET 8.0)
| Công nghệ | Mô tả |
|---|---|
| ASP.NET Core 8.0 | Web API framework |
| Entity Framework Core | ORM truy vấn SQL Server |
| SQL Server | Cơ sở dữ liệu quan hệ |
| JWT Bearer | Xác thực & phân quyền |
| SignalR | Thông báo thời gian thực |
| Google OAuth 2.0 | Đăng nhập bằng Google |
| Swagger / OpenAPI | Tài liệu API tương tác |
| Neo4j.Driver | Kết nối Neo4j Knowledge Graph |

### Frontend (React 19)
| Công nghệ | Mô tả |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool |
| TailwindCSS 3 | CSS utility framework |
| Recharts | Biểu đồ phân tích |
| Axios | HTTP client |
| @microsoft/signalr | Real-time notifications |
| react-router-dom 7 | Routing |
| @react-oauth/google | Google OAuth login |

### AI/ML Service (Python)
| Công nghệ | Mô tả |
|---|---|
| FastAPI | Web framework cho API |
| XGBoost | Mô hình dự đoán chính |
| scikit-learn | Tiền xử lý & đánh giá |
| SHAP | Giải thích mô hình AI |
| Neo4j (Python driver) | Truy vấn Knowledge Graph |

### Hạ Tầng
| Công nghệ | Mô tả |
|---|---|
| Docker & Docker Compose | Container hóa & triển khai |
| Neo4j 5.x | Graph Database |
| SQL Server | Relational Database |

---

## 📁 Cấu Trúc Dự Án

```
DATN/
├── MedicalAI.API/              # 🌐 Web API (.NET 8) — Entry point backend
├── MedicalAI.Core/             # 📦 Domain models, interfaces, DTOs
├── MedicalAI.Infrastructure/   # ⚙️ EF Core, services, Neo4j integration
├── medical-ai-web/             # 💻 React frontend application
├── MedicalAI_Python/           # 🤖 Python FastAPI AI/ML prediction service
├── Train AI/                   # 📊 Jupyter notebooks & training scripts
├── Mẫu KQ XN/                 # 📋 Mẫu phiếu xét nghiệm (TT32/2023/TT-BYT)
├── docker-compose.yml          # 🐳 Docker orchestration
├── Dockerfile.api              # 🐳 Dockerfile cho Backend API
├── .env.example                # 🔧 Mẫu biến môi trường
├── QUICK_START.md              # 🚀 Hướng dẫn khởi chạy nhanh
├── INTEGRATION_GUIDE.md        # 🔗 Hướng dẫn tích hợp các service
├── NEO4J_RAG_SETUP.md          # 🧠 Cấu hình Neo4j RAG Engine
└── README.md                   # 📖 File này
```

> ⚠️ **Lưu ý:** Thư mục `Train AI` chứa các file model đã train và dữ liệu lớn — đã được loại trừ khỏi Git do kích thước. Thư mục `Mẫu KQ XN` chứa mẫu phiếu xét nghiệm cũng được loại trừ khỏi Git.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### ⚡ Yêu Cầu Hệ Thống

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) & npm
- [Python 3.10+](https://www.python.org/downloads/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) (hoặc SQL Server trong Docker)
- [Neo4j 5.x](https://neo4j.com/download/) (hoặc Neo4j trong Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (tùy chọn)

---

### 1️⃣ Backend API (.NET 8)

```powershell
# Di chuyển vào thư mục API
cd d:\DATN\MedicalAI.API

# Cấu hình appsettings.json (connection strings, Neo4j, JWT, Google OAuth...)

# Khôi phục packages
dotnet restore

# Chạy API
dotnet run
```

> ✅ API sẽ chạy tại `http://localhost:5182` (local dev) hoặc `http://localhost:5000` (Docker)
> 📖 Swagger UI: `http://localhost:5182/swagger/index.html`

---

### 2️⃣ Frontend React

```powershell
# Di chuyển vào thư mục frontend
cd d:\DATN\medical-ai-web

# Cài đặt dependencies
npm install

# Tạo file .env
# VITE_API_URL=http://localhost:5182/api
# VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Chạy dev server
npm run dev
```

> ✅ Frontend sẽ chạy tại `http://localhost:5173`

---

### 3️⃣ Python AI Service (FastAPI)

```powershell
# Di chuyển vào thư mục Python
cd d:\DATN\MedicalAI_Python

# Tạo virtual environment
python -m venv venv
venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> ✅ AI API sẽ chạy tại `http://localhost:8000`
> 📖 API docs: `http://localhost:8000/docs`

---

### 4️⃣ 🐳 Chạy Bằng Docker (Tất Cả Services)

```bash
# Tạo file .env từ mẫu
cp .env.example .env

# Chỉnh sửa .env với các giá trị phù hợp

# Khởi động tất cả services
docker-compose up -d
```

> Docker Compose sẽ khởi động: Backend API (port 5000), Frontend, Python AI, SQL Server, Neo4j

---

## 📚 Tài Liệu Tham Khảo

| Tài liệu | Mô tả |
|---|---|
| [QUICK_START.md](./QUICK_START.md) | 🚀 Hướng dẫn khởi chạy nhanh, test API endpoints |
| [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) | 🔗 Hướng dẫn tích hợp Backend ↔ Neo4j ↔ Frontend |
| [NEO4J_RAG_SETUP.md](./NEO4J_RAG_SETUP.md) | 🧠 Cài đặt & cấu hình Neo4j Knowledge Graph RAG |

---

## 📄 License

Đồ án tốt nghiệp — Chỉ phục vụ mục đích học tập và nghiên cứu.

---

> 💡 **Gặp vấn đề?** Kiểm tra phần Troubleshooting trong [QUICK_START.md](./QUICK_START.md) hoặc xem logs của từng service.
