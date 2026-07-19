using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicHR.Api.Models
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }

        // Nhóm 1: Thông tin cá nhân
        [Required(ErrorMessage = "Mã nhân viên là bắt buộc")]
        public string EmployeeCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ và tên là bắt buộc")]
        public string FullName { get; set; } = string.Empty;

        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }

        [Required(ErrorMessage = "Số CCCD là bắt buộc")]
        public string IdentityNumber { get; set; } = string.Empty;
        public DateTime? IdentityIssueDate { get; set; }
        public string? IdentityIssuePlace { get; set; }

        public string? PermanentAddress { get; set; }
        public string? CurrentAddress { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public int? BranchId { get; set; }

        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }

        // Nhóm 2: Bằng cấp & Chứng chỉ hành nghề
        public string? PracticingLicenseNumber { get; set; }
        public DateTime? LicenseIssueDate { get; set; }
        public string? LicenseIssuePlace { get; set; }
        public string? EducationLevel { get; set; }
        public string? GraduationYear { get; set; }
        public string? ProfessionalScope { get; set; }

        // Nhóm 3: Thông tin Công việc
        public string? ProfessionalTitle { get; set; }
        public string? JobPosition { get; set; }
        public string? Department { get; set; }
        public DateTime? StartDate { get; set; }
        public string? SocialInsuranceNumber { get; set; }
        public DateTime? SocialInsuranceStartDate { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankName { get; set; }
        public DateTime? ContractEndDate { get; set; }

        [Column(TypeName = "decimal(18, 2)")] // Cho phép 18 chữ số, trong đó có 2 số thập phân
        public decimal? BasicSalary { get; set; }

        public string Status { get; set; } = "Active";

        // Liên kết 1-Nhiều với bảng đính kèm (Ảnh/PDF)
        public virtual ICollection<EmployeeDocument> Documents { get; set; } = new List<EmployeeDocument>();
    }
}