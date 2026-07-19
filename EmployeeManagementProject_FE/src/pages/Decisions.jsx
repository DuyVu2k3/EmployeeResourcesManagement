import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileDown, FileText, Users, CheckCircle2, ChevronDown, BookOpen } from 'lucide-react'
import { getAllEmployees, exportTerminationContract, exportPracticeCertificate, exportAssignmentDecision, exportTechnicalLeadAssignment, exportClinicalTaskAssignment } from '../api/employeeService'
import TemplateDictionaryModal from '@/components/TemplateDictionaryModal'

export default function Decisions() {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedForm, setSelectedForm] = useState('resignation')
  const [isExporting, setIsExporting] = useState(false)

  const [isDictOpen, setIsDictOpen] = useState(false)

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: getAllEmployees,
  })

  const forms = [
    { 
      id: 'resignation', 
      name: 'Quyết định nghỉ việc', 
      icon: FileText, 
      desc: 'Xuất mẫu quyết định nghỉ việc và chấm dứt hợp đồng cho nhân viên.' 
    },
    { 
      id: 'practice-certificate', 
      name: 'Giấy xác nhận quá trình hành nghề', 
      icon: FileText, 
      desc: 'Xuất giấy xác nhận quá trình hành nghề cho nhân viên.' 
    },
    { 
      id: 'assignment-decision', 
      name: 'Quyết định phân công người phụ trách bộ phận chuyên môn', 
      icon: FileText, 
      desc: 'Xuất quyết định phân công người phụ trách bộ phận chuyên môn cho nhân viên.' 
    },
    { 
      id: 'technical-lead-assignment', 
      name: 'Quyết định phân công người chịu trách nhiệm chuyên môn kỹ thuật', 
      icon: FileText, 
      desc: 'Xuất quyết định phân công người chịu trách nhiệm chuyên môn kỹ thuật cho nhân viên.' 
    },
    { 
      id: 'clinical-task-assignment', 
      name: 'Quyết định phân công nhiệm vụ cán bộ thực hiện chuyên môn', 
      icon: FileText, 
      desc: 'Xuất quyết định phân công nhiệm vụ cán bộ thực hiện kỹ thuật chuyên môn cho nhân viên.' 
    },
    { 
      id: 'contract', 
      name: 'Hợp đồng lao động', 
      icon: FileText, 
      desc: 'Xuất mẫu hợp đồng lao động (Đang phát triển).', 
      disabled: true 
    },
  ]

  const handleExport = async () => {
    if (!selectedEmployee) return
    setIsExporting(true)
    try {
      const tenNhanVien = employees.find(emp => String(emp.id) === String(selectedEmployee))?.fullName ?? selectedEmployee

      let blob, fileName
      if (selectedForm === 'resignation') {
        blob = await exportTerminationContract(selectedEmployee)
        fileName = `QD-YDBM_Cham dut hop dong lao dong ${tenNhanVien}.docx`
      } else if (selectedForm === 'practice-certificate') {
        blob = await exportPracticeCertificate(selectedEmployee)
        fileName = `GXN_HanhNghe_${tenNhanVien}.docx`
      } else if (selectedForm === 'assignment-decision') {
        blob = await exportAssignmentDecision(selectedEmployee)
        fileName = `QD_PhanCong_${tenNhanVien}.docx`
      } else if (selectedForm === 'technical-lead-assignment') {
        blob = await exportTechnicalLeadAssignment(selectedEmployee)
        fileName = `QD_PhuTrachChuyenMon_${tenNhanVien}.docx`
      } else if (selectedForm === 'clinical-task-assignment') {
        blob = await exportClinicalTaskAssignment(selectedEmployee)
        fileName = `QD_PhanCongNhiemVu_${tenNhanVien}.docx`
      }

      const url = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi khi xuất quyết định:', error)
      alert('Không thể xuất quyết định. Vui lòng thử lại.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page Header (ĐÃ THÊM NÚT TỪ ĐIỂN VÀO GÓC PHẢI) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Các quyết định & Biểu mẫu</h1>
          <p className="text-sm text-slate-500 mt-1">Chọn loại biểu mẫu và nhân viên tương ứng để xuất tệp tin.</p>
        </div>

        {/* 3. NÚT MỞ MODAL TỪ ĐIỂN */}
        <button
          onClick={() => setIsDictOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-xl border border-indigo-200/80 transition-all duration-200 shadow-2xs hover:shadow-sm shrink-0 w-fit"
          title="Xem hướng dẫn các thẻ từ khóa trong biểu mẫu Word"
        >
          <BookOpen size={16} className="text-indigo-600" />
          <span>Từ điển biểu mẫu</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">

          {/* ── Bước 1: Chọn biểu mẫu ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Chọn loại biểu mẫu</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {forms.map(form => {
                const Icon = form.icon
                const isSelected = selectedForm === form.id
                return (
                  <button
                    key={form.id}
                    disabled={form.disabled}
                    onClick={() => setSelectedForm(form.id)}
                    className={`relative text-left p-4 rounded-2xl border transition-all duration-200 ${
                      form.disabled
                        ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50/60'
                        : isSelected
                          ? 'border-indigo-300 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-200/60'
                          : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50/70 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm leading-snug ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {form.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{form.desc}</p>
                        {form.disabled && (
                          <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200/60">
                            Sắp ra mắt
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3.5 right-3.5 text-indigo-500">
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Bước 2: Chọn nhân viên ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Chọn nhân viên</h2>
            </div>
            <div className="max-w-md">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Nhân viên áp dụng
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Users size={16} />
                </div>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white outline-none appearance-none transition-all duration-200 hover:border-slate-300 text-slate-700"
                >
                  <option value="" disabled>-- Chọn nhân viên --</option>
                  {isLoading ? (
                    <option disabled>Đang tải...</option>
                  ) : (
                    employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode ? `[${emp.employeeCode}] ` : ''}{emp.fullName}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ── Footer Actions ── */}
        <div className="bg-slate-50/70 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
          {/* Preview chip — hiển thị lựa chọn hiện tại */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {selectedEmployee && employees.length > 0 && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-slate-500 font-medium">
                  {employees.find(e => String(e.id) === String(selectedEmployee))?.fullName}
                </span>
              </>
            )}
          </div>

          {/* Export button — điểm nhấn chính */}
          <button
            onClick={handleExport}
            disabled={!selectedEmployee || isExporting}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
              !selectedEmployee || isExporting
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:-translate-y-px active:scale-95 active:translate-y-0'
            }`}
          >
            <FileDown size={16} className={isExporting ? 'animate-bounce' : ''} />
            {isExporting ? 'Đang xử lý...' : 'Xuất quyết định'}
          </button>
        </div>
      </div>

      {/* 4. GẮN MODAL VÀO CUỐI TRANG */}
      <TemplateDictionaryModal 
        isOpen={isDictOpen} 
        onClose={() => setIsDictOpen(false)} 
      />

    </div>
  )
}
