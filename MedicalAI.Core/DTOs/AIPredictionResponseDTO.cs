namespace MedicalAI.Core.DTOs;

public class AIPredictionResponseDTO
{
    public string DiseaseType { get; set; } = null!;
    public decimal Probability { get; set; }
    public string RiskLevel { get; set; } = null!;
    public decimal ThresholdUsed { get; set; }
    public string ShapValuesJSON { get; set; } = null!;
    public string? AdviceJSON { get; set; }
    public string ModelVersion { get; set; } = null!;
}