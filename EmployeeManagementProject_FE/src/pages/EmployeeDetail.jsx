import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  FileText,
  Eye,
  X,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { getEmployeeById } from "../api/employeeService";
import { getBranches } from "../api/branchService";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://clinichr-api.runasp.net/api"
).replace(/\/api\/?$/, "");

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d.toLocaleDateString("vi-VN");
};
const fmtVND = (v) =>
  v != null ? new Intl.NumberFormat("vi-VN").format(v) + " VNĐ" : null;

const NA = <span className="text-slate-300 font-normal">Chưa cập nhật</span>;
const display = (v, fmt) => {
  const r = fmt ? fmt(v) : v;
  return r != null && r !== "" ? r : NA;
};
const isPdf = (path) => path?.toLowerCase().endsWith(".pdf");
const fileUrl = (path) => BASE_URL + path;

const resolveBranchName = (branchName, branchId, branches) => {
  if (branchName) return branchName;
  const branch = branches.find(
    (item) => item.id?.toString() === branchId?.toString(),
  );
  return branch?.name || null;
};

// ─── Preview Modal ───────────────────────────────────────────────────────────

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

// ─── UI Primitives ───────────────────────────────────────────────────────────

const STATUS = {
  Active: {
    label: "Đang làm",
    cls: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70",
  },
  Inactive: {
    label: "Nghỉ việc",
    cls: "bg-slate-100  text-slate-500  ring-1 ring-slate-200/70",
  },
  OnLeave: {
    label: "Nghỉ phép",
    cls: "bg-amber-50   text-amber-600  ring-1 ring-amber-200/70",
  },
};

function StatusBadge({ status }) {
  const s = STATUS[status] ?? {
    label: status,
    cls: "bg-slate-100 text-slate-500 ring-1 ring-slate-200/70",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      {s.label}
    </span>
  );
}

function Field({ label, value, wide, children }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 font-medium">{value}</p>
      {children && <div className="mt-2 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h3 className="text-sm font-semibold text-indigo-600 border-b border-slate-100 pb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {children}
      </div>
    </div>
  );
}

// ─── DocItem with Eye preview ─────────────────────────────────────────────────

function DocItem({ doc, onPreview }) {
  const url = fileUrl(doc.filePath);
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 group">
      {isPdf(doc.filePath) ? (
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 ring-1 ring-rose-100/70">
          <FileText size={18} className="text-rose-500" />
        </div>
      ) : (
        <img
          src={url}
          alt={doc.documentName}
          className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-700 truncate leading-tight">
          {doc.documentName || doc.filePath.split("/").pop()}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">
          {isPdf(doc.filePath) ? "PDF" : "Ảnh"}
        </p>
      </div>
      <button
        onClick={() => onPreview(doc)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 shrink-0 opacity-0 group-hover:opacity-100"
        title="Xem trước"
      >
        <Eye size={14} />
      </button>
    </div>
  );
}

// DocBadge: pill-style badge dùng trong Card Chuyên môn
function DocBadge({ doc, onPreview }) {
  return (
    <button
      type="button"
      onClick={() => onPreview(doc)}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 hover:border-indigo-200 transition-all duration-150 ring-1 ring-indigo-100/50"
    >
      {isPdf(doc.filePath) ? <FileText size={11} /> : <Eye size={11} />}
      {doc.documentName || doc.filePath.split("/").pop()}
    </button>
  );
}

function DocGroup({ title, docs, onPreview }) {
  if (!docs.length) return null;
  return (
    <div className="sm:col-span-2 space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {docs.map((d) => (
          <DocItem key={d.id} doc={d} onPreview={onPreview} />
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-52 bg-slate-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [previewDoc, setPreviewDoc] = useState(null);
  const [branches, setBranches] = useState([]);

  const {
    data: e,
    isLoading,
    isError,
  } = useQuery({
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

  if (isLoading) return <Skeleton />;
  if (isError || !e)
    return (
      <div className="py-20 text-center text-sm text-slate-400">
        Không tìm thấy nhân viên.{" "}
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-500 hover:underline"
        >
          Quay lại
        </button>
      </div>
    );

  // Quy ước Type từ Backend: 0: CCHN/GPHN | 1: Bằng Y tế | 2: Chứng chỉ kèm theo | 3: Bằng ngoài Y tế
  const docsByType = (type) =>
    (e.documents ?? []).filter((d) => d.documentType === type);

  return (
    <div className="space-y-5">
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold shrink-0 select-none ring-2 ring-white shadow-sm">
              {e.fullName?.[0] ?? "?"}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {e.fullName}
                </h1>
                <StatusBadge status={e.status} />
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                {[e.professionalTitle, e.jobPosition, e.department]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/employees/edit/${e.id}`)}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-sm text-slate-600 hover:text-indigo-700 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
            >
              <Pencil size={14} />
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Thẻ 1: Thông tin cá nhân & Liên hệ (Đã đủ CCCD, SĐT, Email, Nơi cấp...) */}
        <Card title="Thông tin cá nhân & Liên hệ">
          <Field label="Mã nhân viên" value={display(e.employeeCode)} />
          <Field label="Giới tính" value={display(e.gender)} />
          <Field label="Ngày sinh" value={display(e.dateOfBirth, fmtDate)} />
          <Field label="Số CCCD / CMND" value={display(e.identityNumber)} />
          <Field
            label="Ngày cấp CCCD"
            value={display(e.identityIssueDate, fmtDate)}
          />
          <Field label="Nơi cấp CCCD" value={display(e.identityIssuePlace)} />
          <Field label="Số điện thoại" value={display(e.phoneNumber)} />
          <Field label="Email" value={display(e.email)} />
          <Field
            label="Địa chỉ thường trú"
            value={display(e.permanentAddress)}
            wide
          />
          <Field
            label="Địa chỉ hiện tại"
            value={display(e.currentAddress)}
            wide
          />
        </Card>

        {/* Thẻ 2: Chuyên môn Y tế & Bằng cấp (Bản rút gọn sạch sẽ) */}
        <Card title="Chuyên môn Y tế & Bằng cấp">
          {/* Hàng 1: Trình độ + Năm tốt nghiệp */}
          <Field
            label="Trình độ / Bằng cấp chuyên môn Y tế"
            value={display(e.educationLevel)}
          />
          <Field label="Năm tốt nghiệp" value={display(e.graduationYear)} />

          {/* PDF Bằng Y tế (Loại 1) */}
          <div className="sm:col-span-2 -mt-2">
            <div className="flex flex-wrap gap-2">
              {docsByType(1).map((d) => (
                <DocBadge key={d.id} doc={d} onPreview={setPreviewDoc} />
              ))}
            </div>
          </div>

          {/* Hàng 2: Thông tin CCHN */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Số CCHN / GPHN"
              value={display(e.practicingLicenseNumber)}
            />
            <Field
              label="Ngày cấp CCHN / GPHN"
              value={display(e.licenseIssueDate, fmtDate)}
            />
            <Field
              label="Nơi cấp CCHN / GPHN"
              value={display(e.licenseIssuePlace)}
              wide
            />
          </div>

          {/* PDF CCHN (Loại 0) */}
          <div className="sm:col-span-2 -mt-2">
            <div className="flex flex-wrap gap-2">
              {docsByType(0).map((d) => (
                <DocBadge key={d.id} doc={d} onPreview={setPreviewDoc} />
              ))}
            </div>
          </div>

          {/* Hàng 3: Phạm vi hoạt động (Chỉ hiện Text) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-3">
            <Field
              label="Phạm vi hoạt động CM (Theo GPHN)"
              value={display(e.professionalScope)}
              wide
            />
          </div>

          {/* Hàng 4: Chứng chỉ đào tạo (Chỉ hiện Badge file Type 2) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-3 space-y-1">
            <p className="text-xs font-medium text-slate-500">
              Chứng chỉ đào tạo kèm theo:
            </p>
            <div className="flex flex-wrap gap-2">
              {docsByType(2).map((d) => (
                <DocBadge key={d.id} doc={d} onPreview={setPreviewDoc} />
              ))}
            </div>
          </div>

          {/* Hàng 5: Bằng ngoài y tế (Chỉ hiện Badge file Type 3) */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-3 space-y-1">
            <p className="text-xs font-medium text-slate-500">
              Bằng cấp không thuộc lĩnh vực y tế:
            </p>
            <div className="flex flex-wrap gap-2">
              {docsByType(3).map((d) => (
                <DocBadge key={d.id} doc={d} onPreview={setPreviewDoc} />
              ))}
            </div>
          </div>
        </Card>

        {/* Thẻ 3: Công tác & Hợp đồng (Đã tối ưu Chức danh, Vị trí làm việc, Khoa phòng làm việc) */}
        <Card title="Công tác & Hợp đồng">
          <Field
            label="Chức danh chuyên môn"
            value={display(e.professionalTitle)}
          />
          <Field label="Vị trí làm việc" value={display(e.jobPosition)} />
          <Field
            label="Khoa phòng làm việc"
            value={display(e.department)}
            wide
          />
          <Field
            label="Cơ sở làm việc"
            value={display(
              resolveBranchName(e.branchName, e.branchId, branches),
            )}
            wide
          />
          <Field
            label="Ngày bắt đầu làm việc"
            value={display(e.startDate, fmtDate)}
          />
          <Field
            label="Ngày kết thúc HĐ"
            value={display(e.contractEndDate, fmtDate)}
          />
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Trạng thái</p>
            <StatusBadge status={e.status} />
          </div>
        </Card>

        {/* Thẻ 4: Tài chính & Bảo hiểm */}
        <Card title="Tài chính & Bảo hiểm">
          <Field
            label="Lương cơ bản"
            value={display(e.basicSalary, fmtVND)}
            wide
          />
          <Field label="Ngân hàng" value={display(e.bankName)} />
          <Field label="Số tài khoản" value={display(e.bankAccountNumber)} />
          <Field label="Số sổ BHXH" value={display(e.socialInsuranceNumber)} />
          <Field
            label="Ngày bắt đầu BHXH"
            value={display(e.socialInsuranceStartDate, fmtDate)}
          />
        </Card>

        {/* Card 5 – Hồ sơ & Tài liệu (Khối tổng hợp bên dưới để xem trước ảnh/PDF dạng Card lớn) */}
        {e.documents?.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-semibold text-indigo-600 border-b border-slate-100 pb-3">
              Hồ sơ & Tài liệu đính kèm
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <DocGroup
                title="Phạm vi hoạt động / GPHN"
                docs={docsByType(0)}
                onPreview={setPreviewDoc}
              />
              <DocGroup
                title="Bằng cấp chuyên môn Y tế"
                docs={docsByType(1)}
                onPreview={setPreviewDoc}
              />
              <DocGroup
                title="Chứng chỉ đào tạo kèm theo"
                docs={docsByType(2)}
                onPreview={setPreviewDoc}
              />
              <DocGroup
                title="Bằng cấp ngoài ngành Y tế"
                docs={docsByType(3)}
                onPreview={setPreviewDoc}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
