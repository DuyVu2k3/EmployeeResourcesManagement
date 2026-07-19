using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicHR.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEmployeeDocumentArchitecture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalCertificates",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "NonMedicalDegrees",
                table: "Employees");

            migrationBuilder.AlterColumn<int>(
                name: "DocumentType",
                table: "EmployeeDocuments",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AlterColumn<string>(
                name: "DocumentType",
                table: "EmployeeDocuments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
