import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { jwtDecode } from 'jwt-decode'; // Import thư viện giải mã

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null); // Thêm state lưu thông tin User

  // Tự động giải mã token mỗi khi token thay đổi (lúc đăng nhập hoặc lúc tải lại trang)
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded); // Lưu thông tin (VD: username, role, id...) vào state
      } catch (error) {
        console.error("Token không hợp lệ hoặc đã hết hạn", error);
        logout(); // Nếu token lỗi thì tự động đăng xuất
      }
    }
  }, [token]);

  const login = async (username, password) => {
    const { accessToken, refreshToken } = await axiosClient.post('/Auth/login', { username, password });

    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error("Cấu trúc dữ liệu trả về từ Server không đúng.");
    }

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken('');
    setUser(null);
  };

  // Cung cấp thêm biến `user` ra toàn hệ thống
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};