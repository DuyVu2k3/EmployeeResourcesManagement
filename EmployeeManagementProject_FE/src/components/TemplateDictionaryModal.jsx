import React, { useState } from 'react';

// Dữ liệu từ điển 2 cột chuẩn gọn gàng
// Dữ liệu từ điển chuẩn 100% theo Model Employee.cs (Backend)
const dictionaryGroups = [
  {
    title: "🏢 1. Nhóm Thông tin Cơ sở & Công ty",
    sourceMenu: "Lấy từ menu: Quản lý Chi nhánh / Cài đặt hệ thống",
    items: [
      { tag: "{{TenCongTyInHoa}}", source: "Ô 'Tên công ty chủ quản' (Hệ thống tự viết IN HOA)" },
      { tag: "{{TenCoSoInHoa}}", source: "Ô 'Tên chi nhánh' (Hệ thống tự viết IN HOA)" },
      { tag: "{{TenCongTy}}", source: "Ô 'Tên công ty chủ quản' (Chữ thường theo người nhập)" },
      { tag: "{{TenCoSo}}", source: "Ô 'Tên chi nhánh' (Chữ thường theo người nhập)" },
      { tag: "{{MaChiNhanh}}", source: "Ô 'Mã viết tắt' (VD: YDBM, HT, TA...)" },
      { tag: "{{DiaChiCoSo}}", source: "Ô 'Địa chỉ' của chi nhánh" },
      { tag: "{{SDTCoSo}}", source: "Ô 'Số điện thoại' của chi nhánh" },
    ]
  },
  {
    title: "👤 2. Nhóm Thông tin Cá nhân Nhân viên (Employee - Nhóm 1)",
    sourceMenu: "Lấy từ menu: Hồ sơ nhân viên ➔ Tab Thông tin cá nhân & Liên hệ",
    items: [
      { tag: "{{MaNhanVien}}", source: "Ô 'Mã nhân viên' (EmployeeCode)" },
      { tag: "{{TenNhanVien}}", source: "Ô 'Họ và tên' (FullName)" },
      { tag: "{{DanhXungVietHoa}}", source: "Ô 'Giới tính' (Tự chuyển thành Ông / Bà)" },
      { tag: "{{DanhXung}}", source: "Ô 'Giới tính' (Tự chuyển thành ông / bà)" },
      { tag: "{{GioiTinh}}", source: "Ô 'Giới tính' gốc (Nam / Nữ)" },
      { tag: "{{NgaySinh}}", source: "Ô 'Ngày sinh' (DateOfBirth - Tự format dd/MM/yyyy)" },
      { tag: "{{SoCCCD}}", source: "Ô 'Số CCCD' (IdentityNumber)" },
      { tag: "{{NgayCapCCCD}}", source: "Ô 'Ngày cấp CCCD' (IdentityIssueDate)" },
      { tag: "{{NoiCapCCCD}}", source: "Ô 'Nơi cấp CCCD' (IdentityIssuePlace)" },
      { tag: "{{DiaChi}}", source: "Ô 'Địa chỉ hiện tại' (CurrentAddress - Ưu tiên hiển thị)" },
      { tag: "{{DiaChiThuongTru}}", source: "Ô 'Địa chỉ thường trú' (PermanentAddress)" },
      { tag: "{{SDTNhanVien}}", source: "Ô 'Số điện thoại' cá nhân (PhoneNumber)" },
      { tag: "{{Email}}", source: "Ô 'Email' cá nhân (Email)" },
    ]
  },
  {
    title: "🎓 3. Nhóm Bằng cấp & Chứng chỉ hành nghề (Employee - Nhóm 2)",
    sourceMenu: "Lấy từ menu: Hồ sơ nhân viên ➔ Tab Chuyên môn Y tế & Bằng cấp",
    items: [
      { tag: "{{SoGPHN}}", source: "Ô 'Số chứng chỉ / GPHN' (PracticingLicenseNumber)" },
      { tag: "{{NgayCapGPHN}}", source: "Ô 'Ngày cấp GPHN' (LicenseIssueDate)" },
      { tag: "{{NoiCapGPHN}}", source: "Ô 'Nơi cấp GPHN' (LicenseIssuePlace)" },
      { tag: "{{VanBang}}", source: "Ô 'Trình độ / Văn bằng' (EducationLevel)" },
      { tag: "{{NamTotNghiep}}", source: "Ô 'Năm tốt nghiệp' (GraduationYear)" },
      { tag: "{{PhamViHanhNghe}}", source: "Ô 'Phạm vi chuyên môn' (ProfessionalScope)" },
      { tag: "{{KhoaPhong}}", source: "Ô 'Khoa / Phạm vi phụ trách' (Dùng chung ProfessionalScope)" },
    ]
  },
  {
    title: "💼 4. Nhóm Thông tin Công việc & Hợp đồng (Employee - Nhóm 3)",
    sourceMenu: "Lấy từ menu: Hồ sơ nhân viên ➔ Tab Công việc / Hợp đồng",
    items: [
      { tag: "{{ChucDanh}}", source: "Ô 'Chức danh chuyên môn' (ProfessionalTitle)" },
      { tag: "{{ViTriCongViec}}", source: "Ô 'Vị trí công việc / Chức vụ' (JobPosition)" },
      { tag: "{{PhongBan}}", source: "Ô 'Phòng ban làm việc' (Department)" },
      { tag: "{{TuNgay}}", source: "Ô 'Ngày bắt đầu làm việc' (StartDate)" },
      { tag: "{{DenNgay}}", source: "Ô 'Ngày kết thúc hợp đồng' (ContractEndDate)" },
      { tag: "{{SoBHXH}}", source: "Ô 'Số BHXH' (SocialInsuranceNumber)" },
      { tag: "{{NgayBD_BHXH}}", source: "Ô 'Ngày tham gia BHXH' (SocialInsuranceStartDate)" },
      { tag: "{{SoTaiKhoan}}", source: "Ô 'Số tài khoản ngân hàng' (BankAccountNumber)" },
      { tag: "{{TenNganHang}}", source: "Ô 'Tên ngân hàng' (BankName)" },
      { tag: "{{LuongCoBan}}", source: "Ô 'Lương cơ bản' (BasicSalary - Tự format tiền tệ VNĐ)" },
    ]
  },
  {
    title: "🕒 5. Nhóm Thời gian xuất văn bản",
    sourceMenu: "Hệ thống tự động lấy thời gian thực lúc bấm nút xuất quyết định",
    items: [
      { tag: "{{NgayHienTai}}", source: "Tự lấy Ngày hôm nay (2 chữ số, VD: 18)" },
      { tag: "{{ThangHienTai}}", source: "Tự lấy Tháng hôm nay (2 chữ số, VD: 07)" },
      { tag: "{{NamHienTai}}", source: "Tự lấy Năm hôm nay (4 chữ số, VD: 2026)" },
      { tag: "{{NgayApDung}}", source: "Tự lấy ngày đầy đủ (VD: 18/07/2026)" },
    ]
  }
];

export default function TemplateDictionaryModal({ isOpen, onClose }) {
  const [copiedTag, setCopiedTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  // Xử lý copy thẻ
  const handleCopy = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(""), 2000);
  };

  // Lọc dữ liệu khi tìm kiếm
  const filteredGroups = dictionaryGroups.map(group => ({
    ...group,
    items: group.items.filter(
      item => 
        item.tag.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.source.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header Modal */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Từ Điển Từ Khóa Biểu Mẫu Quyết Định
            </h2>
            <p className="text-blue-100 text-xs mt-0.5">
              Bấm vào thẻ để sao chép (Copy), sau đó dán (Ctrl + V) vào file Word biểu mẫu (.docx).
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          >
            ✕ Đóng
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Tìm nhanh thẻ hoặc vị trí lấy (VD: CCCD, bằng cấp, chi nhánh...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs bg-gray-100 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Nội dung Bảng 2 Cột - Có Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-base font-medium">Không tìm thấy thẻ nào phù hợp với "{searchTerm}" 😢</p>
              <button onClick={() => setSearchTerm("")} className="mt-2 text-sm text-blue-600 underline">Xem tất cả thẻ</button>
            </div>
          ) : (
            filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                {/* Tiêu đề nhóm */}
                <div className="bg-indigo-50/80 px-4 py-2.5 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-indigo-900">{group.title}</h3>
                  <p className="text-xs font-medium text-indigo-600 mt-0.5">📌 {group.sourceMenu}</p>
                </div>
                
                {/* Bảng 2 cột */}
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                      <th className="py-2.5 px-4 w-5/12">Thẻ trong biểu mẫu Word</th>
                      <th className="py-2.5 px-4 w-7/12">Lấy từ đâu trên Web?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="hover:bg-blue-50/40 transition-colors">
                        {/* Cột 1: Thẻ (Bấm để copy) */}
                        <td className="py-2.5 px-4 font-mono">
                          <button
                            onClick={() => handleCopy(item.tag)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                              copiedTag === item.tag
                                ? "bg-green-600 text-white scale-95"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200"
                            }`}
                            title="Bấm để copy vào clipboard"
                          >
                            <span>{copiedTag === item.tag ? "✓ Đã copy!" : item.tag}</span>
                          </button>
                        </td>
                        {/* Cột 2: Vị trí trên Web */}
                        <td className="py-2.5 px-4 text-gray-700 font-medium">
                          {item.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 px-6">
          <span>Gợi ý: Các thẻ phân biệt chữ HOA / chữ thường, cần giữ nguyên ngoặc nhọn kép.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
          >
            Đã hiểu & Đóng
          </button>
        </div>

      </div>
    </div>
  );
}