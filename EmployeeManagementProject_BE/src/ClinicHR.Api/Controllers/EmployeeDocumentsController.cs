using ClinicHR.Api.Data;
using ClinicHR.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicHR.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeeDocumentsController(AppDbContext db, IWebHostEnvironment env) : ControllerBase
{
    private static readonly string[] AllowedExtensions = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

    [HttpGet("employee/{employeeId:int}")]
    public async Task<IActionResult> GetByEmployee(int employeeId) =>
        Ok(await db.EmployeeDocuments.Where(d => d.EmployeeId == employeeId).ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var doc = await db.EmployeeDocuments.FindAsync(id);
        return doc is null ? NotFound() : Ok(doc);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        [FromForm] int employeeId,
        [FromForm] string documentType,
        [FromForm] string documentName,
        IFormFile file)
    {
        if (!await db.Employees.AnyAsync(e => e.Id == employeeId))
            return NotFound("Employee not found.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest("File type not allowed.");

        var uploadDir = Path.Combine(env.WebRootPath, "uploads", "documents", employeeId.ToString());
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
        }

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadDir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        var doc = new EmployeeDocument
        {
            EmployeeId = employeeId,
            DocumentName = documentName,
            DocumentType = Enum.Parse<DocumentType>(documentType, true),
            FilePath = $"/uploads/documents/{employeeId}/{fileName}",
            UploadedAt = DateTime.UtcNow
        };

        db.EmployeeDocuments.Add(doc);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = doc.Id }, doc);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var doc = await db.EmployeeDocuments.FindAsync(id);
        if (doc is null) return NotFound();

        var fullPath = Path.Combine(env.WebRootPath, doc.FilePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
        }

        db.EmployeeDocuments.Remove(doc);
        await db.SaveChangesAsync();
        return NoContent();
    }
}