using System.ComponentModel.DataAnnotations;

namespace MedicalAI.Core.DTOs;

public class RegisterRequest
{
    [Required] public string FullName { get; set; } = null!;
    [Required, EmailAddress] public string Email { get; set; } = null!;
    [Required, MinLength(6)] public string Password { get; set; } = null!;
    public byte Gender { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PatientCode { get; set; }
}