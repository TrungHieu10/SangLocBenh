using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicalAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PatientCode",
                schema: "Identity",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PatientCode",
                schema: "Identity",
                table: "Users");
        }
    }
}
