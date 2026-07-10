using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicalAI.Core.DTOs;
using MedicalAI.Core.Entities;
using MedicalAI.Core.Interfaces;
using MedicalAI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MedicalAI.Infrastructure.Services
{
    public interface IClinicalServiceWithRAG
    {
        Task<AIPredictionDetailDTO> GetPredictionWithAdviceAsync(long checkupId, string userId, string userRole);
        Task<AIPredictionDetailDTO> SubmitCheckupWithAdviceAsync(AIPredictionRequestDTO request, string userId, string userRole);
    }

    public class ClinicalServiceWithRAG : IClinicalServiceWithRAG
    {
        private readonly IAIPredictionClient _aiClient;
        private readonly IRAGEngine _ragEngine;
        private readonly ApplicationDbContext _dbContext;
        private readonly INotificationService _notificationService;

        public ClinicalServiceWithRAG(
            IAIPredictionClient aiClient,
            IRAGEngine ragEngine,
            ApplicationDbContext dbContext,
            INotificationService notificationService)
        {
            _aiClient = aiClient;
            _ragEngine = ragEngine;
            _dbContext = dbContext;
            _notificationService = notificationService;
        }

        public async Task<AIPredictionDetailDTO> GetPredictionWithAdviceAsync(long checkupId, string userId, string userRole)
        {
            try
            {
                bool canViewAll = userRole == "Doctor" || userRole == "Admin" || userRole == "Nurse";
                bool isDoctorOrAdmin = userRole == "Doctor" || userRole == "Admin";

                var checkup = await _dbContext.HealthCheckups
                    .Include(c => c.MedicalMetric)
                    .Include(c => c.User)
                    .FirstOrDefaultAsync(c => c.Id == checkupId && (c.UserId == userId || canViewAll) && !c.IsDeleted);
                if (checkup == null) throw new Exception("Không tìm thấy lượt khám hoặc bạn không có quyền truy cập.");

                var predictions = await _dbContext.PredictionResults
                    .Where(p => p.CheckupId == checkupId)
                    .ToListAsync();

                if (!predictions.Any()) throw new Exception("Không tìm thấy kết quả phân tích.");

                var dto = MapToDetailDTO(checkup, predictions);
                
                // Nếu là Patient hoặc Nurse và Status = Pending thì ẩn dự đoán, lời khuyên RAG và lối sống
                if (!isDoctorOrAdmin && checkup.Status == "Pending")
                {
                    dto.Predictions = new List<DiseaseRiskDTO>();
                    dto.Advice = new List<string> { "Hồ sơ của bạn đang chờ Bác sĩ duyệt kết quả. Lời khuyên chính thức sẽ hiển thị sau khi Bác sĩ kết luận." };
                    dto.PreventionTips = new List<string>();
                    dto.LifestyleRecommendations = new List<string>();
                    dto.RiskLevel = "Pending";
                    dto.RiskScore = 0;
                }
                else
                {
                    var topDisease = predictions.OrderByDescending(p => p.Probability).FirstOrDefault();
                    if (topDisease != null)
                    {
                        dto.Advice = await _ragEngine.GenerateAdviceAsync(topDisease.DiseaseType, (double)topDisease.Probability);
                        dto.PreventionTips = await _ragEngine.GeneratePreventionAsync(topDisease.DiseaseType);

                        var riskFactors = ExtractRiskFactors(checkup);
                        dto.LifestyleRecommendations = await _ragEngine.GenerateLifestyleRecommendationsAsync(riskFactors);

                        dto.RiskLevel = GetRiskLevel((double)topDisease.Probability);
                        dto.RiskScore = (double)topDisease.Probability;
                    }
                }
                return dto;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching prediction with advice: {ex.Message}");
            }
        }

        public async Task<AIPredictionDetailDTO> SubmitCheckupWithAdviceAsync(AIPredictionRequestDTO request, string userId, string userRole)
        {
            try
            {
                var aiPredictions = await _aiClient.GetPredictionsAsync(request);

                var checkup = new HealthCheckup
                {
                    UserId = userId,
                    CheckupDate = DateTimeOffset.UtcNow,
                    Status = "Pending"
                };

                var metric = new MedicalMetric
                {
                    HealthCheckup       = checkup,
                    Height_cm           = request.Height_cm,
                    Weight_kg           = request.Weight_kg,
                    SystolicBP          = request.SystolicBP,
                    DiastolicBP         = request.DiastolicBP,
                    BloodGlucose        = request.BloodGlucose,
                    HbA1c               = request.HbA1c,
                    Cholesterol_Total   = request.Cholesterol_Total,
                    SerumCreatinine     = request.SerumCreatinine,
                    BloodUrea           = request.BloodUrea,
                    Albumin_Urine       = request.Albumin_Urine,
                    Sugar_Urine         = request.Sugar_Urine,
                    ALT_SGPT            = request.ALT_SGPT,
                    AST_SGOT            = request.AST_SGOT,
                    TotalBilirubin      = request.TotalBilirubin,
                    DirectBilirubin     = request.DirectBilirubin,
                    Hemoglobin          = request.Hemoglobin,
                    SmokingStatus       = request.SmokingStatus,
                    AlcoholConsumption  = request.AlcoholConsumption,
                    PhysicalActivity    = request.PhysicalActivity,
                    Hypertension_History  = request.Hypertension_History,
                    HeartDisease_History  = request.HeartDisease_History,
                    EverMarried         = request.EverMarried,
                    WorkType            = request.WorkType,
                    ResidenceType       = request.ResidenceType
                };

                _dbContext.HealthCheckups.Add(checkup);
                _dbContext.MedicalMetrics.Add(metric);
                await _dbContext.SaveChangesAsync();

                foreach (var pred in aiPredictions)
                {
                    _dbContext.PredictionResults.Add(new PredictionResult
                    {
                        CheckupId = checkup.Id,
                        DiseaseType = pred.DiseaseType,
                        Probability = pred.Probability,
                        RiskLevel = pred.RiskLevel ?? "Unknown", 
                        ThresholdUsed = pred.ThresholdUsed,
                        ShapValuesJSON = pred.ShapValuesJSON ?? "[]",
                        ModelVersion = pred.ModelVersion ?? "RAG-Integration-V1",
                        CreatedAt = DateTimeOffset.UtcNow
                    });
                }
                await _dbContext.SaveChangesAsync();

                bool isMedicalStaff = userRole == "Doctor" || userRole == "Admin";

                var topDisease = aiPredictions.OrderByDescending(p => p.Probability).FirstOrDefault();
                var advice = new List<string>();
                var prevention = new List<string>();
                var lifestyle = new List<string>();

                if (topDisease != null)
                {
                    try {
                        var parsedDict = System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.Dictionary<string, string>>(topDisease.AdviceJSON ?? "{}");
                        if (parsedDict != null && parsedDict.ContainsKey("vi")) {
                            advice = new List<string> { parsedDict["vi"] };
                        } else {
                            advice = await _ragEngine.GenerateAdviceAsync(topDisease.DiseaseType, (double)topDisease.Probability);
                        }
                    } catch {
                        advice = await _ragEngine.GenerateAdviceAsync(topDisease.DiseaseType, (double)topDisease.Probability);
                    }

                    prevention = await _ragEngine.GeneratePreventionAsync(topDisease.DiseaseType);

                    var riskFactors = ExtractRiskFactors(request);
                    lifestyle = await _ragEngine.GenerateLifestyleRecommendationsAsync(riskFactors);
                }

                // Gửi thông báo cho Bác sĩ có ca khám mới
                var userObj = await _dbContext.Users.FindAsync(userId);
                string patientName = userObj?.FullName ?? "bệnh nhân";
                await _notificationService.CreateNotificationForRoleAsync(
                    "Doctor", 
                    "Ca khám mới cần đánh giá", 
                    $"Bệnh nhân {patientName} vừa nộp một hồ sơ khám mới qua hệ thống AI.", 
                    checkup.Id);

                var dto = new AIPredictionDetailDTO
                {
                    CheckupId = checkup.Id.ToString(),
                    CreatedAt = checkup.CheckupDate.DateTime, 
                    Notes = checkup.Notes,
                    DoctorId = checkup.DoctorId,
                    Metrics = MapMetrics(request)
                };

                if (!isMedicalStaff)
                {
                    dto.Predictions = new List<DiseaseRiskDTO>();
                    dto.Advice = new List<string> { "Hồ sơ của bạn đang chờ Bác sĩ duyệt kết quả. Lời khuyên chính thức sẽ hiển thị sau khi Bác sĩ kết luận." };
                    dto.PreventionTips = new List<string>();
                    dto.LifestyleRecommendations = new List<string>();
                    dto.RiskLevel = "Pending";
                    dto.RiskScore = 0;
                }
                else
                {
                    dto.Predictions = aiPredictions
                        .Select(p => new DiseaseRiskDTO { 
                            Disease = p.DiseaseType, 
                            Probability = (double)p.Probability,
                            ShapValuesJSON = p.ShapValuesJSON ?? "[]"
                        }) 
                        .ToList();
                    dto.RiskLevel = topDisease != null ? GetRiskLevel((double)topDisease.Probability) : "Unknown";
                    dto.RiskScore = topDisease != null ? (double)topDisease.Probability : 0;
                    dto.Advice = advice;
                    dto.PreventionTips = prevention;
                    dto.LifestyleRecommendations = lifestyle;
                }
                // Gửi thông báo cho bác sĩ
                await _notificationService.CreateNotificationForRoleAsync(
                    "Doctor",
                    "Có ca khám mới",
                    $"Bệnh nhân {checkup.User?.FullName ?? "vô danh"} vừa nộp hồ sơ khám. Vui lòng phân tích và trả kết quả.",
                    checkup.Id);

                return dto;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error submitting checkup: {ex.Message}");
            }
        }

        private AIPredictionDetailDTO MapToDetailDTO(HealthCheckup checkup, List<PredictionResult> predictions)
        {
            var dto = new AIPredictionDetailDTO
            {
                CheckupId = checkup.Id.ToString(),
                CreatedAt = checkup.CheckupDate.DateTime,
                Notes = checkup.Notes,
                DoctorId = checkup.DoctorId,
                Predictions = predictions
                    .Select(p => new DiseaseRiskDTO { 
                        Disease = p.DiseaseType, 
                        Probability = (double)p.Probability,
                        ShapValuesJSON = p.ShapValuesJSON ?? "[]"
                    })
                    .ToList(),
                Advice = new List<string>(),
                PreventionTips = new List<string>(),
                LifestyleRecommendations = new List<string>()
            };

            if (checkup.MedicalMetric != null)
            {
                int age = 0;
                if (checkup.User != null)
                {
                    age = DateTime.Today.Year - checkup.User.DateOfBirth.Year;
                    if (checkup.User.DateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;
                }

                dto.Metrics = new HealthMetricsDTO
                {
                    Age = age,
                    Gender = (int)(checkup.User?.Gender ?? 0),
                    Height_cm = (double)(checkup.MedicalMetric.Height_cm ?? 0),
                    Weight_kg = (double)(checkup.MedicalMetric.Weight_kg ?? 0),
                    SystolicBP = checkup.MedicalMetric.SystolicBP ?? 0,
                    DiastolicBP = checkup.MedicalMetric.DiastolicBP ?? 0,
                    BloodGlucose = (double)(checkup.MedicalMetric.BloodGlucose ?? 0),
                    HbA1c = (double)(checkup.MedicalMetric.HbA1c ?? 0),
                    Cholesterol_Total = (double)(checkup.MedicalMetric.Cholesterol_Total ?? 0),
                    SerumCreatinine = (double)(checkup.MedicalMetric.SerumCreatinine ?? 0),
                    BloodUrea = (double)(checkup.MedicalMetric.BloodUrea ?? 0),
                    Albumin_Urine = checkup.MedicalMetric.Albumin_Urine ?? 0,
                    Sugar_Urine = checkup.MedicalMetric.Sugar_Urine ?? 0,
                    ALT_SGPT = (double)(checkup.MedicalMetric.ALT_SGPT ?? 0),
                    AST_SGOT = (double)(checkup.MedicalMetric.AST_SGOT ?? 0),
                    TotalBilirubin = (double)(checkup.MedicalMetric.TotalBilirubin ?? 0),
                    DirectBilirubin = (double)(checkup.MedicalMetric.DirectBilirubin ?? 0),
                    Hemoglobin = (double)(checkup.MedicalMetric.Hemoglobin ?? 0),
                    SmokingStatus = checkup.MedicalMetric.SmokingStatus ?? 0,
                    AlcoholConsumption = (checkup.MedicalMetric.AlcoholConsumption ?? false) ? 1 : 0,
                    PhysicalActivity = (checkup.MedicalMetric.PhysicalActivity ?? false) ? 1 : 0,
                    Hypertension_History = (checkup.MedicalMetric.Hypertension_History ?? false) ? 1 : 0,
                    HeartDisease_History = (checkup.MedicalMetric.HeartDisease_History ?? false) ? 1 : 0,
                    EverMarried = (checkup.MedicalMetric.EverMarried ?? false) ? 1 : 0,
                    WorkType = checkup.MedicalMetric.WorkType ?? 0,
                    ResidenceType = checkup.MedicalMetric.ResidenceType ?? 0
                };
            }

            return dto;
        }

        private List<string> ExtractRiskFactors(HealthCheckup checkup)
        {
            var riskFactors = new List<string>();
            if (checkup.MedicalMetric == null) return new List<string> { "General Health Review" };
            
            if ((checkup.MedicalMetric.BloodGlucose ?? 0) > 126) riskFactors.Add("High Blood Glucose");
            if ((checkup.MedicalMetric.SystolicBP ?? 0) > 140 || (checkup.MedicalMetric.DiastolicBP ?? 0) > 90) riskFactors.Add("High Blood Pressure");
            if ((checkup.MedicalMetric.Cholesterol_Total ?? 0) > 240) riskFactors.Add("High Cholesterol");
            
            double heightM = (double)(checkup.MedicalMetric.Height_cm ?? 0) / 100;
            double weight = (double)(checkup.MedicalMetric.Weight_kg ?? 0);
            if (heightM > 0 && weight > 0)
            {
                double bmi = weight / (heightM * heightM);
                if (bmi >= 30) riskFactors.Add("Obesity");
            }

            return riskFactors.Any() ? riskFactors : new List<string> { "General Health Review" };
        }

        private List<string> ExtractRiskFactors(AIPredictionRequestDTO request)
        {
            var riskFactors = new List<string>();
            
            // Xử lý Nullable bằng cách lấy giá trị mặc định là 0 nếu người dùng không nhập
            if ((request.BloodGlucose ?? 0) > 126) riskFactors.Add("High Blood Glucose");
            if ((request.SystolicBP ?? 0) > 140 || (request.DiastolicBP ?? 0) > 90) riskFactors.Add("High Blood Pressure");
            if ((request.Cholesterol_Total ?? 0) > 240) riskFactors.Add("High Cholesterol");
            if ((request.BMI ?? 0) >= 30) riskFactors.Add("Obesity");

            return riskFactors.Any() ? riskFactors : new List<string> { "General Health" };
        }

        private string GetRiskLevel(double riskScore)
        {
            if (riskScore < 0.3) return "Low";
            if (riskScore < 0.6) return "Medium";
            if (riskScore < 0.8) return "High";
            return "Very High";
        }

        private HealthMetricsDTO MapMetrics(AIPredictionRequestDTO request)
        {
            return new HealthMetricsDTO
            {
                Age = request.Age,
                Gender = request.Gender,
                Height_cm = (double)(request.Height_cm ?? 0),
                Weight_kg = (double)(request.Weight_kg ?? 0),
                SystolicBP = (double)(request.SystolicBP ?? 0),
                DiastolicBP = (double)(request.DiastolicBP ?? 0),
                BloodGlucose = (double)(request.BloodGlucose ?? 0),
                Cholesterol_Total = (double)(request.Cholesterol_Total ?? 0)
            };
        }
    }
}