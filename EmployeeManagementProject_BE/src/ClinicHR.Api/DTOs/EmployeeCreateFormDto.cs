using ClinicHR.Api.Models;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ClinicHR.Api.DTOs;

public class EmployeeCreateFormDto
{
    public string? EmployeeCode { get; set; }
    public string? FullName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? IdentityNumber { get; set; }
    public DateTime? IdentityIssueDate { get; set; }
    public string? IdentityIssuePlace { get; set; }
    public string? PermanentAddress { get; set; }
    public string? CurrentAddress { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public int? BranchId { get; set; }
    public string? PracticingLicenseNumber { get; set; }
    public DateTime? LicenseIssueDate { get; set; }
    public string? LicenseIssuePlace { get; set; }
    public string? EducationLevel { get; set; }
    public string? ProfessionalScope { get; set; }
    public string? ProfessionalTitle { get; set; }
    public string? JobPosition { get; set; }
    public string? Department { get; set; }
    public DateTime? StartDate { get; set; }
    public string? SocialInsuranceNumber { get; set; }
    public DateTime? SocialInsuranceStartDate { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public decimal? BasicSalary { get; set; }
    public string? Status { get; set; }
    public string? GraduationYear { get; set; }

    // --- CÁC FILE UPLOAD ---
    public IFormFile? PracticingLicenseFile { get; set; }

    public List<IFormFile>? DocumentFiles { get; set; }
    public List<string>? DocumentNames { get; set; }
    public List<DocumentType>? DocumentTypes { get; set; }

    public List<IFormFile>? DegreeFiles { get; set; }
    public List<string>? DegreeNames { get; set; }

    public List<IFormFile>? CertificateFiles { get; set; }
    public List<string>? CertificateNames { get; set; }
    public List<IFormFile>? NonMedicalDegreeFiles { get; set; }
    public List<string>? NonMedicalDegreeNames { get; set; }
}