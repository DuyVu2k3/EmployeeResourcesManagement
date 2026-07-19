import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// 1. Cải tiến mảng navItems: Thêm thuộc tính allowedRoles cho trang cần bảo mật
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Nhân viên", icon: Users },
  { to: "/decisions", label: "Các quyết định", icon: FileText },
  {
    to: "/settings",
    label: "Cài đặt",
    icon: Settings,
    allowedRoles: ["Boss", "Admin", "Quản trị viên"], // 🔒 Chỉ những role này mới thấy
  },
];

function Sidebar({ open, onClose }) {
  // 2. Gọi useAuth để lấy thông tin user hiện tại
  const { user } = useAuth();

  // Chuẩn hóa tên Role về chữ thường để so sánh không sợ lỗi viết hoa/thường
  const currentRole = String(user?.role || user?.Role || "")
    .trim()
    .toLowerCase();

  // 3. Lọc danh sách menu: Nếu item có quy định allowedRoles thì kiểm tra, không thì mặc định cho qua
  const visibleNavItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true; // Trang công khai (Dashboard, Nhân viên...) -> Luôn hiện
    return item.allowedRoles.some((role) => role.toLowerCase() === currentRole);
  });

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-slate-900 flex flex-col z-30
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-wide">
            ClinicHR
          </span>
          <button
            onClick={onClose}
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </p>
          {/* 4. Render danh sách đã được lọc (visibleNavItems thay vì navItems) */}
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-500 group-hover:text-white"
                    }
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Version */}
        <div className="px-5 py-3 border-t border-slate-700/60">
          <p className="text-xs text-slate-600">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : user?.username
      ? user.username.slice(0, 2).toUpperCase()
      : "U";

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
      {/* Hamburger — chỉ hiện mobile */}
      <button
        onClick={onMenuClick}
        className="text-slate-500 hover:text-slate-800 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <span className="flex-1" />

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-800 leading-tight">
            {user?.fullName ?? user?.username ?? "Người dùng"}
          </p>
          <p className="text-xs text-slate-400">{user?.role ?? "Admin"}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold select-none">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors ml-1"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
