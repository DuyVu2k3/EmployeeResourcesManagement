using ClinicHR.Api.Data;
using ClinicHR.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicHR.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BranchesController(AppDbContext context) : ControllerBase
{
    // GET: api/branches
    [HttpGet]
    public async Task<IActionResult> GetBranches()
    {
        var branches = await context.Branches
            .Where(b => b.IsActive)
            .Select(b => new
            {
                b.Id,
                b.Name,
                b.CompanyName,
                b.BranchCode,
                b.Address,
                b.PhoneNumber
            })
            .ToListAsync();

        return Ok(branches);
    }

    // POST: api/branches
    [HttpPost]
    public async Task<IActionResult> CreateBranch([FromBody] Branch branch)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        context.Branches.Add(branch);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBranches), new { id = branch.Id }, new
        {
            branch.Id,
            branch.Name,
            branch.Address,
            branch.PhoneNumber
        });
    }
}
