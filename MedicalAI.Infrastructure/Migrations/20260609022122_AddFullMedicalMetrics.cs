using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicalAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFullMedicalMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "A_G_Ratio",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Albumin_Blood",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Alkaline_Phosphotase",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Anemia_ane",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "Appetite_appet",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "tinyint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "Bacteria_ba",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "tinyint",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PackedCellVolume_pcv",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PedalEdema_pe",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Potassium_pot",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "PusCellClumps_pcc",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "tinyint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "PusCells_pc",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "tinyint",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RedBloodCell_rc",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Sodium_sod",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(6,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SpecificGravity_sg",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(10,3)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Total_Protiens",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WhiteBloodCell_wc",
                schema: "Clinic",
                table: "MedicalMetrics",
                type: "decimal(10,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "A_G_Ratio",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "Albumin_Blood",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "Alkaline_Phosphotase",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "Anemia_ane",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "Appetite_appet",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "Bacteria_ba",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "PackedCellVolume_pcv",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "PedalEdema_pe",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "Potassium_pot",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "PusCellClumps_pcc",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "PusCells_pc",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "RedBloodCell_rc",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "Sodium_sod",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "SpecificGravity_sg",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "Total_Protiens",
                schema: "Clinic",
                table: "MedicalMetrics");

            migrationBuilder.DropColumn(
                name: "WhiteBloodCell_wc",
                schema: "Clinic",
                table: "MedicalMetrics");
        }
    }
}
