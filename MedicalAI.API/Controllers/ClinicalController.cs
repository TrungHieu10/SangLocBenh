using System.Security.Claims;
using MedicalAI.Core.DTOs;
using MedicalAI.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalAI.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ClinicalController : ControllerBase
{
    private readonly IClinicalService _clinicalService;
    private readonly IOcrService _ocrService;

    public ClinicalController(IClinicalService clinicalService, IOcrService ocrService)
    {
        _clinicalService = clinicalService;
        _ocrService = ocrService;
    }

    /// <summary>
    /// Nhận form khám sức khỏe, lưu DB, gọi AI, trả kết quả ngay.
    /// Frontend dùng response này để render ResultDashboard lần đầu.
    /// </summary>
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitCheckup([FromBody] CreateCheckupRequest request)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });

        string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Patient";

        try
        {
            var result = await _clinicalService.SubmitCheckupAsync(userId, userRole, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine("SUBMIT CHECKUP ERROR: " + ex.ToString());
            return StatusCode(500, new { message = "Lỗi hệ thống khi xử lý hồ sơ khám. Chi tiết: " + ex.ToString() });
        }
    }

    /// <summary>
    /// Lấy kết quả của một lần khám theo ID.
    /// Frontend gọi endpoint này khi user F5 trang /result/:checkupId.
    /// </summary>
    [HttpGet("{checkupId:long}/result")]
    public async Task<IActionResult> GetCheckupResult(long checkupId)
    {
        try
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? User.FindFirst("sub")?.Value;
            string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Patient";
                         
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Token không hợp lệ." });

            var result = await _clinicalService.GetCheckupResultAsync(userId, userRole, checkupId);

            if (result == null)
                return NotFound(new { message = $"Không tìm thấy hồ sơ khám #{checkupId}." });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi lấy kết quả khám. " + ex.ToString() });
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetCheckupHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string sortBy = "createdAt")
    {
        try
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _clinicalService.GetCheckupHistoryAsync(userId, page, pageSize, sortBy);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi tải lịch sử khám." });
        }
    }

    [HttpGet("predictions/history")]
    public async Task<IActionResult> GetPredictionHistory([FromQuery] int limit = 10, [FromQuery] DateTimeOffset? from = null, [FromQuery] DateTimeOffset? to = null)
    {
        try
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _clinicalService.GetPredictionHistoryAsync(userId, limit, from, to);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi tải lịch sử dự đoán." });
        }
    }

    [HttpGet("predictions/feature-importance")]
    public async Task<IActionResult> GetFeatureImportance([FromQuery] string diseaseType = "all")
    {
        try
        {
            var result = await _clinicalService.GetFeatureImportanceAsync(diseaseType);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi tải feature importance." });
        }
    }

    [HttpGet("predictions/risk-stats")]
    public async Task<IActionResult> GetRiskStatistics()
    {
        try
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _clinicalService.GetRiskStatisticsAsync(userId);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi tải thống kê nguy cơ." });
        }
    }

    [HttpPost("extract-ocr")]
    public async Task<IActionResult> ExtractOcr([FromBody] OcrRequest request)
    {
        if (string.IsNullOrEmpty(request.Base64Image))
            return BadRequest(new { message = "Base64 image is required" });
            
        try 
        {
            var jsonStr = await _ocrService.ExtractMetricsFromImageAsync(request.Base64Image, request.MimeType ?? "image/jpeg");
            return Ok(new { success = true, data = jsonStr });
        }
        catch (Exception ex)
        {
            Console.WriteLine("OCR ERROR: " + ex.ToString());
            return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi xử lý hồ sơ khám. Chi tiết: " + ex.Message });
        }
    }
}