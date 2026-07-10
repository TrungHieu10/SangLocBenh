namespace MedicalAI.Core.DTOs
{
    public class SubmitReviewRequest
    {
        public string Notes { get; set; } = "";
        public string? Advice { get; set; }
    }
}
