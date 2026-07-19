import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  // 🟢 SỬA LỖI 1: Khởi tạo user từ localStorage để khi F5 tải lại trang vẫn giữ được mảng Permissions
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Kiểm tra tính hợp lệ của token khi tải trang
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Kiểm tra xem token có bị hết hạn chưa (exp tính bằng giây)
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("Token đã hết hạn!");
          logout();
          return;
        }

        // Nếu trong state chưa có user (hoặc vừa F5), ta lấy từ localStorage lên
        if (!user) {
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            // Nếu localStorage không có, bất đắc dĩ mới dùng tạm info từ token
            setUser(decoded);
          }
        }
      } catch (error) {
        console.error("Token không hợp lệ", error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    // 🟢 SỬA LỖI 2: Lấy TOÀN BỘ cục response trả về, không bóc tách mỗi token nữa
    const res = await axiosClient.post("/Auth/login", { username, password });

    // Tùy theo cấu hình axiosClient của bạn có tự bóc .data hay chưa
    const data = res.data !== undefined ? res.data : res;
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;

    if (!accessToken || typeof accessToken !== "string") {
      throw new Error("Cấu trúc dữ liệu trả về từ Server không đúng.");
    }

    // 1. Lưu Token
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setToken(accessToken);

    // 2. 👑 ĐIỂM QUYẾT ĐỊNH: Lưu NGUYÊN CỤC DATA (chứa role, rolePermissions, fieldPermissions) vào localStorage
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data); // Cập nhật state ngay lập tức để UI đổi màu
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
