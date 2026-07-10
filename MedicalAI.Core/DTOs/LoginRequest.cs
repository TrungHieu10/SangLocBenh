using System.ComponentModel.DataAnnotations;

namespace MedicalAI.Core.DTOs;

public class LoginRequest
{
    [Required] public string Identifier { get; set; } = null!;
    [Required] public string Password { get; set; } = null!;
}