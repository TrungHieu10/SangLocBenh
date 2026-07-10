using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalAI.Core.Entities;

[Table("Users", Schema = "Identity")]
public class User
{
    [Key]
    [MaxLength(450)]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = null!;

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = null!;

    [Required]
    public string PasswordHash { get; set; } = null!;

    public byte Gender { get; set; } // 0: Nữ, 1: Nam, 2: Khác

    public string? AvatarUrl { get; set; }
    
    public DateTime DateOfBirth { get; set; }

    [MaxLength(15)]
    public string? PhoneNumber { get; set; }

    [MaxLength(50)]
    public string? PatientCode { get; set; }

    [MaxLength(50)]
    public string Role { get; set; } = "Patient"; // Admin, Doctor, Patient, Nurse

    public bool IsActive { get; set; } = true;
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}