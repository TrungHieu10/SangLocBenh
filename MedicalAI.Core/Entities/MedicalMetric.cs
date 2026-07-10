using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalAI.Core.Entities;

[Table("MedicalMetrics", Schema = "Clinic")]
public class MedicalMetric
{
    [Key]
    public long Id { get; set; }

    public long CheckupId { get; set; }

    // Nhóm Sinh hiệu
    [Column(TypeName = "decimal(10,2)")] public decimal? Height_cm { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? Weight_kg { get; set; }
    public short? SystolicBP { get; set; }
    public short? DiastolicBP { get; set; }

    // Nhóm Xét nghiệm (Đủ cho 5 mô hình AI)
    [Column(TypeName = "decimal(10,2)")] public decimal? BloodGlucose { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? HbA1c { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? Cholesterol_Total { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? SerumCreatinine { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? BloodUrea { get; set; }
    public byte? Albumin_Urine { get; set; }
    public byte? Sugar_Urine { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? ALT_SGPT { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? AST_SGOT { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? TotalBilirubin { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? DirectBilirubin { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? Hemoglobin { get; set; }

    // Nhóm Xét nghiệm Gan bổ sung
    [Column(TypeName = "decimal(10,2)")] public decimal? Alkaline_Phosphotase { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? Total_Protiens { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? Albumin_Blood { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? A_G_Ratio { get; set; }

    // Nhóm Xét nghiệm Máu / Thận bổ sung
    [Column(TypeName = "decimal(10,3)")] public decimal? SpecificGravity_sg { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? PackedCellVolume_pcv { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? WhiteBloodCell_wc { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? RedBloodCell_rc { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? Sodium_sod { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal? Potassium_pot { get; set; }

    // Nhóm Xét nghiệm Nước tiểu (Danh mục)
    public byte? PusCells_pc { get; set; }
    public byte? PusCellClumps_pcc { get; set; }
    public byte? Bacteria_ba { get; set; }

    // Triệu chứng lâm sàng
    public byte? Appetite_appet { get; set; }
    public bool? PedalEdema_pe { get; set; }
    public bool? Anemia_ane { get; set; }

    // Nhóm Lối sống / Nhân khẩu
    public byte? SmokingStatus { get; set; }
    public bool? AlcoholConsumption { get; set; }
    public bool? PhysicalActivity { get; set; }
    public bool? Hypertension_History { get; set; }
    public bool? HeartDisease_History { get; set; }
    public bool? EverMarried { get; set; }
    public byte? WorkType { get; set; }
    public byte? ResidenceType { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey("CheckupId")]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual HealthCheckup HealthCheckup { get; set; } = null!;
}