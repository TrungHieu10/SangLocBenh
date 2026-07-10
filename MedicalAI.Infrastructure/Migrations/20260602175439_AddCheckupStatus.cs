using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicalAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckupStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "Clinic",
                table: "HealthCheckups",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                schema: "Clinic",
                table: "HealthCheckups");
        }
    }
}
