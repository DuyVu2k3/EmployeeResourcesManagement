import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Users,
  Lock,
  Save,
  LayoutDashboard,
  UserCog,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getAllRolesWithPermissions,
  updateRolePermissions,
} from "../api/permissionService";

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULES = [
  { key: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "Employees", label: "Quản lý Nhân viên", icon: UserCog },
  { key: "Decisions", label: "Các Quyết Định", icon: FileText },
  { key: "Branches", label: "Quản lý Chi nhánh", icon: Users }, // Thêm cho đủ với BE
];

const ACTIONS = [
  { key: "view", label: "Xem" },
  { key: "create", label: "Thêm" },
  { key: "edit", label: "Sửa" },
  { key: "delete", label: "Xóa" },
];

const SENSITIVE_FIELDS = [
  { key: "BasicSalary", label: "Mức lương cơ bản", table: "Employee" },
  {
    key: "BankAccountNumber",
    label: "Số tài khoản ngân hàng",
    table: "Employee",
  },
  { key: "SocialInsuranceNumber", label: "Số sổ BHXH", table: "Employee" },
];

// ─── Helper: Convert DB data sang State của UI ───────────────────────────────
const transformDbToUiState = (dbRoles) => {
  const state = {};
  dbRoles.forEach((role) => {
    // 1. Map Modules
    const modules = {};
    MODULES.forEach((m) => {
      const found = role.rolePermissions?.find((p) => p.moduleName === m.key);
      modules[m.key] = {
        view: found?.canView ?? false,
        create: found?.canCreate ?? false,
        edit: found?.canEdit ?? false,
        delete: found?.canDelete ?? false,
      };
    });

    // 2. Map Fields
    const fields = {};
    SENSITIVE_FIELDS.forEach((f) => {
      const found = role.fieldPermissions?.find((p) => p.fieldName === f.key);
      fields[f.key] = found?.canView ?? false;
    });

    state[role.id] = {
      id: role.id,
      name: role.roleName,
      modules,
      fields,
    };
  });
  return state;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleItem({ role, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
        isActive
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isActive ? "bg-indigo-500" : "bg-slate-200"
        }`}
      >
        <Users
          size={15}
          className={isActive ? "text-white" : "text-slate-500"}
        />
      </div>
      <span className="truncate">{role.name}</span>
      {isActive && (
        <CheckCircle2 size={15} className="ml-auto shrink-0 text-indigo-200" />
      )}
    </button>
  );
}

function StyledCheckbox({ checked, onChange, disabled }) {
  return (
    <label className="flex items-center justify-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </label>
  );
}

function SaveToast({ visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-bounce-once">
      <CheckCircle2 size={16} />
      Đã lưu thay đổi xuống Database!
    </div>
  );
}

// ─── Module Permission Table ──────────────────────────────────────────────────

function ModulePermTable({ perms, onChange, onSave, isSaving }) {
  if (!perms) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-700">
            Ma trận quyền chức năng
          </h3>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          {isSaving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          Lưu thay đổi
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-1/2">
                Chức năng
              </th>
              {ACTIONS.map((a) => (
                <th
                  key={a.key}
                  className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                >
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <tr
                  key={mod.key}
                  className="hover:bg-indigo-50/40 transition-colors group"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors shrink-0">
                        <Icon
                          size={14}
                          className="text-slate-500 group-hover:text-indigo-600 transition-colors"
                        />
                      </div>
                      <span className="font-medium text-slate-700">
                        {mod.label}
                      </span>
                    </div>
                  </td>
                  {ACTIONS.map((action) => (
                    <td key={action.key} className="text-center px-4 py-3.5">
                      <StyledCheckbox
                        checked={perms[mod.key]?.[action.key] ?? false}
                        onChange={(e) =>
                          onChange(
                            "modules",
                            mod.key,
                            action.key,
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Field Security Table ─────────────────────────────────────────────────────

function FieldSecurityTable({ fields, onChange, onSave, isSaving }) {
  if (!fields) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">
            Bảo mật trường dữ liệu nhạy cảm
          </h3>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          {isSaving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          Lưu thay đổi
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Trường dữ liệu
              </th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">
                Cho phép xem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {SENSITIVE_FIELDS.map((field) => (
              <tr
                key={field.key}
                className="hover:bg-amber-50/40 transition-colors group"
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors shrink-0">
                      <Lock
                        size={13}
                        className="text-slate-400 group-hover:text-amber-600 transition-colors"
                      />
                    </div>
                    <span className="font-medium text-slate-700">
                      {field.label}
                    </span>
                  </div>
                </td>
                <td className="text-center px-6 py-3.5">
                  <StyledCheckbox
                    checked={fields[field.key] ?? false}
                    onChange={(e) =>
                      onChange("fields", field.key, null, e.target.checked)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeRoleId, setActiveRoleId] = useState(null);
  const [allPerms, setAllPerms] = useState({});
  const [toast, setToast] = useState(false);

  // 1. GET: Lấy danh sách Role & Permissions từ Backend
  const {
    data: dbRoles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["permissions"],
    queryFn: getAllRolesWithPermissions,
  });

  // Đồng bộ dữ liệu API vào Local State
  useEffect(() => {
    if (dbRoles && dbRoles.length > 0) {
      const formatted = transformDbToUiState(dbRoles);
      setAllPerms(formatted);
      if (!activeRoleId) {
        setActiveRoleId(dbRoles[0].id); // Active Role đầu tiên
      }
    }
  }, [dbRoles]);

  // 2. PUT: Mutation lưu xuống DB
  const { mutate: savePerms, isPending: isSaving } = useMutation({
    mutationFn: ({ roleId, payload }) => updateRolePermissions(roleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    },
    onError: (err) => {
      alert(
        err?.response?.data?.message ?? "Có lỗi xảy ra khi lưu phân quyền!",
      );
    },
  });

  // Lấy permissions của role đang active
  const currentRole = allPerms[activeRoleId];

  // Xử lý Checkbox
  const handleChange = (section, moduleKey, actionKey, value) => {
    setAllPerms((prev) => {
      const role = prev[activeRoleId];
      if (section === "modules") {
        return {
          ...prev,
          [activeRoleId]: {
            ...role,
            modules: {
              ...role.modules,
              [moduleKey]: { ...role.modules[moduleKey], [actionKey]: value },
            },
          },
        };
      }
      return {
        ...prev,
        [activeRoleId]: {
          ...role,
          fields: { ...role.fields, [moduleKey]: value },
        },
      };
    });
  };

  // Bấm nút Lưu -> Đóng gói payload gửi sang BE
  const handleSave = () => {
    if (!currentRole) return;

    // Build payload khớp với DTO bên Backend C#
    const payload = {
      rolePermissions: MODULES.map((m) => ({
        moduleName: m.key,
        canView: currentRole.modules[m.key]?.view ?? false,
        canCreate: currentRole.modules[m.key]?.create ?? false,
        canEdit: currentRole.modules[m.key]?.edit ?? false,
        canDelete: currentRole.modules[m.key]?.delete ?? false,
      })),
      fieldPermissions: SENSITIVE_FIELDS.map((f) => ({
        tableName: f.table,
        fieldName: f.key,
        canView: currentRole.fields[f.key] ?? false,
      })),
    };

    savePerms({ roleId: activeRoleId, payload });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-indigo-600">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
        Không thể tải dữ liệu phân quyền. Vui lòng kiểm tra lại Backend!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SaveToast visible={toast} />

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Cài đặt &amp; Phân quyền hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý quyền truy cập cho từng nhóm người dùng
          </p>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── Danh sách Role bên trái ── */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-3">
          <p className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Nhóm quyền
          </p>
          <div className="space-y-1">
            {Object.values(allPerms).map((role) => (
              <RoleItem
                key={role.id}
                role={role}
                isActive={role.id === activeRoleId}
                onClick={() => setActiveRoleId(role.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Khu vực cấu hình bên phải ── */}
        <div className="lg:col-span-9 space-y-5">
          {currentRole && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">
                  Đang cấu hình:
                </span>
                <span className="text-sm font-bold text-indigo-600">
                  {currentRole.name}
                </span>
              </div>

              {/* Bảng 1: Module Permissions */}
              <ModulePermTable
                perms={currentRole.modules}
                onChange={handleChange}
                onSave={handleSave}
                isSaving={isSaving}
              />

              {/* Bảng 2: Field-Level Security */}
              <FieldSecurityTable
                fields={currentRole.fields}
                onChange={handleChange}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
