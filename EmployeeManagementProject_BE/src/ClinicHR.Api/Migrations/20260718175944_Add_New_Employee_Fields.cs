using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicHR.Api.Migrations
{
    /// <inheritdoc />
    public partial class Add_New_Employee_Fields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdditionalCertificates",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NonMedicalDegrees",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalCertificates",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "NonMedicalDegrees",
                table: "Employees");
        }
    }
}
