using System.Net.Http.Json;
using MedicalAI.Core.DTOs;
using MedicalAI.Core.Entities;
using MedicalAI.Core.Interfaces;
using System.Text.Json;

namespace MedicalAI.Infrastructure.Services;

public class AIPredictionClient : IAIPredictionClient
{
    private readonly HttpClient _httpClient;

    // Inject HttpClient do ASP.NET tự động quản lý
    public AIPredictionClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    // SỬA LỖI TẠI ĐÂY: Tham số đầu vào phải khớp với Interface (AIPredictionRequestDTO) và đặt tên biến là aiRequest
    public async Task<List<PredictionResult>> GetPredictionsAsync(AIPredictionRequestDTO aiRequest)
    {
        try
        {
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = null 
            };
            // Bắn POST request chứa dữ liệu bệnh nhân sang FastAPI (Python)
            var response = await _httpClient.PostAsJsonAsync("/api/predict/all", aiRequest,jsonOptions);
        

            if (!response.IsSuccessStatusCode)
            {
                // Nếu Python sập hoặc lỗi, quăng exception
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"AI Server Error: {response.StatusCode} - {error}");
            }

            // Đọc cục JSON Python trả về, map vào DTO
            var aiResults = await response.Content.ReadFromJsonAsync<List<AIPredictionResponseDTO>>();
            var finalResults = new List<PredictionResult>();

            if (aiResults != null)
            {
                // Convert từ DTO sang Entity chuẩn bị lưu DB
                foreach (var res in aiResults)
                {
                    finalResults.Add(new PredictionResult
                    {
                        DiseaseType = res.DiseaseType,
                        Probability = res.Probability,
                        RiskLevel = res.RiskLevel,
                        ThresholdUsed = res.ThresholdUsed,
                        ShapValuesJSON = res.ShapValuesJSON,
                        AdviceJSON = res.AdviceJSON,
                        ModelVersion = res.ModelVersion
                    });
                }
            }
            return finalResults;
        }
        catch (HttpRequestException ex)
        {
            throw new Exception("Không thể kết nối tới AI Server. Hãy đảm bảo file Python đang chạy!", ex);
        }
    }

    public async Task<object> GetFeatureImportanceAsync(string disease)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/api/feature-importance/{disease}");
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"AI Server Error: {response.StatusCode} - {error}");
            }

            // Return the raw JSON object from Python
            var result = await response.Content.ReadFromJsonAsync<object>();
            return result;
        }
        catch (Exception ex)
        {
            // Fallback to mock data if AI server fails or endpoint is missing
            return new
            {
                features = new[] { "Đường huyết", "Huyết áp tâm thu", "Tuổi", "Cholesterol", "BMI" },
                importance = new[] { 0.35, 0.25, 0.20, 0.15, 0.05 },
                error = ex.Message
            };
        }
    }
}