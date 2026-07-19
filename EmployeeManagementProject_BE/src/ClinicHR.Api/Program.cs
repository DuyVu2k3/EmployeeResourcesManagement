using ClinicHR.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- KHÓA CỨNG THƯ MỤC WWWROOT ---
var absoluteWwwroot = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(absoluteWwwroot))
{
    Directory.CreateDirectory(absoluteWwwroot);
}
builder.Environment.WebRootPath = absoluteWwwroot;

// --- CẤU HÌNH DỊCH VỤ ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// SỬA CHỖ 1: Đặt tên cho Policy CORS rõ ràng
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://clinichr-web.runasp.net",
                "https://clinichr-web.runasp.net"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials())); // Thêm cái này để hỗ trợ gửi cookie/auth header mượt hơn

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token JWT của bạn vào ô bên dưới.\n\nVí dụ: 'eyJhbGciOiJIUzI1NiIs...'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.WebHost.ConfigureKestrel(options =>
    options.Limits.MaxRequestBodySize = 52_428_800);

var app = builder.Build();

// ================= PIPELINE =================
app.UseSwagger();
app.UseSwaggerUI();

// SỬA CHỖ 2: Tạm thời vô hiệu hóa HttpsRedirection trên hosting free để không bị lỗi kết nối
// app.UseHttpsRedirection(); 

// SỬA CHỖ 3: Gọi đúng tên Policy CORS đã khai báo (Bắt buộc phải nằm trên UseAuthentication)
app.UseCors("AllowFrontend");

// --- CẤU HÌNH ĐỌC FILE TĨNH (ĐÃ THÊM QUYỀN CORS ĐỂ TẢI FILE BLOB) ---
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(builder.Environment.WebRootPath),
    RequestPath = "",
    OnPrepareResponse = ctx =>
    {
        // QUAN TRỌNG: Mở cửa cho phép Frontend dùng fetch() để tải file về máy
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET");
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();