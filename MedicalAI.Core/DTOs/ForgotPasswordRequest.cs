using System.ComponentModel.DataAnnotations;

namespace MedicalAI.Core.DTOs;

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Vui lòng nhập Email")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = null!;
}
