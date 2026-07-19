using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClinicHR.Api.Models
{
    public class Branch
    {
        [Key]
        [JsonIgnore]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên chi nhánh không được để trống")]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mã viết tắt không được để trống")]
        [StringLength(20)]
        public string BranchCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên công ty không được để trống")]
        [StringLength(150)]
        public string CompanyName { get; set; } = string.Empty;

        [StringLength(250)]
        public string Address { get; set; } = string.Empty;

        [StringLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true; // Chi nhánh còn hoạt động hay không

        // Điều hướng EF Core (1 Chi nhánh có nhiều Nhân viên)
        [JsonIgnore]
        public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}