# ClinicHR - Hệ Thống Quản Lý Nhân Sự Phòng Khám

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![.NET Core](https://img.shields.io/badge/.NET%208-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC292B?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

> 🌐 **LIVE DEMO / TRẢI NGHIỆM TRỰC TIẾP:** [http://clinichr-web.runasp.net](http://clinichr-web.runasp.net)

**ClinicHR** là giải pháp phần mềm quản lý nhân sự (HRM) toàn diện, hiện đại được thiết kế chuyên biệt cho môi trường phòng khám và y tế. Hệ thống nổi bật với kiến trúc bảo mật cao, giao diện trực quan và cơ chế **Phân quyền dựa trên vai trò đa tầng (Real RBAC - Role-Based Access Control)** cho phép kiểm soát quyền truy cập đến từng nút bấm và từng trường dữ liệu nhạy cảm.

---

## ✨ Tính năng nổi bật

### 1. Phân quyền & Bảo mật Đa tầng (Real RBAC)
* **Xác thực an toàn (Authentication):** Sử dụng **JWT (Access Token & Refresh Token)** với thời gian hết hạn linh hoạt, mật khẩu được mã hóa một chiều an toàn bằng **BCrypt**.
* **Phân quyền chức năng (`RolePermissions`):** Quản lý quyền truy cập theo từng Module (Dashboard, Nhân viên, Quyết định, Cài đặt...). Kiểm soát chi tiết các thao tác: **Xem, Thêm, Sửa, Xóa (CRUD)**.
* **Phân quyền dữ liệu nhạy cảm (`FieldPermissions`):** Cơ chế độc quyền cho phép ẩn/hiện từng trường dữ liệu cụ thể (Lương cơ bản, Số tài khoản ngân hàng, Số sổ BHXH...) tùy theo vai trò của người đăng nhập ngay từ tầng Backend API.
* **Chốt chặn giao diện (UI Protection):** Tự động ẩn các nút chức năng trên Sidebar/Menu và chặn truy cập đường dẫn bằng `RoleProtectedRoute` đối với các trang quản trị cấp cao (Cài đặt hệ thống).
* **Đặc quyền tối cao (Super Admin / Boss):** Cơ chế "Kim bài miễn tử" trong code giúp tài khoản cấp cao nhất (`Boss`, `Admin`) luôn có đầy đủ quyền hạn quản trị mà không phụ thuộc vào cấu hình dưới Database.

### 2. Quản lý Hồ sơ Nhân viên
* Quản lý danh sách nhân viên với đầy đủ thông tin: Lý lịch cá nhân, chuyên khoa, vị trí làm việc, chi nhánh/cơ sở.
* Thêm mới, chỉnh sửa và cập nhật hồ sơ trực quan.
* Theo dõi thông tin công tác, hợp đồng lao động và tài chính bảo hiểm.

### 3. Quản lý Quyết định Nhân sự
* Theo dõi và quản lý các quyết định bổ nhiệm, khen thưởng, kỷ luật, điều chuyển công tác.
* Hỗ trợ tạo quyết định theo mẫu chuẩn (`DecisionTemplates`).

### 4. Dashboard & Giao diện hiện đại
* Giao diện (UI/UX) được xây dựng theo phong cách hiện đại, tối giản và chuyên nghiệp với **Tailwind CSS**.
* Dashboard hiển thị thống kê tổng quan nhân sự, nhân viên mới, trạng thái nghỉ phép và biểu đồ biến động lao động.
* Tối ưu hóa trải nghiệm trên cả PC và thiết bị di động (Responsive).

---

## Công nghệ sử dụng

### Frontend (Giao diện người dùng)
* **Framework / Library:** React.js 18 (Vite)
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM v6 (với Custom Protected Routes & Role Guards)
* **State Management / API Calling:** Axios Interceptors, TanStack React Query / Context API
* **Icons:** Lucide React
* **Authentication:** `jwt-decode`

### Backend (Xử lý nghiệp vụ & API)
* **Framework:** ASP.NET Core Web API (.NET 8)
* **ORM:** Entity Framework Core
* **Database:** Microsoft SQL Server
* **Security:** Cung cấp cơ chế phân quyền RBAC kép, JWT Bearer Authentication, BCrypt.Net

### DevOps & Triển khai (Deployment Ready)
* **Hosting / Web Server:** Hỗ trợ cấu hình sẵn cho **IIS / Windows Hosting** (như MonsterASP.net) với file `web.config` đã tích hợp Rewrite URL cho React SPA và khai báo MIME Types chuẩn.

---

## Hướng dẫn cài đặt & Chạy dự án (Local Development)

### 1. Yêu cầu hệ thống (Prerequisites)
* [Node.js](https://nodejs.org/) (phiên bản 18.x hoặc 20.x trở lên)
* [\.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
* [SQL Server](https://www.microsoft.com/en-us/sql-server) & SQL Server Management Studio (SSMS)

### 2. Cài đặt Backend (C# .NET API)
1. Mở terminal và di chuyển vào thư mục Backend:
   ```bash
   cd EmployeeManagementProject_BE/src/ClinicHR.Api
