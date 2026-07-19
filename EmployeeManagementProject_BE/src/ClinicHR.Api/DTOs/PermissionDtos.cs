namespace ClinicHR.Api.DTOs;

// DTO hứng dữ liệu 1 dòng trong bảng phân quyền chức năng (Module)
public class RolePermissionDto
{
    public string ModuleName { get; set; } = null!; // VD: "Employees", "Decisions"
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
}

// DTO hứng dữ liệu 1 dòng phân quyền bảo mật trường dữ liệu (Field)
public class FieldPermissionDto
{
    public string TableName { get; set; } = null!; // VD: "Employee"
    public string FieldName { get; set; } = null!; // VD: "BasicSalary", "BankAccountNumber"
    public bool CanView { get; set; }
}

// DTO tổng hứng toàn bộ payload khi Admin bấm nút "Lưu phân quyền" trên FE
public class UpdateRolePermissionsRequest
{
    public List<RolePermissionDto> RolePermissions { get; set; } = new();
    public List<FieldPermissionDto> FieldPermissions { get; set; } = new();
}