import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Trash2, Paperclip, X } from "lucide-react";
import { createEmployee } from "../api/employeeService";
import { getBranches } from "../api/branchService";

// ─── Initial State ────────────────────────────────────────────────────────────

const INIT = {
  employeeCode: "",
  fullName: "",
  gender: "Nam",
  dateOfBirth: "",
  identityNumber: "",
  identityIssueDate: "",
  identityIssuePlace: "",
  permanentAddress: "",
  currentAddress: "",
  phoneNumber: "",
  email: "",
  practicingLicenseNumber: "",
  licenseIssueDate: "",
  licenseIssuePlace: "",
  educationLevel: "",
  graduationYear: "",
  professionalScope: "",
  professionalTitle: "",
  jobPosition: "",
  department: "",
  branchId: "",
  startDate: "",
  contractEndDate: "",
  socialInsuranceNumber: "",
  socialInsuranceStartDate: "",
  bankAccountNumber: "",
  bankName: "",
  basicSalary: "",
  status: "Active",
};

const emptyItem = () => ({ name: "", file: null });

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="text-sm font-semibold text-indigo-600 border-b border-slate-100 pb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, wide }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

// ─── Dynamic list (degrees / certificates / non-medical) ────────────────────

function DynamicList({ label, addLabel, items, onChange, onAdd, onRemove }) {
  const fileRefs = useRef([]);

  return (
    <div className="sm:col-span-2 space-y-2">
      {label && (
        <p className="text-xs font-semibold text-indigo-900/70">{label}</p>
      )}

      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-slate-300 bg-white"
        >
          <input
            value={item.name}
            onChange={(e) => onChange(i, "name", e.target.value)}
            placeholder="Tên văn bằng / chứng chỉ..."
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <div>
            <button
              type="button"
              onClick={() => fileRefs.current[i]?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Paperclip size={13} />
              {item.file ? "Đổi file" : "Đính kèm"}
            </button>
            {item.file && (
              <p className="mt-0.5 text-xs text-indigo-600 truncate max-w-[120px]">
                {item.file.name}
              </p>
            )}
            <input
              ref={(el) => (fileRefs.current[i] = el)}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => onChange(i, "file", e.target.files[0] ?? null)}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors mt-1"
      >
        <Plus size={13} />
        {addLabel}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(INIT);

  // Quản lý file
  const [licenseFile, setLicenseFile] = useState(null);
  const [degrees, setDegrees] = useState([]); // Loại 1
  const [certificates, setCertificates] = useState([]); // Loại 2
  const [nonMedicalDocs, setNonMedicalDocs] = useState([]); // Loại 3

  const [branches, setBranches] = useState([]);
  const [serverError, setServerError] = useState("");

  const set = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    let isMounted = true;

    getBranches()
      .then((data) => {
        if (!isMounted) return;
        setBranches(Array.isArray(data) ? data : (data?.items ?? []));
      })
      .catch(() => {
        if (isMounted) setBranches([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Tự động gán ngày hôm nay khi chọn Nghỉ việc
  useEffect(() => {
    if (form.status === "Inactive") {
      const today = new Date().toISOString().split("T")[0];
      setForm((prev) => ({ ...prev, contractEndDate: today }));
    }
  }, [form.status]);

  // ── Dynamic list helpers ──
  const updateList = (setter) => (i, field, value) =>
    setter((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );

  const addItem = (setter) => () => setter((prev) => [...prev, emptyItem()]);

  const removeItem = (setter) => (i) =>
    setter((prev) => prev.filter((_, idx) => idx !== i));

  // ── Build FormData on submit ──
  const buildFormData = () => {
    const fd = new FormData();

    // Map các trường Text
    Object.entries(form).forEach(([key, val]) => {
      if (key === "branchId") return;
      if (val !== "" && val != null) fd.append(key, val);
    });

    if (
      form.branchId !== undefined &&
      form.branchId !== null &&
      form.branchId !== ""
    ) {
      fd.append("BranchId", form.branchId);
    }

    // Map CCHN (Type 0)
    if (licenseFile) fd.append("PracticingLicenseFile", licenseFile);

    // Map Bằng Y Tế (Type 1)
    degrees.forEach(({ name, file }) => {
      if (!name.trim() || !file) return;
      fd.append("DegreeNames", name);
      fd.append("DegreeFiles", file);
    });

    // Map Chứng chỉ đào tạo (Type 2)
    certificates.forEach(({ name, file }) => {
      if (!name.trim() || !file) return;
      fd.append("CertificateNames", name);
      fd.append("CertificateFiles", file);
    });

    // Map Bằng ngoài Y tế (Type 3)
    nonMedicalDocs.forEach(({ name, file }) => {
      if (!name.trim() || !file) return;
      fd.append("NonMedicalDegreeNames", name);
      fd.append("NonMedicalDegreeFiles", file);
    });

    return fd;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      alert("Thêm nhân viên thành công!");
      navigate("/employees");
    },
    onError: (err) =>
      setServerError(err?.message ?? "Có lỗi xảy ra, vui lòng thử lại."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    mutate(buildFormData());
  };

  const SubmitBtn = (
    <button
      type="submit"
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
    >
      {isPending && <Loader2 size={15} className="animate-spin" />}
      {isPending ? "Đang lưu..." : "Lưu nhân viên"}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Thêm nhân viên mới
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Điền đầy đủ thông tin và nhấn Lưu để hoàn tất
            </p>
          </div>
        </div>
        {SubmitBtn}
      </div>

      {serverError && (
        <div className="px-4 py-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Card 1: Thông tin cá nhân & Liên hệ ── */}
        <Card title="Thông tin cá nhân & Liên hệ">
          <Field label="Mã nhân viên">
            <input
              name="employeeCode"
              value={form.employeeCode}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Họ và tên *">
            <input
              name="fullName"
              value={form.fullName}
              onChange={set}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Giới tính">
            <select
              name="gender"
              value={form.gender}
              onChange={set}
              className={inputCls}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </Field>
          <Field label="Ngày sinh">
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Số CCCD / CMND">
            <input
              name="identityNumber"
              value={form.identityNumber}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Ngày cấp CCCD">
            <input
              type="date"
              name="identityIssueDate"
              value={form.identityIssueDate}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Nơi cấp CCCD" wide>
            <input
              name="identityIssuePlace"
              value={form.identityIssuePlace}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Địa chỉ thường trú" wide>
            <input
              name="permanentAddress"
              value={form.permanentAddress}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Địa chỉ hiện tại" wide>
            <input
              name="currentAddress"
              value={form.currentAddress}
              onChange={set}
              className={inputCls}
            />
          </Field>
        </Card>

        {/* ── Card 2: Chuyên môn & Bằng cấp (Đã tối ưu chuẩn 5 khu vực) ── */}
        <Card title="Chuyên môn Y tế & Bằng cấp">
          {/* KHU VỰC 1: TRÌNH ĐỘ Y TẾ (Cùng hàng, kèm PDF Loại 1) */}
          <Field label="Trình độ / Bằng cấp chuyên môn Y tế">
            <input
              name="educationLevel"
              value={form.educationLevel}
              onChange={set}
              className={inputCls}
              placeholder="VD: Đại học, Bác sĩ Đa khoa..."
            />
          </Field>
          <Field label="Năm tốt nghiệp">
            <input
              name="graduationYear"
              value={form.graduationYear}
              onChange={set}
              className={inputCls}
            />
          </Field>

          <DynamicList
            label="📎 File bằng cấp Y tế đính kèm:"
            addLabel="Thêm file bằng cấp Y tế"
            items={degrees}
            onChange={updateList(setDegrees)}
            onAdd={addItem(setDegrees)}
            onRemove={removeItem(setDegrees)}
          />

          {/* KHU VỰC 2: CCHN / GPHN (Kèm PDF Loại 0) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Số CCHN / GPHN">
              <input
                name="practicingLicenseNumber"
                value={form.practicingLicenseNumber}
                onChange={set}
                className={inputCls}
              />
            </Field>
            <Field label="Ngày cấp CCHN / GPHN">
              <input
                type="date"
                name="licenseIssueDate"
                value={form.licenseIssueDate}
                onChange={set}
                className={inputCls}
              />
            </Field>
            <Field label="Nơi cấp CCHN / GPHN" wide>
              <input
                name="licenseIssuePlace"
                value={form.licenseIssuePlace}
                onChange={set}
                placeholder="VD: Sở Y tế Đắk Lắk"
                className={inputCls}
              />
            </Field>

            {/* Khung đính kèm CCHN (Type 0) */}
            <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-indigo-900/70">
                📎 File CCHN / GPHN đính kèm:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("licenseFileInput").click()
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Paperclip size={13} />
                  {licenseFile ? "Đổi file mới" : "Đính kèm file CCHN"}
                </button>
                {licenseFile && (
                  <div className="flex items-center gap-1 max-w-[200px]">
                    <span className="text-xs text-indigo-600 truncate font-medium">
                      ✓ {licenseFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLicenseFile(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <input
                id="licenseFileInput"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setLicenseFile(e.target.files[0] ?? null)}
              />
            </div>
          </div>

          {/* KHU VỰC 3: PHẠM VI HOẠT ĐỘNG CHUYÊN MÔN (Hoàn toàn KHÔNG kèm PDF) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <Field label="Phạm vi hoạt động CM (Theo GPHN)" wide>
              <input
                name="professionalScope"
                value={form.professionalScope}
                onChange={set}
                placeholder="VD: Khám bệnh, chữa bệnh Nội khoa..."
                className={inputCls}
              />
            </Field>
          </div>

          {/* KHU VỰC 4: CHỨNG CHỈ KÈM THEO (Chỉ giữ DynamicList Loại 2) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <DynamicList
              label="📎 File chứng chỉ đào tạo đính kèm:"
              addLabel="Thêm file chứng chỉ"
              items={certificates}
              onChange={updateList(setCertificates)}
              onAdd={addItem(setCertificates)}
              onRemove={removeItem(setCertificates)}
            />
          </div>

          {/* KHU VỰC 5: BẰNG CẤP NGOÀI Y TẾ (Chỉ giữ DynamicList Loại 3) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <DynamicList
              label="📎 File văn bằng ngoài y tế đính kèm:"
              addLabel="Thêm file văn bằng ngoài y tế"
              items={nonMedicalDocs}
              onChange={updateList(setNonMedicalDocs)}
              onAdd={addItem(setNonMedicalDocs)}
              onRemove={removeItem(setNonMedicalDocs)}
            />
          </div>
        </Card>

        {/* ── Card 3: Công tác & Hợp đồng ── */}
        <Card title="Công tác & Hợp đồng">
          <Field label="Chức danh chuyên môn">
            <input
              name="professionalTitle"
              value={form.professionalTitle}
              onChange={set}
              className={inputCls}
              placeholder="VD: Bác sĩ"
            />
          </Field>
          <Field label="Vị trí công việc">
            <input
              name="jobPosition"
              value={form.jobPosition}
              onChange={set}
              className={inputCls}
              placeholder="VD: Trưởng khoa"
            />
          </Field>
          <Field label="Phòng ban" wide>
            <input
              name="department"
              value={form.department}
              onChange={set}
              className={inputCls}
              placeholder="VD: Nội tổng hợp"
            />
          </Field>
          <Field label="Chi nhánh làm việc">
            <select
              name="branchId"
              value={form.branchId ?? ""}
              onChange={set}
              className={inputCls}
            >
              <option value="">-- Chọn chi nhánh làm việc --</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ngày bắt đầu">
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field
            label={
              form.status === "Inactive"
                ? "Ngày chính thức nghỉ việc"
                : "Ngày kết thúc HĐ"
            }
          >
            <input
              type="date"
              name="contractEndDate"
              value={form.contractEndDate}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Trạng thái">
            <select
              name="status"
              value={form.status}
              onChange={set}
              className={inputCls}
            >
              <option value="Active">Đang làm</option>
              <option value="Inactive">Nghỉ việc</option>
              <option value="OnLeave">Nghỉ phép</option>
            </select>
          </Field>
        </Card>

        {/* ── Card 4: Tài chính & Bảo hiểm ── */}
        <Card title="Tài chính & Bảo hiểm">
          <Field label="Lương cơ bản (VNĐ)" wide>
            <input
              type="number"
              name="basicSalary"
              value={form.basicSalary}
              onChange={set}
              className={inputCls}
              placeholder="VD: 15000000"
              min={0}
            />
          </Field>
          <Field label="Ngân hàng">
            <input
              name="bankName"
              value={form.bankName}
              onChange={set}
              className={inputCls}
              placeholder="VD: Vietcombank"
            />
          </Field>
          <Field label="Số tài khoản">
            <input
              name="bankAccountNumber"
              value={form.bankAccountNumber}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Số sổ BHXH">
            <input
              name="socialInsuranceNumber"
              value={form.socialInsuranceNumber}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Ngày bắt đầu BHXH">
            <input
              type="date"
              name="socialInsuranceStartDate"
              value={form.socialInsuranceStartDate}
              onChange={set}
              className={inputCls}
            />
          </Field>
        </Card>
      </div>

      <div className="flex justify-end pb-6">{SubmitBtn}</div>
    </form>
  );
}
