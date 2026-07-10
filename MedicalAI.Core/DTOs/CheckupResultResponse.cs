using MedicalAI.Core.Entities;

namespace MedicalAI.Core.DTOs;

/// <summary>
/// Response trả về sau khi submit hồ sơ khám.
/// Chứa đủ dữ liệu để frontend render ResultDashboard ngay,
/// đồng thời có checkupId để fetch lại khi user F5.
/// </summary>
public class CheckupResultResponse
{
    public long CheckupId { get; set; }
    public DateTimeOffset CheckupDate { get; set; }
    public string? Notes { get; set; }
    public string? DoctorId { get; set; }
    public string Status { get; set; } = "Pending";
    public MedicalMetric? Metrics { get; set; }
    public List<PredictionResultDTO> Predictions { get; set; } = new();
}

public class PredictionResultDTO
{
    public long Id { get; set; }
    public string DiseaseType { get; set; } = null!;
    public decimal Probability { get; set; }
    public string RiskLevel { get; set; } = null!;
    public decimal ThresholdUsed { get; set; }
    public string ShapValuesJSON { get; set; } = null!;
    public string? AdviceJSON { get; set; }
    public string ModelVersion { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
}