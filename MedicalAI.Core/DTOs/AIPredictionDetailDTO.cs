using System;
using System.Collections.Generic;

namespace MedicalAI.Core.DTOs
{
    /// <summary>
    /// DTO chứa kết quả dự đoán từ AI model
    /// </summary>
    public class AIPredictionDetailDTO
    {
        public string CheckupId { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public string? Notes { get; set; }
        public string? DoctorId { get; set; }
        
        // Dự đoán chính
        public List<DiseaseRiskDTO> Predictions { get; set; } = new();
        public string RiskLevel { get; set; } = ""; // Low, Medium, High, Very High
        public double RiskScore { get; set; } // 0-1

        // SHAP Explainability
        public List<ShapValueDTO> ShapValues { get; set; } = new();

        // RAG-generated advice
        public List<string> Advice { get; set; } = new();
        public List<string> PreventionTips { get; set; } = new();
        public List<string> LifestyleRecommendations { get; set; } = new();

        // Raw metrics for reference
        public HealthMetricsDTO Metrics { get; set; } = new();
    }

    public class DiseaseRiskDTO
    {
        public string Disease { get; set; } = "";
        public string Description { get; set; } = "";
        public double Probability { get; set; } // 0-1
        public string ICD10Code { get; set; } = "";
        public string ShapValuesJSON { get; set; } = "";
    }

    public class ShapValueDTO
    {
        public string FeatureName { get; set; } = "";
        public double ShapValue { get; set; }
        public double BaseValue { get; set; }
        public int Index { get; set; }
    }

    public class HealthMetricsDTO
    {
        public int Age { get; set; }
        public int Gender { get; set; }
        public double Height_cm { get; set; }
        public double Weight_kg { get; set; }
        public double SystolicBP { get; set; }
        public double DiastolicBP { get; set; }
        public double BloodGlucose { get; set; }
        public double HbA1c { get; set; }
        public double Cholesterol_Total { get; set; }
        public double SerumCreatinine { get; set; }
        public double BloodUrea { get; set; }
        public double Albumin_Urine { get; set; }
        public double Sugar_Urine { get; set; }
        public double ALT_SGPT { get; set; }
        public double AST_SGOT { get; set; }
        public double TotalBilirubin { get; set; }
        public double DirectBilirubin { get; set; }
        public double Hemoglobin { get; set; }
        public int SmokingStatus { get; set; }
        public int AlcoholConsumption { get; set; }
        public int PhysicalActivity { get; set; }
        public int Hypertension_History { get; set; }
        public int HeartDisease_History { get; set; }
        public int EverMarried { get; set; }
        public int WorkType { get; set; }
        public int ResidenceType { get; set; }
    }
}
