using System.ComponentModel.DataAnnotations;

namespace ClinicHR.Api.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";

        // THÊM TRƯỜNG NÀY: Để biết tài khoản này là của nhân viên nào (có thể để trống đối với Admin)
        public string? EmployeeCode { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }
}