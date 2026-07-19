namespace ClinicHR.Api.Models;

public class SystemRole
{
    public int Id { get; set; }
    public string RoleName { get; set; } = null!; // VD: "Admin", "HR Manager", "Nhân viên"
    public string? Description { get; set; }

    // Quan hệ 1-Nhiều
    public List<RolePermission> RolePermissions { get; set; } = new();
    public List<FieldPermission> FieldPermissions { get; set; } = new();
}

public class RolePermission
{
    public int Id { get; set; }
    public int SystemRoleId { get; set; }
    public string ModuleName { get; set; } = null!; // VD: "Employees", "Decisions", "Dashboard"

    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }

    public SystemRole? SystemRole { get; set; }
}

public class FieldPermission
{
    public int Id { get; set; }
    public int SystemRoleId { get; set; }
    public string TableName { get; set; } = null!; // VD: "Employee"
    public string FieldName { get; set; } = null!; // VD: "BasicSalary", "BankAccountNumber"

    public bool CanView { get; set; }

    public SystemRole? SystemRole { get; set; }
}