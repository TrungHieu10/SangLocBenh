using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalAI.Core.Entities;

[Table("PredictionResults", Schema = "Analysis")]
public class PredictionResult
{
    [Key]
    public long Id { get; set; }

    public long CheckupId { get; set; }

    [Required, MaxLength(50)]
    public string DiseaseType { get; set; } = null!; // Tim, TieuDuong, DotQuy, Than, Gan

    [Column(TypeName = "decimal(5,4)")]
    public decimal Probability { get; set; }

    [Required, MaxLength(20)]
    public string RiskLevel { get; set; } = null!; // Low, Medium, High

    [Column(TypeName = "decimal(5,4)")]
    public decimal ThresholdUsed { get; set; }

    [Required]
    public string ShapValuesJSON { get; set; } = null!; // Trọng số giải thích từ AI

    public string? AdviceJSON { get; set; }

    [Required, MaxLength(20)]
    public string ModelVersion { get; set; } = null!;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey("CheckupId")]
    public virtual HealthCheckup HealthCheckup { get; set; } = null!;
}