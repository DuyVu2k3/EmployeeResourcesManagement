using ClinicHR.Api.Data;
using ClinicHR.Api.DTOs;
using ClinicHR.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicHR.Api.Controllers;

[Authorize] // Bật bảo mật Token
[ApiController]
[Route("api/[controller]")]
public class PermissionsController(AppDbContext db) : ControllerBase
{
    // 1. GET: api/permissions
    // Lấy toàn bộ danh sách Role kèm theo Quyền hạn hiện tại (Để FE vẽ bảng Checkbox)
    [HttpGet]
    public async Task<IActionResult> GetAllRolesWithPermissions()
    {
        var roles = await db.SystemRoles
            .Include(r => r.RolePermissions)
            .Include(r => r.FieldPermissions)
            .Select(r => new
            {
                r.Id,
                r.RoleName,
                r.Description,
                RolePermissions = r.RolePermissions.Select(p => new
                {
                    p.ModuleName,
                    p.CanView,
                    p.CanCreate,
                    p.CanEdit,
                    p.CanDelete
                }),
                FieldPermissions = r.FieldPermissions.Select(f => new
                {
                    f.TableName,
                    f.FieldName,
                    f.CanView
                })
            })
            .ToListAsync();

        return Ok(roles);
    }

    // 2. PUT: api/permissions/{roleId}
    // Khi Admin tick chọn trên FE rồi bấm LƯU -> Gọi API này để cập nhật DB
    [HttpPut("{roleId:int}")]
    public async Task<IActionResult> UpdatePermissions(int roleId, [FromBody] UpdateRolePermissionsRequest request)
    {
        // Kiểm tra Role có tồn tại trong DB không
        var role = await db.SystemRoles.FindAsync(roleId);
        if (role == null) return NotFound(new { message = "Không tìm thấy vai trò (Role) này!" });

        // --- CHIẾN THUẬT: XÓA SẠCH QUYỀN CŨ - THÊM LẠI QUYỀN MỚI ---

        // 1. Xóa quyền chức năng cũ
        var oldRolePerms = db.RolePermissions.Where(p => p.SystemRoleId == roleId);
        db.RolePermissions.RemoveRange(oldRolePerms);

        // Thêm danh sách quyền chức năng mới từ FE gửi lên
        foreach (var mod in request.RolePermissions)
        {
            db.RolePermissions.Add(new RolePermission
            {
                SystemRoleId = roleId,
                ModuleName = mod.ModuleName,
                CanView = mod.CanView,
                CanCreate = mod.CanCreate,
                CanEdit = mod.CanEdit,
                CanDelete = mod.CanDelete
            });
        }

        // 2. Xóa quyền xem dữ liệu (Field) cũ
        var oldFieldPerms = db.FieldPermissions.Where(p => p.SystemRoleId == roleId);
        db.FieldPermissions.RemoveRange(oldFieldPerms);

        // Thêm danh sách quyền xem dữ liệu mới
        foreach (var field in request.FieldPermissions)
        {
            db.FieldPermissions.Add(new FieldPermission
            {
                SystemRoleId = roleId,
                TableName = field.TableName,
                FieldName = field.FieldName,
                CanView = field.CanView
            });
        }

        // 3. Lưu xuống SQL Server
        await db.SaveChangesAsync();

        return Ok(new { message = $"✅ Đã cập nhật phân quyền cho vai trò [{role.RoleName}] thành công!" });
    }
}