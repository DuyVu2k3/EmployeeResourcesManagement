import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Import các trang của bạn
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeeCreate from "./pages/EmployeeCreate";
import EmployeeEdit from "./pages/EmployeeEdit";
import Decisions from "./pages/Decisions";
import Settings from "./pages/Settings";

// 1. Chốt chặn 1: Kiểm tra Đăng nhập (Token)
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// 2. 👑 Chốt chặn 2: Kiểm tra Quyền hạn (Role) - MỚI THÊM
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();

  // Nếu chưa có token thì đá về Login
  if (!token) return <Navigate to="/login" replace />;

  // Lấy tên Role hiện tại của user (chuẩn hóa về chữ thường để không sợ lỗi viết hoa/thường)
  const currentRole = String(user?.role || user?.Role || "")
    .trim()
    .toLowerCase();

  // Kiểm tra xem role của user có nằm trong danh sách được phép không
  const isAllowed = allowedRoles.some(
    (role) => role.toLowerCase() === currentRole,
  );

  // Nếu KHÔNG có quyền (VD: Manager, Nhân viên cố tình gõ URL /settings)
  if (!isAllowed) {
    alert(
      "🔒 Bạn không có quyền truy cập vào trang Cài đặt & Phân quyền hệ thống!",
    );
    return <Navigate to="/dashboard" replace />; // Đá văng ngược lại về Dashboard
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Route công khai: Trang đăng nhập */}
      <Route path="/login" element={<Login />} />

      {/* Cụm Route được bảo vệ (Phải đăng nhập mới thấy) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Redirect '/' về '/dashboard' */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Các trang dành cho nhân sự nói chung */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/create" element={<EmployeeCreate />} />
        <Route path="employees/edit/:id" element={<EmployeeEdit />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="decisions" element={<Decisions />} />

        {/* TRANG CÀI ĐẶT: Chỉ được phép truy cập khi Role là Boss (hoặc Admin) */}
        <Route
          path="settings"
          element={
            <RoleProtectedRoute allowedRoles={["Boss", "Admin"]}>
              <Settings />
            </RoleProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
