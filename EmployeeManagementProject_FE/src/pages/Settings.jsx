import { useState } from 'react'
import {
  ShieldCheck, Users, Lock, Save, LayoutDashboard,
  UserCog, FileText, CheckCircle2,
} from 'lucide-react'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ROLES = ['Admin', 'HR Manager', 'Kế toán', 'Nhân viên y tế']

const MODULES = [
  { key: 'dashboard',  label: 'Dashboard',          icon: LayoutDashboard },
  { key: 'employees',  label: 'Quản lý Nhân viên',  icon: UserCog },
  { key: 'decisions',  label: 'Các Quyết Định',     icon: FileText },
]

const ACTIONS = [
  { key: 'view',   label: 'Xem' },
  { key: 'create', label: 'Thêm' },
  { key: 'edit',   label: 'Sửa' },
  { key: 'delete', label: 'Xóa' },
]

const SENSITIVE_FIELDS = [
  { key: 'basicSalary',          label: 'Mức lương cơ bản' },
  { key: 'bankAccountNumber',    label: 'Số tài khoản ngân hàng' },
  { key: 'socialInsuranceNumber', label: 'Số sổ BHXH' },
]

// Khởi tạo permissions mặc định cho mỗi role
const buildDefaultPerms = () =>
  Object.fromEntries(
    ROLES.map((role) => [
      role,
      {
        modules: Object.fromEntries(
          MODULES.map((m) => [
            m.key,
            Object.fromEntries(
              ACTIONS.map((a) => [a.key, role === 'Admin'])
            ),
          ])
        ),
        fields: Object.fromEntries(
          SENSITIVE_FIELDS.map((f) => [f.key, role === 'Admin'])
        ),
      },
    ])
  )


// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleItem({ role, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
        isActive
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isActive ? 'bg-indigo-500' : 'bg-slate-200'
      }`}>
        <Users size={15} className={isActive ? 'text-white' : 'text-slate-500'} />
      </div>
      <span className="truncate">{role}</span>
      {isActive && <CheckCircle2 size={15} className="ml-auto shrink-0 text-indigo-200" />}
    </button>
  )
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
  )
}

function SaveToast({ visible }) {
  if (!visible) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-bounce-once">
      <CheckCircle2 size={16} />
      Đã lưu thay đổi!
    </div>
  )
}


// ─── Module Permission Table ──────────────────────────────────────────────────

function ModulePermTable({ perms, onChange, onSave }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-700">Ma trận quyền chức năng</h3>
        </div>
        <button
          onClick={onSave}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Save size={13} />
          Lưu thay đổi
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-1/2">
                Chức năng
              </th>
              {ACTIONS.map((a) => (
                <th key={a.key} className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MODULES.map((mod) => {
              const Icon = mod.icon
              return (
                <tr key={mod.key} className="hover:bg-indigo-50/40 transition-colors group">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors shrink-0">
                        <Icon size={14} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <span className="font-medium text-slate-700">{mod.label}</span>
                    </div>
                  </td>
                  {ACTIONS.map((action) => (
                    <td key={action.key} className="text-center px-4 py-3.5">
                      <StyledCheckbox
                        checked={perms[mod.key]?.[action.key] ?? false}
                        onChange={(e) => onChange('modules', mod.key, action.key, e.target.checked)}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Field Security Table ─────────────────────────────────────────────────────

function FieldSecurityTable({ fields, onChange, onSave }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">Bảo mật trường dữ liệu nhạy cảm</h3>
        </div>
        <button
          onClick={onSave}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Save size={13} />
          Lưu thay đổi
        </button>
      </div>

      {/* Table */}
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
              <tr key={field.key} className="hover:bg-amber-50/40 transition-colors group">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors shrink-0">
                      <Lock size={13} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <span className="font-medium text-slate-700">{field.label}</span>
                  </div>
                </td>
                <td className="text-center px-6 py-3.5">
                  <StyledCheckbox
                    checked={fields[field.key] ?? false}
                    onChange={(e) => onChange('fields', field.key, null, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [activeRole, setActiveRole] = useState(ROLES[0])
  const [allPerms, setAllPerms] = useState(buildDefaultPerms)
  const [toast, setToast] = useState(false)

  // Lấy permissions của role đang active
  const currentPerms = allPerms[activeRole]

  // Thay đổi 1 ô checkbox
  // section: 'modules' | 'fields'
  // moduleKey: key của module (chỉ dùng khi section = 'modules')
  // actionKey: key của action hoặc field
  const handleChange = (section, moduleKey, actionKey, value) => {
    setAllPerms((prev) => {
      const role = prev[activeRole]
      if (section === 'modules') {
        return {
          ...prev,
          [activeRole]: {
            ...role,
            modules: {
              ...role.modules,
              [moduleKey]: { ...role.modules[moduleKey], [actionKey]: value },
            },
          },
        }
      }
      // section === 'fields'
      return {
        ...prev,
        [activeRole]: {
          ...role,
          fields: { ...role.fields, [moduleKey]: value },
        },
      }
    })
  }

  const showToast = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
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
          <h1 className="text-xl font-bold text-slate-800">Cài đặt &amp; Phân quyền hệ thống</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý quyền truy cập cho từng nhóm người dùng</p>
        </div>
      </div>

      {/* ── Main layout: role list (left) + config (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── Danh sách Role ── */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-3">
          <p className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Nhóm quyền
          </p>
          <div className="space-y-1">
            {ROLES.map((role) => (
              <RoleItem
                key={role}
                role={role}
                isActive={role === activeRole}
                onClick={() => setActiveRole(role)}
              />
            ))}
          </div>
        </div>

        {/* ── Khu vực cấu hình chi tiết ── */}
        <div className="lg:col-span-9 space-y-5">

          {/* Role badge */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-sm font-semibold text-slate-700">
              Đang cấu hình:
            </span>
            <span className="text-sm font-bold text-indigo-600">{activeRole}</span>
          </div>

          {/* Bảng 1: Module Permissions */}
          <ModulePermTable
            perms={currentPerms.modules}
            onChange={handleChange}
            onSave={showToast}
          />

          {/* Bảng 2: Field-Level Security */}
          <FieldSecurityTable
            fields={currentPerms.fields}
            onChange={handleChange}
            onSave={showToast}
          />

        </div>
      </div>
    </div>
  )
}
