namespace MedicalAI.Core.DTOs
{
    public class OcrRequest
    {
        public string Base64Image { get; set; } = "";
        public string MimeType { get; set; } = "image/jpeg";
    }
}
