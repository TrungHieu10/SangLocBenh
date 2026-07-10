namespace MedicalAI.Core.DTOs;

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public byte? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
}
