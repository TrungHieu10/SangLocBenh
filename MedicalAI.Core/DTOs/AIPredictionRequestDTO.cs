namespace MedicalAI.Core.DTOs;

/// <summary>
/// DTO gửi sang Python FastAPI để chạy 5 mô hình AI.
/// Phải khớp với schema mà Python expect ở endpoint /api/predict/all.
/// </summary>
public class AIPredictionRequestDTO
{
    // ── Nhân khẩu học ───────────────────────────────────────────────
    public int Age { get; set; }
    public byte Gender { get; set; }           // 0=Female, 1=Male

    // ── Sinh hiệu ────────────────────────────────────────────────────
    public decimal? Height_cm { get; set; }
    public decimal? Weight_kg { get; set; }
    public short? SystolicBP { get; set; }
    public short? DiastolicBP { get; set; }

    // BMI được tính sẵn ở C# để Python không phải tính lại
    public decimal? BMI
    {
        get
        {
            if (Height_cm == null || Weight_kg == null || Height_cm == 0) return null;
            var heightM = Height_cm.Value / 100m;
            return Math.Round(Weight_kg.Value / (heightM * heightM), 2);
        }
    }

    // ── Xét nghiệm tim mạch / tiểu đường ────────────────────────────
    public decimal? BloodGlucose { get; set; }
    public decimal? HbA1c { get; set; }
    public decimal? Cholesterol_Total { get; set; }

    // ── Xét nghiệm thận ──────────────────────────────────────────────
    public decimal? SerumCreatinine { get; set; }
    public decimal? BloodUrea { get; set; }
    public byte? Albumin_Urine { get; set; }   // 0/1/2/3/4
    public byte? Sugar_Urine { get; set; }      // 0/1/2/3/4
    public decimal? Hemoglobin { get; set; }

    // Xét nghiệm Gan
    public decimal? ALT_SGPT { get; set; }
    public decimal? AST_SGOT { get; set; }
    public decimal? TotalBilirubin { get; set; }
    public decimal? DirectBilirubin { get; set; }
    public decimal? Alkaline_Phosphotase { get; set; }
    public decimal? Total_Protiens { get; set; }
    public decimal? Albumin_Blood { get; set; }
    public decimal? A_G_Ratio { get; set; }

    // Xét nghiệm Thận / Máu bổ sung
    public decimal? SpecificGravity_sg { get; set; }
    public decimal? PackedCellVolume_pcv { get; set; }
    public decimal? WhiteBloodCell_wc { get; set; }
    public decimal? RedBloodCell_rc { get; set; }
    public decimal? Sodium_sod { get; set; }
    public decimal? Potassium_pot { get; set; }

    // Xét nghiệm Nước tiểu
    public byte? PusCells_pc { get; set; }
    public byte? PusCellClumps_pcc { get; set; }
    public byte? Bacteria_ba { get; set; }

    // Triệu chứng lâm sàng
    public byte? Appetite_appet { get; set; }
    public bool? PedalEdema_pe { get; set; }
    public bool? Anemia_ane { get; set; }

    // ── Lối sống ─────────────────────────────────────────────────────
    public byte? SmokingStatus { get; set; }    // 0=never, 1=former, 2=current
    public bool? AlcoholConsumption { get; set; }
    public bool? PhysicalActivity { get; set; }

    // ── Tiền sử bệnh ─────────────────────────────────────────────────
    public bool? Hypertension_History { get; set; }
    public bool? HeartDisease_History { get; set; }

    // ── Nhân khẩu học mở rộng (dùng cho mô hình Đột quỵ) ─────────────
    public bool? EverMarried { get; set; }
    public byte? WorkType { get; set; }         // 0=children,1=govt,2=private,3=self,4=never
    public byte? ResidenceType { get; set; }    // 0=Rural, 1=Urban
}