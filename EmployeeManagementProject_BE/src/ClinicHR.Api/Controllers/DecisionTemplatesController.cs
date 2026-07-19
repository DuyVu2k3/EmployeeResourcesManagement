using ClinicHR.Api.Data;
using ClinicHR.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicHR.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DecisionTemplatesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.DecisionTemplates.ToListAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var template = await db.DecisionTemplates.FindAsync(id);
        return template is null ? NotFound() : Ok(template);
    }

    [HttpPost]
    public async Task<IActionResult> Create(DecisionTemplate template)
    {
        template.Id = Guid.NewGuid();
        template.CreatedAt = DateTime.UtcNow;
        db.DecisionTemplates.Add(template);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = template.Id }, template);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, DecisionTemplate updated)
    {
        var template = await db.DecisionTemplates.FindAsync(id);
        if (template is null) return NotFound();

        template.Title = updated.Title;
        template.ContentTemplate = updated.ContentTemplate;

        await db.SaveChangesAsync();
        return Ok(template);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var template = await db.DecisionTemplates.FindAsync(id);
        if (template is null) return NotFound();

        db.DecisionTemplates.Remove(template);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
