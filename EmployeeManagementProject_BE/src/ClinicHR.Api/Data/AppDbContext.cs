using ClinicHR.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicHR.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<EmployeeDocument> EmployeeDocuments => Set<EmployeeDocument>();
    public DbSet<DecisionTemplate> DecisionTemplates => Set<DecisionTemplate>();
    public DbSet<SystemRole> SystemRoles { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<FieldPermission> FieldPermissions { get; set; }
    public DbSet<Branch> Branches { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EmployeeDocument>()
            .HasOne(d => d.Employee)
            .WithMany(e => e.Documents)
            .HasForeignKey(d => d.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
