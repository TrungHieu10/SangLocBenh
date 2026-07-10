using MedicalAI.Core.Entities;
using MedicalAI.Core.DTOs;
namespace MedicalAI.Core.Interfaces;

public interface IAIPredictionClient
{
    // Thay vì nhận MedicalMetric, giờ nó nhận DTO trung gian
    Task<List<PredictionResult>> GetPredictionsAsync(AIPredictionRequestDTO request);
    Task<object> GetFeatureImportanceAsync(string disease);
}