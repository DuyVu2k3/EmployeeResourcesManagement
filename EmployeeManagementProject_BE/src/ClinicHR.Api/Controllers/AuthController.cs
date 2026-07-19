using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ClinicHR.Api.Data;
using ClinicHR.Api.DTOs;
using ClinicHR.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ClinicHR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    [HttpGet("seed")]
    public async Task<IActionResult> Seed()
    {
        if (await db.Users.AnyAsync()) return Ok("Đã có tài khoản, không cần seed.");

        db.Users.Add(new User
        {
            Username = "boss",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role = "Boss"
        });
        await db.SaveChangesAsync();
        return Ok("Tạo tài khoản Boss thành công");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized("Sai tài khoản hoặc mật khẩu");

        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await db.SaveChangesAsync();

        // ─── BỔ SUNG GÓC PHÂN QUYỀN (RBAC) ───
        var systemRole = await db.SystemRoles
            .Include(r => r.RolePermissions)
            .Include(r => r.FieldPermissions)
            .FirstOrDefaultAsync(r => r.RoleName == user.Role);

        // 2. Trả về cho Frontend React
        return Ok(new
        {
            accessToken,
            refreshToken,
            userId = user.Id,
            username = user.Username,
            role = user.Role,
            // Bỏ ?? đi để C# tự hiểu kiểu dữ liệu (Nếu role null, FE sẽ tự chuyển null thành mảng rỗng [])
            rolePermissions = systemRole?.RolePermissions.Select(p => new {
                moduleName = p.ModuleName,
                canView = p.CanView,
                canCreate = p.CanCreate,
                canEdit = p.CanEdit,
                canDelete = p.CanDelete
            }),
            fieldPermissions = systemRole?.FieldPermissions.Select(f => new {
                tableName = f.TableName,
                fieldName = f.FieldName,
                canView = f.CanView
            })
        });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest req)
    {
        var principal = GetPrincipalFromExpiredToken(req.AccessToken);
        if (principal is null) return BadRequest("Access token không hợp lệ");

        var userId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FindAsync(userId);

        if (user is null || user.RefreshToken != req.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return Unauthorized("Refresh token không hợp lệ hoặc đã hết hạn");

        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await db.SaveChangesAsync();

        return Ok(new { accessToken = newAccessToken, refreshToken = newRefreshToken });
    }

    private string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            ],
            expires: DateTime.UtcNow.AddMinutes(double.Parse(config["Jwt:ExpiresInMinutes"]!)),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = config["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = config["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!)),
            ValidateLifetime = false // Cho phép token đã hết hạn
        };

        try
        {
            return new JwtSecurityTokenHandler()
                .ValidateToken(token, validationParams, out _);
        }
        catch { return null; }
    }
}
