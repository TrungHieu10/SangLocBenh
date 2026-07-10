using MedicalAI.Core.DTOs;

namespace MedicalAI.Core.Interfaces;

public interface IClinicalService
{
    /// <summary>
    /// Lưu hồ sơ khám + gọi AI + lưu kết quả.
    /// Trả về CheckupResultResponse chứa đủ dữ liệu cho frontend render ngay.
    /// </summary>
    Task<CheckupResultResponse> SubmitCheckupAsync(string userId, string userRole, CreateCheckupRequest request);

    /// <summary>
    /// Lấy kết quả của một lần khám theo ID.
    /// Dùng khi user F5 trang ResultDashboard.
    /// </summary>
    Task<CheckupResultResponse?> GetCheckupResultAsync(string userId, string userRole, long checkupId);

    Task<CheckupResultResponse> UpdateCheckupAsync(long checkupId, CreateCheckupRequest request);
    Task<object> GetAllCheckupsAsync(int page, int pageSize, string sortBy);

    Task<object> GetCheckupHistoryAsync(string userId, int page, int pageSize, string sortBy);
    Task<object> GetPredictionHistoryAsync(string userId, int limit, DateTimeOffset? from, DateTimeOffset? to);
    Task<object> GetFeatureImportanceAsync(string diseaseType);
    Task<object> GetRiskStatisticsAsync(string userId);
}