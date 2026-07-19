using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicHR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGraduationYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GraduationYear",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GraduationYear",
                table: "Employees");
        }
    }
}
