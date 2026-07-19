import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import các trang của bạn
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeCreate from './pages/EmployeeCreate';
import EmployeeEdit from './pages/EmployeeEdit';
import Decisions from './pages/Decisions';
import Settings from './pages/Settings';

// Component bảo vệ: Nếu chưa có Token thì đá văng về trang Login
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
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
        
        {/* Khi vào '/employees', nó sẽ hiển thị danh sách nhân viên */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/create" element={<EmployeeCreate />} />
        <Route path="employees/edit/:id" element={<EmployeeEdit />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="decisions" element={<Decisions />} />
        <Route path="settings"  element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;