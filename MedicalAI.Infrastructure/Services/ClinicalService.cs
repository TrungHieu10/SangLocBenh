using MedicalAI.Core.DTOs;
using MedicalAI.Core.Entities;
using MedicalAI.Core.Interfaces;
using MedicalAI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MedicalAI.Infrastructure.Services;

public class ClinicalService : IClinicalService
{
    private readonly ApplicationDbContext _context;
    private readonly IAIPredictionClient _aiClient;
    private readonly INotificationService _notificationService;

    public ClinicalService(ApplicationDbContext context, IAIPredictionClient aiClient, INotificationService notificationService)
    {
        _context = context;
        _aiClient = aiClient;
        _notificationService = notificationService;
    }

    public async Task<CheckupResultResponse> SubmitCheckupAsync(string userId, string userRole, CreateCheckupRequest request)
    {
        // 1. Kiểm tra user tồn tại
        var user = await _context.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("Không tìm thấy người dùng.");

        // 2. Tính tuổi từ ngày sinh
        int age = DateTime.Today.Year - user.DateOfBirth.Year;
        if (user.DateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;

        // 3. Tạo bản ghi HealthCheckup
        var checkup = new HealthCheckup
        {
            UserId    = userId,
            Location  = request.Location,
            Notes     = request.Notes,
            CheckupDate = DateTimeOffset.UtcNow
        };

        // 4. Tạo bản ghi MedicalMetric
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
            Alkaline_Phosphotase = request.Alkaline_Phosphotase,
            Total_Protiens      = request.Total_Protiens,
            Albumin_Blood       = request.Albumin_Blood,
            A_G_Ratio           = request.A_G_Ratio,
            SpecificGravity_sg  = request.SpecificGravity_sg,
            PackedCellVolume_pcv= request.PackedCellVolume_pcv,
            WhiteBloodCell_wc   = request.WhiteBloodCell_wc,
            RedBloodCell_rc     = request.RedBloodCell_rc,
            Sodium_sod          = request.Sodium_sod,
            Potassium_pot       = request.Potassium_pot,
            PusCells_pc         = request.PusCells_pc,
            PusCellClumps_pcc   = request.PusCellClumps_pcc,
            Bacteria_ba         = request.Bacteria_ba,
            Appetite_appet      = request.Appetite_appet,
            PedalEdema_pe       = request.PedalEdema_pe,
            Anemia_ane          = request.Anemia_ane,
            SmokingStatus       = request.SmokingStatus,
            AlcoholConsumption  = request.AlcoholConsumption,
            PhysicalActivity    = request.PhysicalActivity,
            Hypertension_History  = request.Hypertension_History,
            HeartDisease_History  = request.HeartDisease_History,
            EverMarried         = request.EverMarried,
            WorkType            = request.WorkType,
            ResidenceType       = request.ResidenceType
        };

        _context.HealthCheckups.Add(checkup);
        _context.MedicalMetrics.Add(metric);

        // 5. Lưu tạm để có checkup.Id trước khi gọi AI
        await _context.SaveChangesAsync();

        // 6. Xây dựng DTO đầy đủ gửi sang Python AI
        var aiRequest = new AIPredictionRequestDTO
        {
            Age                  = request.Age ?? age,
            Gender               = request.Gender ?? user.Gender,
            Height_cm            = request.Height_cm,
            Weight_kg            = request.Weight_kg,
            SystolicBP           = request.SystolicBP,
            DiastolicBP          = request.DiastolicBP,
            BloodGlucose         = request.BloodGlucose,
            HbA1c                = request.HbA1c,
            Cholesterol_Total    = request.Cholesterol_Total,
            SerumCreatinine      = request.SerumCreatinine,
            BloodUrea            = request.BloodUrea,
            Albumin_Urine        = request.Albumin_Urine,
            Sugar_Urine          = request.Sugar_Urine,
            ALT_SGPT             = request.ALT_SGPT,
            AST_SGOT             = request.AST_SGOT,
            TotalBilirubin       = request.TotalBilirubin,
            DirectBilirubin      = request.DirectBilirubin,
            Hemoglobin           = request.Hemoglobin,
            Alkaline_Phosphotase = request.Alkaline_Phosphotase,
            Total_Protiens       = request.Total_Protiens,
            Albumin_Blood        = request.Albumin_Blood,
            A_G_Ratio            = request.A_G_Ratio,
            SpecificGravity_sg   = request.SpecificGravity_sg,
            PackedCellVolume_pcv = request.PackedCellVolume_pcv,
            WhiteBloodCell_wc    = request.WhiteBloodCell_wc,
            RedBloodCell_rc      = request.RedBloodCell_rc,
            Sodium_sod           = request.Sodium_sod,
            Potassium_pot        = request.Potassium_pot,
            PusCells_pc          = request.PusCells_pc,
            PusCellClumps_pcc    = request.PusCellClumps_pcc,
            Bacteria_ba          = request.Bacteria_ba,
            Appetite_appet       = request.Appetite_appet,
            PedalEdema_pe        = request.PedalEdema_pe,
            Anemia_ane           = request.Anemia_ane,
            SmokingStatus        = request.SmokingStatus,
            AlcoholConsumption   = request.AlcoholConsumption,
            PhysicalActivity     = request.PhysicalActivity,
            Hypertension_History = request.Hypertension_History,
            HeartDisease_History = request.HeartDisease_History,
            EverMarried          = request.EverMarried,
            WorkType             = request.WorkType,
            ResidenceType        = request.ResidenceType
        };

        // 7. Gọi AI Server
        var predictions = await _aiClient.GetPredictionsAsync(aiRequest);

        // 8. Gán CheckupId vào từng kết quả rồi lưu DB
        foreach (var pred in predictions)
        {
            pred.CheckupId = checkup.Id;
            _context.PredictionResults.Add(pred);
        }
        await _context.SaveChangesAsync();

        // 8.5. Báo cho Bác sĩ có ca khám mới
        await _notificationService.CreateNotificationForRoleAsync(
            "Doctor", 
            "Ca khám mới cần đánh giá", 
            $"Bệnh nhân {user.FullName} vừa nộp một hồ sơ khám mới.", 
            checkup.Id);

        // 9. Trả về response đầy đủ cho Controller
        var response = MapToResponse(checkup, predictions);

        // Nếu là Patient thì ẩn dự đoán vì Status = Pending
        bool isMedicalStaff = userRole == "Doctor" || userRole == "Admin";
        if (!isMedicalStaff)
        {
            response.Predictions = new List<PredictionResultDTO>();
        }

        return response;
    }

    public async Task<CheckupResultResponse> UpdateCheckupAsync(long checkupId, CreateCheckupRequest request)
    {
        var checkup = await _context.HealthCheckups
            .Include(c => c.MedicalMetric)
            .Include(c => c.PredictionResults)
            .FirstOrDefaultAsync(c => c.Id == checkupId && !c.IsDeleted)
            ?? throw new InvalidOperationException("Không tìm thấy hồ sơ khám.");

        if (checkup.Status != "Pending")
            throw new InvalidOperationException("Hồ sơ đã được duyệt, không thể sửa đổi.");

        // Cập nhật MedicalMetric
        var metric = checkup.MedicalMetric;
        metric.Height_cm = request.Height_cm;
        metric.Weight_kg = request.Weight_kg;
        metric.SystolicBP = request.SystolicBP;
        metric.DiastolicBP = request.DiastolicBP;
        metric.BloodGlucose = request.BloodGlucose;
        metric.HbA1c = request.HbA1c;
        metric.Cholesterol_Total = request.Cholesterol_Total;
        metric.SerumCreatinine = request.SerumCreatinine;
        metric.BloodUrea = request.BloodUrea;
        metric.Albumin_Urine = request.Albumin_Urine;
        metric.Sugar_Urine = request.Sugar_Urine;
        metric.ALT_SGPT = request.ALT_SGPT;
        metric.AST_SGOT = request.AST_SGOT;
        metric.TotalBilirubin = request.TotalBilirubin;
        metric.DirectBilirubin = request.DirectBilirubin;
        metric.Hemoglobin = request.Hemoglobin;
        metric.Alkaline_Phosphotase = request.Alkaline_Phosphotase;
        metric.Total_Protiens = request.Total_Protiens;
        metric.Albumin_Blood = request.Albumin_Blood;
        metric.A_G_Ratio = request.A_G_Ratio;
        metric.SpecificGravity_sg = request.SpecificGravity_sg;
        metric.PackedCellVolume_pcv = request.PackedCellVolume_pcv;
        metric.WhiteBloodCell_wc = request.WhiteBloodCell_wc;
        metric.RedBloodCell_rc = request.RedBloodCell_rc;
        metric.Sodium_sod = request.Sodium_sod;
        metric.Potassium_pot = request.Potassium_pot;
        metric.PusCells_pc = request.PusCells_pc;
        metric.PusCellClumps_pcc = request.PusCellClumps_pcc;
        metric.Bacteria_ba = request.Bacteria_ba;
        metric.Appetite_appet = request.Appetite_appet;
        metric.PedalEdema_pe = request.PedalEdema_pe;
        metric.Anemia_ane = request.Anemia_ane;
        metric.SmokingStatus = request.SmokingStatus;
        metric.AlcoholConsumption = request.AlcoholConsumption;
        metric.PhysicalActivity = request.PhysicalActivity;
        metric.Hypertension_History = request.Hypertension_History;
        metric.HeartDisease_History = request.HeartDisease_History;
        metric.EverMarried = request.EverMarried;
        metric.WorkType = request.WorkType;
        metric.ResidenceType = request.ResidenceType;

        // Xóa Prediction cũ
        _context.PredictionResults.RemoveRange(checkup.PredictionResults);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(checkup.UserId);
        int age = DateTime.Today.Year - user!.DateOfBirth.Year;
        if (user.DateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;

        var aiRequest = new AIPredictionRequestDTO
        {
            Age                  = request.Age ?? age,
            Gender               = request.Gender ?? user.Gender,
            Height_cm            = request.Height_cm,
            Weight_kg            = request.Weight_kg,
            SystolicBP           = request.SystolicBP,
            DiastolicBP          = request.DiastolicBP,
            BloodGlucose         = request.BloodGlucose,
            HbA1c                = request.HbA1c,
            Cholesterol_Total    = request.Cholesterol_Total,
            SerumCreatinine      = request.SerumCreatinine,
            BloodUrea            = request.BloodUrea,
            Albumin_Urine        = request.Albumin_Urine,
            Sugar_Urine          = request.Sugar_Urine,
            ALT_SGPT             = request.ALT_SGPT,
            AST_SGOT             = request.AST_SGOT,
            TotalBilirubin       = request.TotalBilirubin,
            DirectBilirubin      = request.DirectBilirubin,
            Hemoglobin           = request.Hemoglobin,
            Alkaline_Phosphotase = request.Alkaline_Phosphotase,
            Total_Protiens       = request.Total_Protiens,
            Albumin_Blood        = request.Albumin_Blood,
            A_G_Ratio            = request.A_G_Ratio,
            SpecificGravity_sg   = request.SpecificGravity_sg,
            PackedCellVolume_pcv = request.PackedCellVolume_pcv,
            WhiteBloodCell_wc    = request.WhiteBloodCell_wc,
            RedBloodCell_rc      = request.RedBloodCell_rc,
            Sodium_sod           = request.Sodium_sod,
            Potassium_pot        = request.Potassium_pot,
            PusCells_pc          = request.PusCells_pc,
            PusCellClumps_pcc    = request.PusCellClumps_pcc,
            Bacteria_ba          = request.Bacteria_ba,
            Appetite_appet       = request.Appetite_appet,
            PedalEdema_pe        = request.PedalEdema_pe,
            Anemia_ane           = request.Anemia_ane,
            SmokingStatus        = request.SmokingStatus,
            AlcoholConsumption   = request.AlcoholConsumption,
            PhysicalActivity     = request.PhysicalActivity,
            Hypertension_History = request.Hypertension_History,
            HeartDisease_History = request.HeartDisease_History,
            EverMarried          = request.EverMarried,
            WorkType             = request.WorkType,
            ResidenceType        = request.ResidenceType
        };

        var predictions = await _aiClient.GetPredictionsAsync(aiRequest);

        foreach (var pred in predictions)
        {
            pred.CheckupId = checkup.Id;
            _context.PredictionResults.Add(pred);
        }
        await _context.SaveChangesAsync();

        return MapToResponse(checkup, predictions.ToList());
    }

    public async Task<CheckupResultResponse?> GetCheckupResultAsync(string userId, string userRole, long checkupId)
    {
        // Doctor, Admin, Nurse có thể xem mọi hồ sơ
        bool canViewAll = userRole == "Doctor" || userRole == "Admin" || userRole == "Nurse";
        bool isDoctorOrAdmin = userRole == "Doctor" || userRole == "Admin";

        var checkup = await _context.HealthCheckups
            .Include(c => c.MedicalMetric)
            .Include(c => c.PredictionResults)
            .FirstOrDefaultAsync(c => c.Id == checkupId
                                   && (c.UserId == userId || canViewAll)
                                   && !c.IsDeleted);

        if (checkup == null) return null;

        var response = MapToResponse(checkup, checkup.PredictionResults.ToList());

        // Nếu là Patient hoặc Nurse và Status = Pending thì ẩn dự đoán
        if (!isDoctorOrAdmin && checkup.Status == "Pending")
        {
            response.Predictions = new List<PredictionResultDTO>();
        }

        return response;
    }

    // ── Helper: Entity → DTO ─────────────────────────────────────────
    private static CheckupResultResponse MapToResponse(
        HealthCheckup checkup,
        List<PredictionResult> predictions)
    {
        return new CheckupResultResponse
        {
            CheckupId   = checkup.Id,
            CheckupDate = checkup.CheckupDate,
            Notes       = checkup.Notes,
            DoctorId    = checkup.DoctorId,
            Status      = checkup.Status,
            Metrics     = checkup.MedicalMetric,
            Predictions = predictions.Select(p => new PredictionResultDTO
            {
                Id             = p.Id,
                DiseaseType    = p.DiseaseType,
                Probability    = p.Probability,
                RiskLevel      = p.RiskLevel,
                ThresholdUsed  = p.ThresholdUsed,
                ShapValuesJSON = p.ShapValuesJSON,
                AdviceJSON     = p.AdviceJSON,
                ModelVersion   = p.ModelVersion,
                CreatedAt      = p.CreatedAt
            }).ToList()
        };
    }

    public async Task<object> GetCheckupHistoryAsync(string userId, int page, int pageSize, string sortBy)
    {
        var query = _context.HealthCheckups
            .Include(c => c.MedicalMetric)
            .Include(c => c.PredictionResults)
            .Where(c => c.UserId == userId && !c.IsDeleted);

        query = sortBy == "createdAt_asc" 
            ? query.OrderBy(c => c.CheckupDate) 
            : query.OrderByDescending(c => c.CheckupDate);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(c => new
        {
            id = c.Id,
            date = c.CheckupDate,
            status = c.Status,
            metrics = c.MedicalMetric,
            predictions = c.Status == "Pending" ? null : c.PredictionResults.Select(p => new {
                disease = p.DiseaseType,
                probability = p.Probability,
                riskLevel = p.RiskLevel
            }).ToList()
        }).ToListAsync();

        return new { items, total, page, pageSize };
    }

    public async Task<object> GetAllCheckupsAsync(int page, int pageSize, string sortBy)
    {
        var query = _context.HealthCheckups
            .Include(c => c.MedicalMetric)
            .Include(c => c.User)
            .Where(c => !c.IsDeleted);

        query = sortBy == "createdAt_asc" 
            ? query.OrderBy(c => c.CheckupDate) 
            : query.OrderByDescending(c => c.CheckupDate);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(c => new
        {
            id = c.Id,
            date = c.CheckupDate,
            status = c.Status,
            patientName = c.User.FullName,
            patientCode = c.User.PatientCode,
            patientGender = c.User.Gender,
            patientDob = c.User.DateOfBirth,
            metrics = c.MedicalMetric
        }).ToListAsync();
        
        foreach (var item in items)
        {
            if (item.metrics != null)
            {
                item.metrics.HealthCheckup = null;
            }
        }

        return new { items, total, page, pageSize };
    }

    public async Task<object> GetPredictionHistoryAsync(string userId, int limit, DateTimeOffset? from, DateTimeOffset? to)
    {
        var query = _context.HealthCheckups
            .Include(c => c.PredictionResults)
            .Where(c => c.UserId == userId && !c.IsDeleted);

        if (from.HasValue) query = query.Where(c => c.CheckupDate >= from.Value);
        if (to.HasValue) query = query.Where(c => c.CheckupDate <= to.Value);

        var items = await query.OrderByDescending(c => c.CheckupDate).Take(limit).ToListAsync();
        
        return items.Select(c => new
        {
            date = c.CheckupDate,
            status = c.Status,
            predictions = c.Status == "Pending" ? null : c.PredictionResults.Select(p => new {
                disease = p.DiseaseType,
                probability = p.Probability
            }).ToList(),
            riskLevel = c.Status == "Pending" ? "Pending" : (c.PredictionResults.OrderByDescending(p => p.Probability).FirstOrDefault()?.RiskLevel ?? "Low")
        }).OrderBy(x => x.date).ToList(); // Sắp xếp lại tăng dần cho biểu đồ
    }

    public async Task<object> GetFeatureImportanceAsync(string diseaseType)
    {
        // Call the Python AI API for real global feature importance
        var result = await _aiClient.GetFeatureImportanceAsync(diseaseType);
        return result;
    }

    public async Task<object> GetRiskStatisticsAsync(string userId)
    {
        var query = _context.PredictionResults
            .Include(p => p.HealthCheckup)
            .Where(p => p.HealthCheckup.UserId == userId && !p.HealthCheckup.IsDeleted);

        var low = await query.CountAsync(p => p.RiskLevel == "Low");
        var medium = await query.CountAsync(p => p.RiskLevel == "Medium");
        var high = await query.CountAsync(p => p.RiskLevel == "High" || p.RiskLevel == "Very High");

        return new { low, medium, high };
    }
}