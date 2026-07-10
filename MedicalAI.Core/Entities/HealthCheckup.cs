using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalAI.Core.Entities;

[Table("HealthCheckups", Schema = "Clinic")]
public class HealthCheckup
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(450)]
    public string UserId { get; set; } = null!;

    public DateTimeOffset CheckupDate { get; set; } = DateTimeOffset.UtcNow;

    [MaxLength(250)]
    public string? Location { get; set; }

    [MaxLength(450)]
    public string? DoctorId { get; set; }

    public string? Notes { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Reviewed

    public bool IsDeleted { get; set; } = false;

    // Navigation properties (Mối quan hệ)
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    public virtual MedicalMetric? MedicalMetric { get; set; }
    public virtual ICollection<PredictionResult> PredictionResults { get; set; } = new List<PredictionResult>();
}