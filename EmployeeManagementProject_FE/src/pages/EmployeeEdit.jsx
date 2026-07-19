import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Paperclip,
  X,
  FileText,
  Eye,
  Download,
  ExternalLink,
} from "lucide-react";
import { getEmployeeById, updateEmployee } from "../api/employeeService";
import { getBranches } from "../api/branchService";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://clinichr-api.runasp.net/api"
).replace(/\/api\/?$/, "");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateForInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toISOString().split("T")[0];
};

// item mới (chưa có trong DB): không có id, isOld = false
const newItem = () => ({ name: "", file: null, isOld: false });

const isPdf = (path) => path?.toLowerCase().endsWith(".pdf");
const fileUrl = (path) => BASE_URL + path;

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ doc, onClose }) {
  const url = fileUrl(doc.filePath);
  const docName =
    doc.title ||
    doc.documentName ||
    doc.name ||
    url.split("/").pop() ||
    "Tài liệu";
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const fileName =
        doc.title || doc.fileName || url.split("/").pop() || "tai-lieu";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-indigo-500" />
          </div>
          <p className="flex-1 text-sm font-semibold text-slate-700 truncate">
            {docName}
          </p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-900/5 p-4 min-h-[350px]">
          {url.toLowerCase().endsWith(".pdf") ? (
            <iframe
              src={url}
              className="w-full h-[60vh] rounded-xl border border-slate-200"
              title={docName}
            />
          ) : (
            <img
              src={url}
              alt={docName}
              className="max-w-full max-h-[60vh] rounded-xl object-contain shadow-md"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/400x300?text=Không+tải+được+ảnh";
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
            >
              <ExternalLink size={14} />
              Mở tab mới
            </a>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white transition-colors"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Download size={14} />
                  Tải về máy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

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

// ─── DynamicList ──────────────────────────────────────────────────────────────

function DynamicList({
  label,
  addLabel,
  items,
  onChange,
  onAdd,
  onRemove,
  onPreview,
}) {
  const fileRefs = useRef([]);

  return (
    <div className="sm:col-span-2 space-y-2">
      {label && (
        <p className="text-xs font-semibold text-indigo-900/70">{label}</p>
      )}

      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 p-2.5 rounded-lg border ${
            item.isOld
              ? "border-slate-200 bg-slate-50"
              : "border-dashed border-slate-300 bg-white p-3"
          }`}
        >
          {item.isOld ? (
            // Item cũ từ DB
            <>
              {isPdf(item.filePath) ? (
                <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-red-400" />
                </div>
              ) : (
                <img
                  src={fileUrl(item.filePath)}
                  alt=""
                  className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
                />
              )}
              <span className="flex-1 text-xs text-slate-600 truncate">
                {item.name}
              </span>
              <button
                type="button"
                onClick={() => onPreview(item)}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                title="Xem trước"
              >
                <Eye size={13} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors shrink-0"
                title="Xóa"
              >
                <X size={13} />
              </button>
            </>
          ) : (
            // Item mới thêm
            <>
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
                  onChange={(e) =>
                    onChange(i, "file", e.target.files[0] ?? null)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-16 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-96 bg-slate-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({});
  const [licenseFile, setLicenseFile] = useState(null);
  const [existingLicense, setExistingLicense] = useState(null);
  const [branches, setBranches] = useState([]);

  // documentType: 1 = Degree, 2 = Certificate, 3 = NonMedicalDegree
  const [degrees, setDegrees] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [nonMedicalDocs, setNonMedicalDocs] = useState([]);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [serverError, setServerError] = useState("");

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployeeById(id),
  });

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

  // ── Populate form + documents khi data load về ──
  useEffect(() => {
    if (!employee) return;

    setForm({
      employeeCode: employee.employeeCode ?? "",
      fullName: employee.fullName ?? "",
      gender: employee.gender ?? "Nam",
      dateOfBirth: formatDateForInput(employee.dateOfBirth),
      identityNumber: employee.identityNumber ?? "",
      identityIssueDate: formatDateForInput(employee.identityIssueDate),
      identityIssuePlace: employee.identityIssuePlace ?? "",
      permanentAddress: employee.permanentAddress ?? "",
      currentAddress: employee.currentAddress ?? "",
      phoneNumber: employee.phoneNumber ?? "",
      email: employee.email ?? "",
      practicingLicenseNumber: employee.practicingLicenseNumber ?? "",
      licenseIssueDate: formatDateForInput(employee.licenseIssueDate),
      licenseIssuePlace: employee.licenseIssuePlace ?? "",
      educationLevel: employee.educationLevel ?? "",
      graduationYear: employee.graduationYear ?? "", // Thêm trường mới
      professionalScope: employee.professionalScope ?? "",
      additionalCertificates: employee.additionalCertificates ?? "", // Thêm trường mới
      nonMedicalDegrees: employee.nonMedicalDegrees ?? "", // Thêm trường mới
      professionalTitle: employee.professionalTitle ?? "",
      jobPosition: employee.jobPosition ?? "",
      department: employee.department ?? "",
      startDate: formatDateForInput(employee.startDate),
      contractEndDate: formatDateForInput(employee.contractEndDate),
      socialInsuranceNumber: employee.socialInsuranceNumber ?? "",
      socialInsuranceStartDate: formatDateForInput(
        employee.socialInsuranceStartDate,
      ),
      bankAccountNumber: employee.bankAccountNumber ?? "",
      bankName: employee.bankName ?? "",
      basicSalary: employee.basicSalary ?? "",
      branchId: employee.branchId ?? "",
      status: employee.status ?? "Active",
    });

    if (employee.documents?.length > 0) {
      // documentType: 0 = License, 1 = Degree, 2 = Certificate, 3 = NonMedicalDegree
      const license = employee.documents.find((d) => d.documentType === 0);
      if (license) setExistingLicense(license);

      const mapOldDoc = (doc) => ({
        id: doc.id,
        name: doc.documentName,
        filePath: doc.filePath,
        file: null,
        isOld: true,
      });

      const oldDegrees = employee.documents
        .filter((d) => d.documentType === 1)
        .map(mapOldDoc);
      setDegrees(oldDegrees.length > 0 ? oldDegrees : []);

      const oldCerts = employee.documents
        .filter((d) => d.documentType === 2)
        .map(mapOldDoc);
      setCertificates(oldCerts.length > 0 ? oldCerts : []);

      // Phân loại tài liệu bằng cấp ngoài y tế (Type 3)
      const oldNonMed = employee.documents
        .filter((d) => d.documentType === 3)
        .map(mapOldDoc);
      setNonMedicalDocs(oldNonMed.length > 0 ? oldNonMed : []);
    }
  }, [employee]);

  const set = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (form.status === "Inactive") {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayString = `${yyyy}-${mm}-${dd}`;

      setForm((prev) => ({
        ...prev,
        contractEndDate: todayString,
      }));
    }
  }, [form.status]);

  const updateList = (setter) => (i, field, value) =>
    setter((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );

  const addItem = (setter) => () => setter((prev) => [...prev, newItem()]);

  const removeItem = (setter) => (i) =>
    setter((prev) => prev.filter((_, idx) => idx !== i));

  // ── Build FormData gửi lên BE ──
  const buildFormData = () => {
    const fd = new FormData();

    // Text fields
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

    // File CCHN mới (Loại 0)
    if (licenseFile instanceof File)
      fd.append("PracticingLicenseFile", licenseFile);

    // RetainedDocumentIds: ID của tất cả document cũ còn giữ lại (0, 1, 2, 3)
    if (existingLicense) {
      fd.append("RetainedDocumentIds", existingLicense.id);
    }
    [...degrees, ...certificates, ...nonMedicalDocs]
      .filter((item) => item.isOld === true)
      .forEach((item) => fd.append("RetainedDocumentIds", item.id));

    // Bằng cấp Y tế MỚI (Loại 1)
    degrees
      .filter((item) => !item.isOld && item.file instanceof File)
      .forEach((item) => {
        fd.append("NewDegreeNames", item.name);
        fd.append("NewDegreeFiles", item.file);
      });

    // Chứng chỉ đào tạo MỚI (Loại 2)
    certificates
      .filter((item) => !item.isOld && item.file instanceof File)
      .forEach((item) => {
        fd.append("NewCertificateNames", item.name);
        fd.append("NewCertificateFiles", item.file);
      });

    // Bằng cấp ngoài y tế MỚI (Loại 3)
    nonMedicalDocs
      .filter((item) => !item.isOld && item.file instanceof File)
      .forEach((item) => {
        fd.append("NewNonMedicalDegreeNames", item.name);
        fd.append("NewNonMedicalDegreeFiles", item.file);
      });

    return fd;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (formData) => updateEmployee({ id, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      alert("Cập nhật nhân viên thành công!");
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

  if (isLoading) return <Skeleton />;

  const SubmitBtn = (
    <button
      type="submit"
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
    >
      {isPending && <Loader2 size={15} className="animate-spin" />}
      {isPending ? "Đang cập nhật..." : "Cập nhật nhân viên"}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

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
              Chỉnh sửa nhân viên
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{form.fullName}</p>
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
              value={form.employeeCode ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Họ và tên *">
            <input
              name="fullName"
              value={form.fullName ?? ""}
              onChange={set}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Giới tính">
            <select
              name="gender"
              value={form.gender ?? "Nam"}
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
              value={form.dateOfBirth ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Số CCCD / CMND">
            <input
              name="identityNumber"
              value={form.identityNumber ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Ngày cấp CCCD">
            <input
              type="date"
              name="identityIssueDate"
              value={form.identityIssueDate ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Nơi cấp CCCD" wide>
            <input
              name="identityIssuePlace"
              value={form.identityIssuePlace ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              name="email"
              value={form.email ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Địa chỉ thường trú" wide>
            <input
              name="permanentAddress"
              value={form.permanentAddress ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Địa chỉ hiện tại" wide>
            <input
              name="currentAddress"
              value={form.currentAddress ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
        </Card>

        {/* ── Card 2: Chuyên môn & Bằng cấp (Đã tối ưu: bỏ ô nhập text thừa, chỉ giữ danh sách đính kèm) ── */}
        <Card title="Chuyên môn Y tế & Bằng cấp">
          {/* KHU VỰC 1: TRÌNH ĐỘ Y TẾ (Cùng hàng, kèm PDF Loại 1) */}
          <Field label="Trình độ / Bằng cấp chuyên môn Y tế">
            <input
              name="educationLevel"
              value={form.educationLevel ?? ""}
              onChange={set}
              placeholder="VD: Đại học, Bác sĩ Đa khoa..."
              className={inputCls}
            />
          </Field>
          <Field label="Năm tốt nghiệp">
            <input
              name="graduationYear"
              value={form.graduationYear ?? ""}
              onChange={set}
              placeholder="VD: 2022"
              className={inputCls}
            />
          </Field>

          <DynamicList
            label="📎 File bằng cấp Y tế đính kèm (Loại 1):"
            addLabel="Thêm file bằng cấp Y tế"
            items={degrees}
            onChange={updateList(setDegrees)}
            onAdd={addItem(setDegrees)}
            onRemove={removeItem(setDegrees)}
            onPreview={setPreviewDoc}
          />

          {/* KHU VỰC 2: CCHN / GPHN (Kèm PDF Loại 0) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Số CCHN / GPHN">
              <input
                name="practicingLicenseNumber"
                value={form.practicingLicenseNumber ?? ""}
                onChange={set}
                className={inputCls}
              />
            </Field>
            <Field label="Ngày cấp CCHN / GPHN">
              <input
                type="date"
                name="licenseIssueDate"
                value={form.licenseIssueDate ?? ""}
                onChange={set}
                className={inputCls}
              />
            </Field>
            <Field label="Nơi cấp CCHN / GPHN" wide>
              <input
                name="licenseIssuePlace"
                value={form.licenseIssuePlace ?? ""}
                onChange={set}
                placeholder="VD: Sở Y tế Đắk Lắk"
                className={inputCls}
              />
            </Field>

            {/* Quản lý file CCHN (Loại 0) */}
            <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-indigo-900/70">
                📎 File CCHN / GPHN đính kèm (Loại 0):
              </p>

              {existingLicense && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-white border border-slate-200">
                  {isPdf(existingLicense.filePath) ? (
                    <div className="w-7 h-7 rounded bg-red-50 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-red-400" />
                    </div>
                  ) : (
                    <img
                      src={fileUrl(existingLicense.filePath)}
                      alt=""
                      className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <span className="flex-1 text-xs text-slate-600 truncate font-medium">
                    {existingLicense.documentName ||
                      existingLicense.filePath.split("/").pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewDoc({
                        ...existingLicense,
                        name: existingLicense.documentName,
                      })
                    }
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExistingLicense(null)}
                    className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("licenseFileInput").click()
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Paperclip size={13} />
                  {licenseFile
                    ? "Đổi file mới"
                    : existingLicense
                      ? "Thay thế file CCHN"
                      : "Đính kèm file CCHN"}
                </button>
                {licenseFile && (
                  <span className="text-xs text-indigo-600 truncate max-w-[200px] font-medium">
                    ✓ {licenseFile.name}
                  </span>
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
                value={form.professionalScope ?? ""}
                onChange={set}
                placeholder="VD: Khám bệnh, chữa bệnh Nội khoa..."
                className={inputCls}
              />
            </Field>
          </div>

          {/* KHU VỰC 4: CHỨNG CHỈ KÈM THEO (Loại 2) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <DynamicList
              label="📎 Chứng chỉ đào tạo kèm theo (Kèm file):"
              addLabel="Thêm chứng chỉ mới"
              items={certificates}
              onChange={updateList(setCertificates)}
              onAdd={addItem(setCertificates)}
              onRemove={removeItem(setCertificates)}
              onPreview={setPreviewDoc}
            />
          </div>

          {/* KHU VỰC 5: BẰNG CẤP NGOÀI Y TẾ (Loại 3) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <DynamicList
              label="📎 Bằng cấp không thuộc lĩnh vực y tế (Kèm file):"
              addLabel="Thêm văn bằng ngoài y tế"
              items={nonMedicalDocs}
              onChange={updateList(setNonMedicalDocs)}
              onAdd={addItem(setNonMedicalDocs)}
              onRemove={removeItem(setNonMedicalDocs)}
              onPreview={setPreviewDoc}
            />
          </div>
        </Card>

        {/* ── Card 3: Công tác & Hợp đồng ── */}
        <Card title="Công tác & Hợp đồng">
          <Field label="Chức danh chuyên môn">
            <input
              name="professionalTitle"
              value={form.professionalTitle ?? ""}
              onChange={set}
              placeholder="VD: Bác sĩ, Điều dưỡng..."
              className={inputCls}
            />
          </Field>
          <Field label="Vị trí làm việc">
            <input
              name="jobPosition"
              value={form.jobPosition ?? ""}
              onChange={set}
              placeholder="VD: Bác sĩ điều trị..."
              className={inputCls}
            />
          </Field>
          <Field label="Khoa phòng làm việc" wide>
            <input
              name="department"
              value={form.department ?? ""}
              onChange={set}
              placeholder="VD: Phòng Khám Nội 1, Phòng Siêu âm (Có thể điền nhiều)"
              className={inputCls}
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
          <Field label="Ngày bắt đầu làm việc">
            <input
              type="date"
              name="startDate"
              value={form.startDate ?? ""}
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
              value={form.contractEndDate ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Trạng thái">
            <select
              name="status"
              value={form.status ?? "Active"}
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
              value={form.basicSalary ?? ""}
              onChange={set}
              className={inputCls}
              min={0}
            />
          </Field>
          <Field label="Ngân hàng">
            <input
              name="bankName"
              value={form.bankName ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Số tài khoản">
            <input
              name="bankAccountNumber"
              value={form.bankAccountNumber ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Số sổ BHXH">
            <input
              name="socialInsuranceNumber"
              value={form.socialInsuranceNumber ?? ""}
              onChange={set}
              className={inputCls}
            />
          </Field>
          <Field label="Ngày bắt đầu BHXH">
            <input
              type="date"
              name="socialInsuranceStartDate"
              value={form.socialInsuranceStartDate ?? ""}
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
