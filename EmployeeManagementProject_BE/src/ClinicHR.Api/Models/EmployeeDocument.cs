using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicHR.Api.Models
{
    public enum DocumentType
    {
        License = 0,            // Chứng chỉ hành nghề (CCHN)
        Degree = 1,             // Bằng cấp (Đại học, Thạc sĩ, Tiến sĩ...)
        Certificate = 2,        // Chứng chỉ bổ sung khác
        NonMedicalDegree = 3    // Bằng cấp không liên quan đến y tế
    }

    public class EmployeeDocument
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeId { get; set; }

        [Required]
        public string DocumentName { get; set; } = string.Empty;

        [Required]
        public DocumentType DocumentType { get; set; }

        [Required]
        public string FilePath { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.Now;

        [ForeignKey("EmployeeId")]
        public virtual Employee? Employee { get; set; }
    }
}