namespace MedicalAI.Core.DTOs;

public class CreateCheckupRequest
{
    public string? Location { get; set; }
    public string? Notes { get; set; }

    // Cho phép Frontend ghi đè Tuổi và Giới tính để test AI (Ngoại kiểm)
    public int? Age { get; set; }
    public byte? Gender { get; set; }

    // Nhóm Sinh hiệu
    public decimal? Height_cm { get; set; }
    public decimal? Weight_kg { get; set; }
    public short? SystolicBP { get; set; }
    public short? DiastolicBP { get; set; }

    // Nhóm Xét nghiệm
    public decimal? BloodGlucose { get; set; }
    public decimal? HbA1c { get; set; }
    public decimal? Cholesterol_Total { get; set; }
    public decimal? SerumCreatinine { get; set; }
    public decimal? BloodUrea { get; set; }
    public byte? Albumin_Urine { get; set; }
    public byte? Sugar_Urine { get; set; }
    public decimal? ALT_SGPT { get; set; }
    public decimal? AST_SGOT { get; set; }
    public decimal? TotalBilirubin { get; set; }
    public decimal? DirectBilirubin { get; set; }
    public decimal? Hemoglobin { get; set; }

    // Nhóm Xét nghiệm Gan bổ sung
    public decimal? Alkaline_Phosphotase { get; set; }
    public decimal? Total_Protiens { get; set; }
    public decimal? Albumin_Blood { get; set; }
    public decimal? A_G_Ratio { get; set; }

    // Nhóm Xét nghiệm Máu / Thận bổ sung
    public decimal? SpecificGravity_sg { get; set; }
    public decimal? PackedCellVolume_pcv { get; set; }
    public decimal? WhiteBloodCell_wc { get; set; }
    public decimal? RedBloodCell_rc { get; set; }
    public decimal? Sodium_sod { get; set; }
    public decimal? Potassium_pot { get; set; }

    // Nhóm Xét nghiệm Nước tiểu (Danh mục)
    public byte? PusCells_pc { get; set; }
    public byte? PusCellClumps_pcc { get; set; }
    public byte? Bacteria_ba { get; set; }

    // Triệu chứng lâm sàng
    public byte? Appetite_appet { get; set; }
    public bool? PedalEdema_pe { get; set; }
    public bool? Anemia_ane { get; set; }

    // Nhóm Lối sống
    public byte? SmokingStatus { get; set; }
    public bool? AlcoholConsumption { get; set; }
    public bool? PhysicalActivity { get; set; }
    public bool? Hypertension_History { get; set; }
    public bool? HeartDisease_History { get; set; }
    public bool? EverMarried { get; set; }
    public byte? WorkType { get; set; }
    public byte? ResidenceType { get; set; }
}