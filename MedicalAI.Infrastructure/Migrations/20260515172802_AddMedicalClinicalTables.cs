using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicalAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicalClinicalTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "Clinic");

            migrationBuilder.EnsureSchema(
                name: "Analysis");

            migrationBuilder.CreateTable(
                name: "HealthCheckups",
                schema: "Clinic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CheckupDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    DoctorId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthCheckups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthCheckups_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalMetrics",
                schema: "Clinic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CheckupId = table.Column<long>(type: "bigint", nullable: false),
                    Height_cm = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Weight_kg = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    SystolicBP = table.Column<short>(type: "smallint", nullable: true),
                    DiastolicBP = table.Column<short>(type: "smallint", nullable: true),
                    BloodGlucose = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    HbA1c = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    Cholesterol_Total = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    SerumCreatinine = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    BloodUrea = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Albumin_Urine = table.Column<byte>(type: "tinyint", nullable: true),
                    Sugar_Urine = table.Column<byte>(type: "tinyint", nullable: true),
                    ALT_SGPT = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    AST_SGOT = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    TotalBilirubin = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    DirectBilirubin = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Hemoglobin = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    SmokingStatus = table.Column<byte>(type: "tinyint", nullable: true),
                    AlcoholConsumption = table.Column<bool>(type: "bit", nullable: true),
                    PhysicalActivity = table.Column<bool>(type: "bit", nullable: true),
                    Hypertension_History = table.Column<bool>(type: "bit", nullable: true),
                    HeartDisease_History = table.Column<bool>(type: "bit", nullable: true),
                    EverMarried = table.Column<bool>(type: "bit", nullable: true),
                    WorkType = table.Column<byte>(type: "tinyint", nullable: true),
                    ResidenceType = table.Column<byte>(type: "tinyint", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicalMetrics_HealthCheckups_CheckupId",
                        column: x => x.CheckupId,
                        principalSchema: "Clinic",
                        principalTable: "HealthCheckups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PredictionResults",
                schema: "Analysis",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CheckupId = table.Column<long>(type: "bigint", nullable: false),
                    DiseaseType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Probability = table.Column<decimal>(type: "decimal(5,4)", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ThresholdUsed = table.Column<decimal>(type: "decimal(5,4)", nullable: false),
                    ShapValuesJSON = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdviceJSON = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModelVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PredictionResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PredictionResults_HealthCheckups_CheckupId",
                        column: x => x.CheckupId,
                        principalSchema: "Clinic",
                        principalTable: "HealthCheckups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckups_UserId",
                schema: "Clinic",
                table: "HealthCheckups",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalMetrics_CheckupId",
                schema: "Clinic",
                table: "MedicalMetrics",
                column: "CheckupId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PredictionResults_CheckupId",
                schema: "Analysis",
                table: "PredictionResults",
                column: "CheckupId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicalMetrics",
                schema: "Clinic");

            migrationBuilder.DropTable(
                name: "PredictionResults",
                schema: "Analysis");

            migrationBuilder.DropTable(
                name: "HealthCheckups",
                schema: "Clinic");
        }
    }
}
