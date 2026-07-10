using System.Security.Claims;
using MedicalAI.Core.DTOs;
using MedicalAI.Core.Entities;
using MedicalAI.Core.Interfaces;
using MedicalAI.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicalAI.API.Controllers;

public class NurseSubmitCheckupRequest : CreateCheckupRequest
{
    public string PatientId { get; set; } = null!;
}

public class NurseCreatePatientRequest
{
    public string FullName { get; set; } = null!;
    public string PatientCode { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public byte Gender { get; set; }
    public DateTime DateOfBirth { get; set; }
}

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Nurse,Admin")]
public class NurseController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IClinicalService _clinicalService;

    public NurseController(ApplicationDbContext dbContext, IClinicalService clinicalService)
    {
        _dbContext = dbContext;
        _clinicalService = clinicalService;
    }

    [HttpGet("generate-patient-code")]
    public async Task<IActionResult> GeneratePatientCode()
    {
        // Lấy danh sách các PatientCode dạng BN-xxxx
        var maxCode = await _dbContext.Users
            .Where(u => u.PatientCode != null && u.PatientCode.StartsWith("BN-"))
            .Select(u => u.PatientCode)
            .ToListAsync();

        int nextId = 10001; // Số bắt đầu mặc định
        if (maxCode.Any())
        {
            var maxNum = maxCode
                .Select(code => {
                    int.TryParse(code.Replace("BN-", ""), out int num);
                    return num;
                })
                .Max();
            if (maxNum >= 10000)
            {
                nextId = maxNum + 1;
            }
        }

        string newCode = $"BN-{nextId}";
        return Ok(new { success = true, data = newCode });
    }

    [HttpGet("search-patient")]
    public async Task<IActionResult> SearchPatient([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { message = "Vui lòng nhập từ khóa tìm kiếm (Mã Y Tế, SĐT hoặc Email)" });

        var patientUser = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Role == "Patient" && (u.PatientCode == query || u.PhoneNumber == query || u.Email == query));

        if (patientUser == null)
            return NotFound(new { message = "Không tìm thấy bệnh nhân" });

        // Auto-assign PatientCode if missing (for legacy users who registered before auto-generation)
        if (string.IsNullOrEmpty(patientUser.PatientCode))
        {
            var maxCode = await _dbContext.Users
                .Where(u => u.PatientCode != null && u.PatientCode.StartsWith("BN-"))
                .Select(u => u.PatientCode)
                .ToListAsync();

            int nextId = 10001;
            if (maxCode.Any())
            {
                var maxNum = maxCode
                    .Select(code => {
                        int.TryParse(code.Replace("BN-", ""), out int num);
                        return num;
                    })
                    .Max();
                if (maxNum >= 10000)
                {
                    nextId = maxNum + 1;
                }
            }
            patientUser.PatientCode = $"BN-{nextId}";
            await _dbContext.SaveChangesAsync();
        }

        var patientData = new
        {
            patientUser.Id,
            patientUser.FullName,
            patientUser.Email,
            patientUser.PhoneNumber,
            patientUser.PatientCode,
            patientUser.Gender,
            patientUser.DateOfBirth
        };

        return Ok(new { success = true, data = patientData });
    }

    [HttpPost("create-patient")]
    public async Task<IActionResult> CreatePatient([FromBody] NurseCreatePatientRequest req)
    {
        if (string.IsNullOrEmpty(req.PatientCode))
            return BadRequest(new { message = "Vui lòng nhập Mã Y Tế" });

        if (await _dbContext.Users.AnyAsync(u => u.PatientCode == req.PatientCode))
            return BadRequest(new { message = "Mã Y Tế này đã tồn tại trong hệ thống" });

        if (!string.IsNullOrEmpty(req.PhoneNumber) && await _dbContext.Users.AnyAsync(u => u.PhoneNumber == req.PhoneNumber))
            return BadRequest(new { message = "Số điện thoại đã tồn tại" });

        var user = new User
        {
            FullName = req.FullName,
            Email = $"{req.PatientCode.ToLower()}@clinic.local", // Dummy email
            PhoneNumber = req.PhoneNumber,
            PatientCode = req.PatientCode,
            Gender = req.Gender,
            DateOfBirth = req.DateOfBirth,
            Role = "Patient",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), // Default password
            IsActive = true
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, message = "Tạo bệnh nhân thành công", data = new { user.Id, user.FullName, user.Email, user.PhoneNumber, user.PatientCode, user.Gender, user.DateOfBirth } });
    }

    [HttpPost("submit-checkup")]
    public async Task<IActionResult> SubmitCheckup([FromBody] NurseSubmitCheckupRequest request)
    {
        if (string.IsNullOrEmpty(request.PatientId))
            return BadRequest(new { message = "PatientId is required" });

        try
        {
            // Submit as the patient!
            var result = await _clinicalService.SubmitCheckupAsync(request.PatientId, "Patient", request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi xử lý hồ sơ khám. Chi tiết: " + ex.Message });
        }
    }
    [HttpGet("checkups")]
    public async Task<IActionResult> GetCheckups([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string sortBy = "createdAt_desc")
    {
        var result = await _clinicalService.GetAllCheckupsAsync(page, pageSize, sortBy);
        return Ok(new { success = true, data = result });
    }

    [HttpPut("update-checkup/{id}")]
    public async Task<IActionResult> UpdateCheckup(long id, [FromBody] CreateCheckupRequest request)
    {
        try
        {
            var result = await _clinicalService.UpdateCheckupAsync(id, request);
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi cập nhật hồ sơ. Chi tiết: " + ex.Message });
        }
    }
}
