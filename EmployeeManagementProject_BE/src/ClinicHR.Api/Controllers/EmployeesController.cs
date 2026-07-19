using ClinicHR.Api.Data;
using ClinicHR.Api.DTOs;
using ClinicHR.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicHR.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeesController(AppDbContext db, IWebHostEnvironment env) : ControllerBase
{
    private const string UploadFolder = "uploads/documents";

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? branchId)
    {
        var query = db.Employees
            .Include(e => e.Documents)
            .Include(e => e.Branch)
            .AsQueryable();

        if (branchId.HasValue && branchId.Value > 0)
        {
            query = query.Where(e => e.BranchId == branchId.Value);
        }

        var employees = await query.Select(e => new
        {
            e.Id,
            e.EmployeeCode,
            e.FullName,
            e.Gender,
            e.DateOfBirth,
            e.IdentityNumber,
            e.PhoneNumber,
            e.Email,
            e.PracticingLicenseNumber,
            e.EducationLevel,
            e.GraduationYear,
            e.ProfessionalScope,
            e.ProfessionalTitle,
            e.JobPosition,
            e.Department,
            e.StartDate,
            e.ContractEndDate,
            e.BasicSalary,
            e.Status,
            e.Documents,
            BranchId = e.BranchId,
            BranchName = e.Branch != null ? e.Branch.Name : "Chưa phân bổ"
        }).ToListAsync();

        return Ok(employees);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await db.Employees
            .Include(e => e.Documents)
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id);

        return employee is null ? NotFound() : Ok(employee);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] EmployeeCreateFormDto dto)
    {
        var employee = new Employee
        {
            EmployeeCode = dto.EmployeeCode,
            FullName = dto.FullName,
            Gender = dto.Gender,
            DateOfBirth = dto.DateOfBirth,
            IdentityNumber = dto.IdentityNumber,
            IdentityIssueDate = dto.IdentityIssueDate,
            IdentityIssuePlace = dto.IdentityIssuePlace,
            PermanentAddress = dto.PermanentAddress,
            CurrentAddress = dto.CurrentAddress,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            PracticingLicenseNumber = dto.PracticingLicenseNumber,
            LicenseIssueDate = dto.LicenseIssueDate,
            LicenseIssuePlace = dto.LicenseIssuePlace,
            EducationLevel = dto.EducationLevel,
            GraduationYear = dto.GraduationYear,
            ProfessionalScope = dto.ProfessionalScope,
            ProfessionalTitle = dto.ProfessionalTitle,
            JobPosition = dto.JobPosition,
            Department = dto.Department,
            StartDate = dto.StartDate,
            SocialInsuranceNumber = dto.SocialInsuranceNumber,
            SocialInsuranceStartDate = dto.SocialInsuranceStartDate,
            BankAccountNumber = dto.BankAccountNumber,
            BankName = dto.BankName,
            ContractEndDate = dto.ContractEndDate,
            BasicSalary = dto.BasicSalary,
            Status = dto.Status,
            BranchId = dto.BranchId
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync();

        if (dto.PracticingLicenseFile is not null)
        {
            var path = await SaveFileAsync(dto.PracticingLicenseFile, employee.Id);
            db.EmployeeDocuments.Add(new EmployeeDocument
            {
                EmployeeId = employee.Id,
                DocumentName = dto.PracticingLicenseNumber ?? "Chứng chỉ hành nghề",
                DocumentType = DocumentType.License,
                FilePath = path
            });
        }

        if (dto.DocumentFiles != null)
        {
            for (int i = 0; i < dto.DocumentFiles.Count; i++)
            {
                var path = await SaveFileAsync(dto.DocumentFiles[i], employee.Id);
                db.EmployeeDocuments.Add(new EmployeeDocument
                {
                    EmployeeId = employee.Id,
                    DocumentName = (dto.DocumentNames != null && i < dto.DocumentNames.Count) ? dto.DocumentNames[i] : dto.DocumentFiles[i].FileName,
                    DocumentType = (dto.DocumentTypes != null && i < dto.DocumentTypes.Count) ? dto.DocumentTypes[i] : DocumentType.Certificate,
                    FilePath = path
                });
            }
        }

        if (dto.DegreeFiles != null && dto.DegreeFiles.Count > 0)
        {
            for (int i = 0; i < dto.DegreeFiles.Count; i++)
            {
                var path = await SaveFileAsync(dto.DegreeFiles[i], employee.Id);
                db.EmployeeDocuments.Add(new EmployeeDocument
                {
                    EmployeeId = employee.Id,
                    DocumentName = (dto.DegreeNames != null && i < dto.DegreeNames.Count) ? dto.DegreeNames[i] : dto.DegreeFiles[i].FileName,
                    DocumentType = DocumentType.Degree,
                    FilePath = path
                });
            }
        }

        if (dto.CertificateFiles != null && dto.CertificateFiles.Count > 0)
        {
            for (int i = 0; i < dto.CertificateFiles.Count; i++)
            {
                var path = await SaveFileAsync(dto.CertificateFiles[i], employee.Id);
                db.EmployeeDocuments.Add(new EmployeeDocument
                {
                    EmployeeId = employee.Id,
                    DocumentName = (dto.CertificateNames != null && i < dto.CertificateNames.Count) ? dto.CertificateNames[i] : dto.CertificateFiles[i].FileName,
                    DocumentType = DocumentType.Certificate,
                    FilePath = path
                });
            }
        }

        // Bằng cấp không thuộc lĩnh vực y tế (Loại 3) - ĐÃ MỞ COMMENT ĐỂ CODE HOẠT ĐỘNG
        if (dto.NonMedicalDegreeFiles != null && dto.NonMedicalDegreeFiles.Count > 0)
        {
            for (int i = 0; i < dto.NonMedicalDegreeFiles.Count; i++)
            {
                var path = await SaveFileAsync(dto.NonMedicalDegreeFiles[i], employee.Id);
                db.EmployeeDocuments.Add(new EmployeeDocument
                {
                    EmployeeId = employee.Id,
                    DocumentName = (dto.NonMedicalDegreeNames != null && i < dto.NonMedicalDegreeNames.Count) ? dto.NonMedicalDegreeNames[i] : dto.NonMedicalDegreeFiles[i].FileName,
                    DocumentType = DocumentType.NonMedicalDegree,
                    FilePath = path
                });
            }
        }

        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = employee.Id },
            await db.Employees.Include(e => e.Documents).Include(e => e.Branch).FirstAsync(e => e.Id == employee.Id));
    }

    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(int id, [FromForm] EmployeeUpdateFormDto dto)
    {
        var employee = await db.Employees.Include(e => e.Documents).FirstOrDefaultAsync(e => e.Id == id);
        if (employee is null) return NotFound();

        employee.EmployeeCode = dto.EmployeeCode;
        employee.FullName = dto.FullName;
        employee.Gender = dto.Gender;
        employee.DateOfBirth = dto.DateOfBirth;
        employee.IdentityNumber = dto.IdentityNumber;
        employee.IdentityIssueDate = dto.IdentityIssueDate;
        employee.IdentityIssuePlace = dto.IdentityIssuePlace;
        employee.PermanentAddress = dto.PermanentAddress;
        employee.CurrentAddress = dto.CurrentAddress;
        employee.PhoneNumber = dto.PhoneNumber;
        employee.Email = dto.Email;
        employee.PracticingLicenseNumber = dto.PracticingLicenseNumber;
        employee.LicenseIssueDate = dto.LicenseIssueDate;
        employee.LicenseIssuePlace = dto.LicenseIssuePlace;
        employee.EducationLevel = dto.EducationLevel;
        employee.GraduationYear = dto.GraduationYear;
        employee.ProfessionalScope = dto.ProfessionalScope;
        employee.ProfessionalTitle = dto.ProfessionalTitle;
        employee.JobPosition = dto.JobPosition;
        employee.Department = dto.Department;
        employee.StartDate = dto.StartDate;
        employee.SocialInsuranceNumber = dto.SocialInsuranceNumber;
        employee.SocialInsuranceStartDate = dto.SocialInsuranceStartDate;
        employee.BankAccountNumber = dto.BankAccountNumber;
        employee.BankName = dto.BankName;
        employee.ContractEndDate = dto.ContractEndDate;
        employee.BasicSalary = dto.BasicSalary;
        employee.Status = dto.Status;
        employee.BranchId = dto.BranchId;

        if (dto.PracticingLicenseFile is not null)
        {
            var oldLicense = employee.Documents.FirstOrDefault(d => d.DocumentType == DocumentType.License);
            if (oldLicense is not null)
            {
                DeletePhysicalFile(oldLicense.FilePath);
                db.EmployeeDocuments.Remove(oldLicense);
            }
            var path = await SaveFileAsync(dto.PracticingLicenseFile, id);
            db.EmployeeDocuments.Add(new EmployeeDocument
            {
                EmployeeId = id,
                DocumentName = dto.PracticingLicenseNumber ?? "Chứng chỉ hành nghề",
                DocumentType = DocumentType.License,
                FilePath = path
            });
        }

        var toDelete = employee.Documents
            .Where(d => d.DocumentType != DocumentType.License && !dto.RetainedDocumentIds.Contains(d.Id))
            .ToList();

        foreach (var doc in toDelete)
        {
            DeletePhysicalFile(doc.FilePath);
            db.EmployeeDocuments.Remove(doc);
        }

        if (dto.NewDocumentFiles != null)
        {
            for (int i = 0; i < dto.NewDocumentFiles.Count; i++)
            {
                var path = await SaveFileAsync(dto.NewDocumentFiles[i], id);
                db.EmployeeDocuments.Add(new EmployeeDocument
                {
                    EmployeeId = id,
                    DocumentName = (dto.NewDocumentNames != null && i < dto.NewDocumentNames.Count) ? dto.NewDocumentNames[i] : dto.NewDocumentFiles[i].FileName,
                    DocumentType = (dto.NewDocumentTypes != null && i < dto.NewDocumentTypes.Count) ? dto.NewDocumentTypes[i] : DocumentType.Certificate,
                    FilePath = path
                });
            }
        }

        if (dto.NewDegreeFiles != null && dto.NewDegreeFiles.Count > 0)
        {
            for (int i = 0; i < dto.NewDegreeFiles.Count; i++)
            {
                var path = await SaveFileAsync(dto.NewDegreeFiles[i], id);
                db.EmployeeDocuments.Add(new EmployeeDocument
                {
                    EmployeeId = id,
                    DocumentName = (dto.NewDegreeNames != null && i < dto.NewDegreeNames.Count) ? dto.NewDegreeNames[i] : dto.NewDegreeFiles[i].FileName,
                    DocumentType = DocumentType.Degree,
                    FilePath = path
                });
            }
        }

        if (dto.NewCertificateFiles != null && dto.NewCertificateFiles.Count > 0)
        {
            for (int i = 0; i < dto.NewCertificateFiles.Count; i++)
            {
                var path = await SaveFileAsync(dto.NewCertificateFiles[i], id);
                db.EmployeeDocuments.Add(new EmployeeDocument
                {
                    EmployeeId = id,
                    DocumentName = (dto.NewCertificateNames != null && i < dto.NewCertificateNames.Count) ? dto.NewCertificateNames[i] : dto.NewCertificateFiles[i].FileName,
                    DocumentType = DocumentType.Certificate,
                    FilePath = path
                });
            }
        }

        // Bằng cấp không thuộc lĩnh vực y tế (Loại 3) - ĐÃ MỞ COMMENT ĐỂ CODE HOẠT ĐỘNG
        if (dto.NewNonMedicalDegreeFiles != null && dto.NewNonMedicalDegreeFiles.Count > 0)
        {
            for (int i = 0; i < dto.NewNonMedicalDegreeFiles.Count; i++)
            {
                var path = await SaveFileAsync(dto.NewNonMedicalDegreeFiles[i], id);
                db.EmployeeDocuments.Add(new EmployeeDocument
                {
                    EmployeeId = id,
                    DocumentName = (dto.NewNonMedicalDegreeNames != null && i < dto.NewNonMedicalDegreeNames.Count) ? dto.NewNonMedicalDegreeNames[i] : dto.NewNonMedicalDegreeFiles[i].FileName,
                    DocumentType = DocumentType.NonMedicalDegree,
                    FilePath = path
                });
            }
        }

        await db.SaveChangesAsync();
        return Ok(await db.Employees.Include(e => e.Documents).Include(e => e.Branch).FirstAsync(e => e.Id == id));
    }

    // =========================================================================
    // 1. XUẤT QUYẾT ĐỊNH NGHỈ VIỆC / CHẤM DỨT HỢP ĐỒNG LAO ĐỘNG
    // =========================================================================
    [HttpGet("{id:int}/export-termination-contract")]
    public async Task<IActionResult> ExportTerminationContract(int id, [FromQuery] string? terminationDate = null)
    {
        var employee = await db.Employees
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null) return NotFound();

        var templatePath = Path.Combine(env.WebRootPath, "templates", "Template_ChamDutHopDong.docx");
        if (!System.IO.File.Exists(templatePath)) return NotFound("Template file not found.");

        string tenCongTy = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.CompanyName))
                           ? employee.Branch.CompanyName.Replace("\r\n", " ").Replace("\n", " ").Trim()
                           : "Công ty TNHH Y tế Đa khoa";

        string tenCoSo = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.Name))
                         ? employee.Branch.Name.Replace("\r\n", " ").Replace("\n", " ").Trim()
                         : "Phòng khám Đa khoa";

        string maChiNhanh = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.BranchCode))
                            ? employee.Branch.BranchCode.ToUpper() : "PKĐK";
        string diaChiCoSo = employee.Branch != null ? employee.Branch.Address : "Chưa cập nhật";
        string sdtCoSo = employee.Branch != null ? employee.Branch.PhoneNumber : "Chưa cập nhật";

        string danhXung = (employee.Gender?.ToLower() == "nữ") ? "bà" : "ông";
        string danhXungVietHoa = (employee.Gender?.ToLower() == "nữ") ? "Bà" : "Ông";

        var values = new Dictionary<string, object>
        {
            ["TenCongTy"] = tenCongTy,
            ["TenCoSo"] = tenCoSo,
            ["TenCongTyInHoa"] = tenCongTy.ToUpper(),
            ["TenCoSoInHoa"] = tenCoSo.ToUpper(),
            ["MaChiNhanh"] = maChiNhanh,
            ["DiaChiCoSo"] = diaChiCoSo,
            ["SDTCoSo"] = sdtCoSo,
            ["DanhXung"] = danhXung,
            ["DanhXungVietHoa"] = danhXungVietHoa,
            ["TenNhanVien"] = employee.FullName ?? string.Empty,
            ["KhoaPhong"] = employee.ProfessionalScope ?? string.Empty,
            ["PhongBan"] = employee.Department ?? string.Empty,
            ["PhamViHanhNghe"] = employee.ProfessionalScope ?? "...",
            ["ChucDanh"] = employee.ProfessionalTitle ?? employee.EducationLevel ?? "...",
            ["NgayHienTai"] = DateTime.Now.ToString("dd"),
            ["ThangHienTai"] = DateTime.Now.ToString("MM"),
            ["NamHienTai"] = DateTime.Now.ToString("yyyy"),
            ["NgayApDung"] = DateTime.Now.ToString("dd/MM/yyyy")
        };

        var stream = new MemoryStream();
        MiniSoftware.MiniWord.SaveAsByTemplate(stream, templatePath, values);
        stream.Position = 0;

        var fileName = $"QD-{maChiNhanh}_Cham dut hop dong lao dong_{employee.FullName}.docx";
        return File(stream, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
    }

    // =========================================================================
    // 2. XUẤT GIẤY XÁC NHẬN QUÁ TRÌNH HÀNH NGHỀ
    // =========================================================================
    [HttpGet("{id:int}/export-practice-certificate")]
    public async Task<IActionResult> ExportPracticeCertificate(int id)
    {
        var employee = await db.Employees
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null) return NotFound();

        var templatePath = Path.Combine(env.WebRootPath, "templates", "Template_GiayXacNhanHanhNghe.docx");
        if (!System.IO.File.Exists(templatePath)) return NotFound("Template file not found.");

        string tenCongTy = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.CompanyName))
                           ? employee.Branch.CompanyName.Replace("\r\n", " ").Replace("\n", " ").Trim()
                           : "Công ty TNHH Y tế Đa khoa";

        string tenCoSo = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.Name))
                         ? employee.Branch.Name.Replace("\r\n", " ").Replace("\n", " ").Trim()
                         : "Phòng khám Đa khoa";

        string maChiNhanh = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.BranchCode))
                            ? employee.Branch.BranchCode.ToUpper() : "PKĐK";
        string diaChiCoSo = employee.Branch != null ? employee.Branch.Address : "Chưa cập nhật";
        string sdtCoSo = employee.Branch != null ? employee.Branch.PhoneNumber : "Chưa cập nhật";

        string danhXung = (employee.Gender?.ToLower() == "nữ") ? "bà" : "ông";
        string danhXungVietHoa = (employee.Gender?.ToLower() == "nữ") ? "Bà" : "Ông";

        var values = new Dictionary<string, object>
        {
            ["TenCongTy"] = tenCongTy,
            ["TenCoSo"] = tenCoSo,
            ["TenCongTyInHoa"] = tenCongTy.ToUpper(),
            ["TenCoSoInHoa"] = tenCoSo.ToUpper(),
            ["MaChiNhanh"] = maChiNhanh,
            ["DiaChiCoSo"] = diaChiCoSo,
            ["SDTCoSo"] = sdtCoSo,
            ["DanhXung"] = danhXung,
            ["DanhXungVietHoa"] = danhXungVietHoa,
            ["TenNhanVien"] = employee.FullName ?? string.Empty,
            ["NgaySinh"] = employee.DateOfBirth?.ToString("dd/MM/yyyy") ?? "...",
            ["DiaChi"] = employee.CurrentAddress ?? employee.PermanentAddress ?? "...",
            ["SoCCCD"] = employee.IdentityNumber ?? "...",
            ["NgayCapCCCD"] = employee.IdentityIssueDate?.ToString("dd/MM/yyyy") ?? "...",
            ["NoiCapCCCD"] = employee.IdentityIssuePlace ?? "...",
            ["VanBang"] = employee.EducationLevel ?? "...",
            ["NamTotNghiep"] = employee.GraduationYear ?? "...",
            ["SoGPHN"] = employee.PracticingLicenseNumber ?? "...",
            ["PhamViHanhNghe"] = employee.ProfessionalScope ?? "...",
            ["PhongBan"] = employee.Department ?? string.Empty,
            ["ChucDanh"] = employee.ProfessionalTitle ?? employee.EducationLevel ?? "...",
            ["TuNgay"] = employee.StartDate?.ToString("dd/MM/yyyy") ?? "...",
            ["DenNgay"] = employee.ContractEndDate?.ToString("dd/MM/yyyy") ?? "...",
            ["NgayHienTai"] = DateTime.Now.ToString("dd"),
            ["ThangHienTai"] = DateTime.Now.ToString("MM"),
            ["NamHienTai"] = DateTime.Now.ToString("yyyy"),
            ["NgayApDung"] = DateTime.Now.ToString("dd/MM/yyyy")
        };

        var stream = new MemoryStream();
        MiniSoftware.MiniWord.SaveAsByTemplate(stream, templatePath, values);
        stream.Position = 0;

        var fileName = $"GXN-{maChiNhanh}_HanhNghe_{employee.FullName}.docx";
        return File(stream, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
    }

    // =========================================================================
    // 3. XUẤT QUYẾT ĐỊNH PHÂN CÔNG NGƯỜI PHỤ TRÁCH BỘ PHẬN CHUYÊN MÔN
    // =========================================================================
    [HttpGet("{id:int}/export-assignment-decision")]
    public async Task<IActionResult> ExportAssignmentDecision(int id)
    {
        var employee = await db.Employees
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null) return NotFound();

        var templatePath = Path.Combine(env.WebRootPath, "templates", "Template_QuyetDinhPhanCong.docx");
        if (!System.IO.File.Exists(templatePath)) return NotFound("Template file not found.");

        string tenCongTy = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.CompanyName))
                           ? employee.Branch.CompanyName.Replace("\r\n", " ").Replace("\n", " ").Trim()
                           : "Công ty TNHH Y tế Đa khoa";

        string tenCoSo = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.Name))
                         ? employee.Branch.Name.Replace("\r\n", " ").Replace("\n", " ").Trim()
                         : "Phòng khám Đa khoa";

        string maChiNhanh = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.BranchCode))
                            ? employee.Branch.BranchCode.ToUpper() : "PKĐK";
        string diaChiCoSo = employee.Branch != null ? employee.Branch.Address : "Chưa cập nhật";
        string sdtCoSo = employee.Branch != null ? employee.Branch.PhoneNumber : "Chưa cập nhật";

        string danhXung = (employee.Gender?.ToLower() == "nữ") ? "bà" : "ông";
        string danhXungVietHoa = (employee.Gender?.ToLower() == "nữ") ? "Bà" : "Ông";

        var values = new Dictionary<string, object>
        {
            ["TenCongTy"] = tenCongTy,
            ["TenCoSo"] = tenCoSo,
            ["TenCongTyInHoa"] = tenCongTy.ToUpper(),
            ["TenCoSoInHoa"] = tenCoSo.ToUpper(),
            ["MaChiNhanh"] = maChiNhanh,
            ["DiaChiCoSo"] = diaChiCoSo,
            ["SDTCoSo"] = sdtCoSo,
            ["DanhXung"] = danhXung,
            ["DanhXungVietHoa"] = danhXungVietHoa,
            ["TenNhanVien"] = employee.FullName ?? string.Empty,
            ["NgaySinh"] = employee.DateOfBirth?.ToString("dd/MM/yyyy") ?? "...",
            ["SoGPHN"] = employee.PracticingLicenseNumber ?? "...",
            ["NgayCapGPHN"] = employee.LicenseIssueDate?.ToString("dd/MM/yyyy") ?? "...",
            ["NoiCapGPHN"] = employee.LicenseIssuePlace ?? "...",
            ["ChucDanh"] = employee.ProfessionalTitle ?? employee.EducationLevel ?? "...",
            ["PhamViHanhNghe"] = employee.ProfessionalScope ?? "...",
            ["PhongBan"] = employee.Department ?? "...",
            ["NgayHienTai"] = DateTime.Now.ToString("dd"),
            ["ThangHienTai"] = DateTime.Now.ToString("MM"),
            ["NamHienTai"] = DateTime.Now.ToString("yyyy"),
            ["NgayApDung"] = DateTime.Now.ToString("dd/MM/yyyy")
        };

        var stream = new MemoryStream();
        MiniSoftware.MiniWord.SaveAsByTemplate(stream, templatePath, values);
        stream.Position = 0;

        var fileName = $"QD-{maChiNhanh}_PhanCong_{employee.FullName}.docx";
        return File(stream, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
    }

    // =========================================================================
    // 4. XUẤT QUYẾT ĐỊNH PHÂN CÔNG CHỊU TRÁCH NHIỆM CHUYÊN MÔN KỸ THUẬT
    // =========================================================================
    [HttpGet("{id:int}/export-technical-lead-assignment")]
    public async Task<IActionResult> ExportTechnicalLeadAssignment(int id)
    {
        var employee = await db.Employees
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null) return NotFound();

        var templatePath = Path.Combine(env.WebRootPath, "templates", "Template_QuyetDinhPhuTrachChuyenMon.docx");
        if (!System.IO.File.Exists(templatePath)) return NotFound("Template file not found.");

        string tenCongTy = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.CompanyName))
                           ? employee.Branch.CompanyName.Replace("\r\n", " ").Replace("\n", " ").Trim()
                           : "Công ty TNHH Y tế Đa khoa";

        string tenCoSo = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.Name))
                         ? employee.Branch.Name.Replace("\r\n", " ").Replace("\n", " ").Trim()
                         : "Phòng khám Đa khoa";

        string maChiNhanh = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.BranchCode))
                            ? employee.Branch.BranchCode.ToUpper() : "PKĐK";
        string diaChiCoSo = employee.Branch != null ? employee.Branch.Address : "Chưa cập nhật";
        string sdtCoSo = employee.Branch != null ? employee.Branch.PhoneNumber : "Chưa cập nhật";

        string danhXung = (employee.Gender?.ToLower() == "nữ") ? "bà" : "ông";
        string danhXungVietHoa = (employee.Gender?.ToLower() == "nữ") ? "Bà" : "Ông";

        var values = new Dictionary<string, object>
        {
            ["TenCongTy"] = tenCongTy,
            ["TenCoSo"] = tenCoSo,
            ["TenCongTyInHoa"] = tenCongTy.ToUpper(),
            ["TenCoSoInHoa"] = tenCoSo.ToUpper(),
            ["MaChiNhanh"] = maChiNhanh,
            ["DiaChiCoSo"] = diaChiCoSo,
            ["SDTCoSo"] = sdtCoSo,
            ["DanhXung"] = danhXung,
            ["DanhXungVietHoa"] = danhXungVietHoa,
            ["TenNhanVien"] = employee.FullName ?? string.Empty,
            ["NgaySinh"] = employee.DateOfBirth?.ToString("dd/MM/yyyy") ?? "...",
            ["SoCCCD"] = employee.IdentityNumber ?? "...",
            ["NgayCapCCCD"] = employee.IdentityIssueDate?.ToString("dd/MM/yyyy") ?? "...",
            ["NoiCapCCCD"] = employee.IdentityIssuePlace ?? "...",
            ["SoGPHN"] = employee.PracticingLicenseNumber ?? "...",
            ["NgayCapGPHN"] = employee.LicenseIssueDate?.ToString("dd/MM/yyyy") ?? "...",
            ["NoiCapGPHN"] = employee.LicenseIssuePlace ?? "...",
            ["ChucDanh"] = employee.ProfessionalTitle ?? employee.EducationLevel ?? "...",
            ["PhamViHanhNghe"] = employee.ProfessionalScope ?? "...",
            ["NgayHienTai"] = DateTime.Now.ToString("dd"),
            ["ThangHienTai"] = DateTime.Now.ToString("MM"),
            ["NamHienTai"] = DateTime.Now.ToString("yyyy"),
            ["NgayApDung"] = DateTime.Now.ToString("dd/MM/yyyy")
        };

        var stream = new MemoryStream();
        MiniSoftware.MiniWord.SaveAsByTemplate(stream, templatePath, values);
        stream.Position = 0;

        var fileName = $"QD-{maChiNhanh}_PhuTrachChuyenMon_{employee.FullName}.docx";
        return File(stream, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
    }

    // =========================================================================
    // 5. XUẤT QUYẾT ĐỊNH PHÂN CÔNG NHIỆM VỤ CHUYÊN MÔN KỸ THUẬT
    // =========================================================================
    [HttpGet("{id:int}/export-clinical-task-assignment")]
    public async Task<IActionResult> ExportClinicalTaskAssignment(int id)
    {
        var employee = await db.Employees
            .Include(e => e.Branch)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null) return NotFound();

        var templatePath = Path.Combine(env.WebRootPath, "templates", "Template_QuyetDinhPhanCongNhiemVu.docx");
        if (!System.IO.File.Exists(templatePath)) return NotFound("Template file not found.");

        string tenCongTy = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.CompanyName))
                           ? employee.Branch.CompanyName.Replace("\r\n", " ").Replace("\n", " ").Trim()
                           : "Công ty TNHH Y tế Đa khoa";

        string tenCoSo = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.Name))
                         ? employee.Branch.Name.Replace("\r\n", " ").Replace("\n", " ").Trim()
                         : "Phòng khám Đa khoa";

        string maChiNhanh = (employee.Branch != null && !string.IsNullOrEmpty(employee.Branch.BranchCode))
                            ? employee.Branch.BranchCode.ToUpper() : "PKĐK";
        string diaChiCoSo = employee.Branch != null ? employee.Branch.Address : "Chưa cập nhật";
        string sdtCoSo = employee.Branch != null ? employee.Branch.PhoneNumber : "Chưa cập nhật";

        string danhXung = (employee.Gender?.ToLower() == "nữ") ? "bà" : "ông";
        string danhXungVietHoa = (employee.Gender?.ToLower() == "nữ") ? "Bà" : "Ông";

        var values = new Dictionary<string, object>
        {
            ["TenCongTy"] = tenCongTy,
            ["TenCoSo"] = tenCoSo,
            ["TenCongTyInHoa"] = tenCongTy.ToUpper(),
            ["TenCoSoInHoa"] = tenCoSo.ToUpper(),
            ["MaChiNhanh"] = maChiNhanh,
            ["DiaChiCoSo"] = diaChiCoSo,
            ["SDTCoSo"] = sdtCoSo,
            ["DanhXung"] = danhXung,
            ["DanhXungVietHoa"] = danhXungVietHoa,
            ["TenNhanVien"] = employee.FullName ?? string.Empty,
            ["NgaySinh"] = employee.DateOfBirth?.ToString("dd/MM/yyyy") ?? "...",
            ["SoGPHN"] = employee.PracticingLicenseNumber ?? "...",
            ["NgayCapGPHN"] = employee.LicenseIssueDate?.ToString("dd/MM/yyyy") ?? "...",
            ["NoiCapGPHN"] = employee.LicenseIssuePlace ?? "...",
            ["ChucDanh"] = employee.ProfessionalTitle ?? employee.EducationLevel ?? "...",
            ["PhamViHanhNghe"] = employee.ProfessionalScope ?? "...",
            ["PhongBan"] = employee.Department ?? "...",
            ["NgayHienTai"] = DateTime.Now.ToString("dd"),
            ["ThangHienTai"] = DateTime.Now.ToString("MM"),
            ["NamHienTai"] = DateTime.Now.ToString("yyyy")
        };

        var stream = new MemoryStream();
        MiniSoftware.MiniWord.SaveAsByTemplate(stream, templatePath, values);
        stream.Position = 0;

        var fileName = $"QD-{maChiNhanh}_PhanCongNhiemVu_{employee.FullName}.docx";
        return File(stream, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return NotFound();

        db.Employees.Remove(employee);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ── HELPERS ─────────────────────────────────
    private async Task<string> SaveFileAsync(IFormFile file, int employeeId)
    {
        var dir = Path.Combine(env.WebRootPath, UploadFolder, employeeId.ToString());

        if (!Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var fullPath = Path.Combine(dir, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/{UploadFolder}/{employeeId}/{fileName}";
    }

    private void DeletePhysicalFile(string relativePath)
    {
        var fullPath = Path.Combine(env.WebRootPath, relativePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
        }
    }
}