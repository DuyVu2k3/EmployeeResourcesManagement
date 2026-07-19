import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users, UserPlus, UserMinus, Calendar,
  FileText, Cake, AlertCircle, Loader2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getAllEmployees } from '../api/employeeService'

// ─── Date helpers ─────────────────────────────────────────────────────────────

const today      = () => new Date()
const thisMonth  = () => today().getMonth()        // 0-based
const thisYear   = () => today().getFullYear()

/** Trả về { year, month (0-based) } cho i tháng trước hiện tại (i=0 = tháng này) */
const monthOffset = (i) => {
  const d = new Date(thisYear(), thisMonth() - i, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

/** Label hiển thị cho tháng: "Th.1", "Th.12" */
const monthLabel = ({ year, month }) => {
  const d = new Date(year, month, 1)
  return `Th.${d.getMonth() + 1}`
}

// ─── Computation ──────────────────────────────────────────────────────────────

function computeStats(employees) {
  const now = today()
  const cm  = thisMonth()
  const cy  = thisYear()

  // ── KPI ──
  const totalActive  = employees.filter((e) => e.status === 'Active').length
  const newThisMonth = employees.filter((e) => {
    if (!e.startDate) return false
    const d = new Date(e.startDate)
    return d.getMonth() === cm && d.getFullYear() === cy
  }).length
  const onLeave   = employees.filter((e) => e.status === 'OnLeave').length
  const inactive  = employees.filter((e) => e.status === 'Inactive').length

  // ── Chart: 6 tháng gần nhất (index 5 = cũ nhất, index 0 = tháng này) ──
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const { year, month } = monthOffset(5 - i)   // 5-i để hiển thị trái→phải
    const tuyenMoi = employees.filter((e) => {
      if (!e.startDate) return false
      const d = new Date(e.startDate)
      return d.getMonth() === month && d.getFullYear() === year
    }).length
    const nghiViec = employees.filter((e) => {
      // Dùng contractEndDate làm ngày nghỉ việc thực tế
      if (e.status !== 'Inactive' || !e.contractEndDate) return false
      const d = new Date(e.contractEndDate)
      return d.getMonth() === month && d.getFullYear() === year
    }).length
    return { month: monthLabel({ year, month }), tuyenMoi, nghiViec }
  })

  // ── Reminders ──
  const soon30 = new Date(now)
  soon30.setDate(soon30.getDate() + 30)

  const expiringContracts = employees
    .filter((e) => {
      if (e.status !== 'Active' || !e.contractEndDate) return false
      const end = new Date(e.contractEndDate)
      return end >= now && end <= soon30
    })
    .sort((a, b) => new Date(a.contractEndDate) - new Date(b.contractEndDate))
    .slice(0, 5)

  const birthdaysThisMonth = employees
    .filter((e) => {
      if (!e.dateOfBirth) return false
      return new Date(e.dateOfBirth).getMonth() === cm
    })
    .slice(0, 5)

  const missingLicense = employees
    .filter((e) => !e.practicingLicenseNumber?.trim())
    .slice(0, 5)

  return {
    kpi: { totalActive, newThisMonth, onLeave, inactive },
    chartData,
    reminders: { expiringContracts, birthdaysThisMonth, missingLicense },
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const fmtMonthDay = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, bgColor, iconColor, borderColor, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3 w-28 bg-slate-100 rounded-full" />
          <div className="h-7 w-16 bg-slate-100 rounded-lg" />
          <div className="h-3 w-20 bg-slate-100 rounded-full" />
        </div>
      </div>
    )
  }
  return (
    <div className={`bg-white rounded-2xl border ${borderColor ?? 'border-slate-100'} shadow-sm p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${bgColor}`}>
        <Icon size={24} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900 leading-none tabular-nums">{value}</p>
        <p className="text-xs text-slate-400 mt-1.5">{sub}</p>
      </div>
    </div>
  )
}

function ReminderSection({ icon: Icon, iconColor, bgColor, title, items, emptyText }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgColor}`}>
          <Icon size={13} className={iconColor} strokeWidth={2} />
        </div>
        <p className="text-xs font-semibold text-slate-700 leading-snug">{title}</p>
        {items.length > 0 && (
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${bgColor} ${iconColor} tabular-nums`}>
            {items.length}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 pl-9 italic">{emptyText}</p>
      ) : (
        <ul className="space-y-0.5 pl-9">
          {items.map((e, i) => (
            <li key={e.id ?? i} className="text-xs flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0 group">
              <span className="truncate font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{e.fullName}</span>
              {e._dateLabel && (
                <span className="text-slate-400 shrink-0 tabular-nums font-mono">{e._dateLabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4 pt-1">
      <div className="flex items-center justify-between">
        <div className="h-4 w-52 bg-slate-100 rounded-full" />
        <div className="h-3 w-24 bg-slate-100 rounded-full" />
      </div>
      <div className="h-72 bg-slate-50 rounded-xl" />
    </div>
  )
}

function ReminderSkeleton() {
  return (
    <div className="animate-pulse space-y-5 pt-1">
      <div className="h-4 w-36 bg-slate-100 rounded-full" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 pl-9">
          <div className="h-3 w-32 bg-slate-100 rounded-full" />
          <div className="h-3 w-44 bg-slate-100 rounded-full" />
          <div className="h-3 w-28 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  )
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: ['employees'],
    queryFn: getAllEmployees,
    staleTime: 5 * 60 * 1000, // cache 5 phút
  })

  const { kpi, chartData, reminders } = useMemo(() => {
    if (!employees.length) return {
      kpi: { totalActive: 0, newThisMonth: 0, onLeave: 0, inactive: 0 },
      chartData: [],
      reminders: { expiringContracts: [], birthdaysThisMonth: [], missingLicense: [] },
    }
    return computeStats(employees)
  }, [employees])

  // Gắn _dateLabel vào từng nhân viên để hiển thị trong reminder list
  const contractItems = reminders.expiringContracts.map((e) => ({
    ...e, _dateLabel: fmtDate(e.contractEndDate),
  }))
  const birthdayItems = reminders.birthdaysThisMonth.map((e) => ({
    ...e, _dateLabel: fmtMonthDay(e.dateOfBirth),
  }))
  const licenseItems = reminders.missingLicense.map((e) => ({
    ...e, _dateLabel: '',
  }))

  const KPI_CARDS = [
    {
      icon: Users,
      label: 'Tổng nhân sự',
      value: kpi.totalActive,
      sub: 'Nhân viên đang làm việc',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      borderColor: 'border-indigo-100',
    },
    {
      icon: UserPlus,
      label: 'Nhân viên mới',
      value: kpi.newThisMonth,
      sub: 'Tháng này',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-100',
    },
    {
      icon: Calendar,
      label: 'Đang nghỉ phép',
      value: kpi.onLeave,
      sub: 'Trạng thái OnLeave',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-100',
    },
    {
      icon: UserMinus,
      label: 'Nghỉ việc',
      value: kpi.inactive,
      sub: 'Trạng thái Inactive',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-100',
    },
  ]

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan nhân sự</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Chào mừng trở lại, chúc bạn một ngày làm việc hiệu quả! ☀️
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shrink-0">
            <Loader2 size={13} className="animate-spin" />
            Đang tải dữ liệu...
          </div>
        )}
      </div>

      {isError && (
        <div className="flex items-center gap-3 px-4 py-3.5 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl">
          <AlertCircle size={16} className="shrink-0" />
          Không thể tải dữ liệu. Vui lòng thử lại sau.
        </div>
      )}

      {/* ── Hàng 1: 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => (
          <StatCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </div>

      {/* ── Hàng 2: Biểu đồ + Nhắc nhở (7:5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Biểu đồ cột */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {isLoading ? <ChartSkeleton /> : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Biến động nhân sự 6 tháng gần nhất
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tuyển mới và nghỉ việc theo tháng</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={288}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      padding: '10px 14px',
                    }}
                    cursor={{ fill: '#f8fafc', radius: 4 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '16px', color: '#64748b' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="tuyenMoi" name="Tuyển mới" fill="#818cf8" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="nghiViec" name="Nghỉ việc" fill="#fda4af" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Nhắc nhở */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {isLoading ? <ReminderSkeleton /> : (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-800">Nhắc nhở quan trọng</h3>
                <p className="text-xs text-slate-400 mt-0.5">Các mục cần theo dõi</p>
              </div>
              <div className="space-y-5">

                <ReminderSection
                  icon={FileText}
                  iconColor="text-rose-500"
                  bgColor="bg-rose-50"
                  title="Hợp đồng sắp hết hạn (30 ngày tới)"
                  items={contractItems}
                  emptyText="Không có hợp đồng sắp hết hạn"
                />

                <div className="border-t border-slate-50" />

                <ReminderSection
                  icon={Cake}
                  iconColor="text-pink-500"
                  bgColor="bg-pink-50"
                  title="Sinh nhật trong tháng này"
                  items={birthdayItems}
                  emptyText="Không có sinh nhật trong tháng"
                />

                <div className="border-t border-slate-50" />

                <ReminderSection
                  icon={AlertCircle}
                  iconColor="text-amber-500"
                  bgColor="bg-amber-50"
                  title="Thiếu chứng chỉ hành nghề"
                  items={licenseItems}
                  emptyText="Tất cả nhân viên đã có CCHN"
                />

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
