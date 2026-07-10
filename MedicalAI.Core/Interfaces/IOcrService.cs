using System.Threading.Tasks;

namespace MedicalAI.Core.Interfaces
{
    public interface IOcrService
    {
        Task<string> ExtractMetricsFromImageAsync(string base64Image, string mimeType);
    }
}
