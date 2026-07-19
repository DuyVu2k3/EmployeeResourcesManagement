import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UserPlus, Eye, Pencil, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllEmployees } from "../api/employeeService";
import { getBranches } from "../api/branchService";

const STATUS = {
  Active: { label: "Đang làm", cls: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60" },
  Inactive: { label: "Nghỉ việc", cls: "bg-slate-100 text-slate-400 ring-1 ring-slate-200/60" },
  OnLeave: { label: "Nghỉ phép", cls: "bg-amber-50 text-amber-600 ring-1 ring-amber-200/60" },
};

function StatusBadge({ status }) {
  const s = STATUS[status] ?? {
    label: status,
    cls: "bg-slate-100 text-slate-400 ring-1 ring-slate-200/60",
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

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className={`h-3.5 bg-slate-100 rounded-full animate-pulse ${i === 1 ? "w-32" : i === 7 ? "w-16" : "w-24"}`}
          />
        </td>
      ))}
    </tr>
  );
}

const COLUMNS = [
  "Mã NV",
  "Họ và tên",
  "Phòng ban / Chuyên khoa",
  "Cơ sở",
  "Chức danh",
  "Số điện thoại",
  "Trạng thái",
  "Thao tác",
];

export default function EmployeeList() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: employees = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["employees", selectedBranchId],
    queryFn: () => getAllEmployees(selectedBranchId || undefined),
  });

  useEffect(() => {
    let isMounted = true;

    getBranches()
      .then((data) => {
        if (!isMounted) return;
        setBranches(Array.isArray(data) ? data : data?.items ?? []);
      })
      .catch(() => {
        if (isMounted) setBranches([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return employees;

    return employees.filter((emp) =>
      [emp.fullName, emp.employeeCode, emp.department, emp.professionalTitle, emp.branchName]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term)),
    );
  }, [employees, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Nhân viên</h2>
        <p className="text-sm text-slate-500 mt-1.5">Quản lý toàn bộ nhân sự trong hệ thống</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-800">Danh sách nhân viên</p>
            {!isLoading && (
              <p className="text-xs text-slate-400 mt-0.5">
                {filteredEmployees.length} người trong hệ thống
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm"
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="whitespace-nowrap">Cơ sở</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="min-w-[200px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">-- Tất cả cơ sở --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>

            <Button
              onClick={() => navigate("/employees/create")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl h-9 px-4 text-sm gap-1.5 transition-all duration-200 hover:shadow-md hover:-translate-y-px"
            >
              <Plus className="h-4 w-4" /> Thêm nhân viên
            </Button>
          </div>
        </div>

        {isError && (
          <div className="flex items-center gap-3 mx-5 mt-4 mb-1 px-4 py-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
            <UserPlus size={15} className="shrink-0" />
            {error?.message ?? "Không thể tải danh sách nhân viên."}
          </div>
        )}

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-sm border-separate border-spacing-y-0">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50/70 first:rounded-l-xl last:rounded-r-xl"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <UserPlus size={28} className="text-slate-200" />
                      <span>Chưa có nhân viên nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    className={`border-b border-slate-50 last:border-0 hover:bg-indigo-50/40 transition-colors duration-150 group ${
                      idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    }`}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {emp.employeeCode ?? "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 select-none ring-2 ring-white">
                          {emp.fullName?.[0] ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 whitespace-nowrap leading-tight text-sm">
                            {emp.fullName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-slate-700 font-medium whitespace-nowrap text-sm">
                        {emp.department ?? "—"}
                      </p>
                      {emp.professionalSpecialty && (
                        <p className="text-xs text-slate-400 mt-0.5">{emp.professionalSpecialty}</p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {emp.branchName || "Chưa phân bổ"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap text-sm">
                      {emp.professionalTitle ?? "—"}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap tabular-nums text-sm">
                      {emp.phoneNumber ?? "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={emp.status} />
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150"
                          title="Xem chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/employees/edit/${emp.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-150"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
