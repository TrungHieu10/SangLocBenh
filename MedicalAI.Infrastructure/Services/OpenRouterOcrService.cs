using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MedicalAI.Core.Interfaces;

namespace MedicalAI.Infrastructure.Services
{
    public class OpenRouterOcrService : IOcrService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public OpenRouterOcrService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OpenRouter:ApiKey"] ?? throw new ArgumentNullException("OpenRouter:ApiKey is missing in appsettings");
            
            _httpClient.BaseAddress = new Uri("https://openrouter.ai/api/v1/");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:5173"); // Required by OpenRouter
            _httpClient.DefaultRequestHeaders.Add("X-Title", "MedicalAI"); // Required by OpenRouter
        }

        public async Task<string> ExtractMetricsFromImageAsync(string base64Image, string mimeType)
        {
            var prompt = @"Bạn là một trợ lý y khoa AI chuyên đọc phiếu xét nghiệm.
Hãy trích xuất các chỉ số từ ảnh/tài liệu phiếu xét nghiệm này và trả về ĐÚNG MỘT OBJECT JSON duy nhất, KHÔNG chứa các ký tự markdown như ```json.
Các key bắt buộc (nếu không có trong phiếu, hãy bỏ qua hoặc trả về null):
{
  ""bloodGlucose"": 0,
  ""hbA1c"": 0,
  ""cholesterol_Total"": 0,
  ""serumCreatinine"": 0,
  ""bloodUrea"": 0,
  ""alt_SGPT"": 0,
  ""ast_SGOT"": 0,
  ""totalBilirubin"": 0,
  ""directBilirubin"": 0,
  ""hemoglobin"": 0,
  ""alkaline_Phosphotase"": 0,
  ""total_Protiens"": 0,
  ""albumin_Blood"": 0,
  ""a_G_Ratio"": 0,
  ""packedCellVolume_pcv"": 0,
  ""whiteBloodCell_wc"": 0,
  ""redBloodCell_rc"": 0,
  ""sodium_sod"": 0,
  ""potassium_pot"": 0,
  ""specificGravity_sg"": 0,
  ""albumin_Urine"": 0,
  ""sugar_Urine"": 0,
  ""pusCells_pc"": 0,
  ""pusCellClumps_pcc"": 0,
  ""bacteria_ba"": 0,
  ""detected_units"": {
    ""bloodGlucose"": ""mg/dL hoặc mmol/L"",
    ""cholesterol_Total"": ""mg/dL hoặc mmol/L"",
    ""serumCreatinine"": ""mg/dL hoặc umol/L"",
    ""hemoglobin"": ""g/dL hoặc g/L"",
    ""totalBilirubin"": ""mg/dL hoặc umol/L"",
    ""directBilirubin"": ""mg/dL hoặc umol/L"",
    ""total_Protiens"": ""g/dL hoặc g/L"",
    ""albumin_Blood"": ""g/dL hoặc g/L"",
    ""packedCellVolume_pcv"": ""% hoặc L/L"",
    ""whiteBloodCell_wc"": ""cells/cumm hoặc 10^9/L""
  }
}

Lưu ý: BẮT BUỘC TRẢ VỀ ĐÚNG CON SỐ TRÊN GIẤY, TUYỆT ĐỐI KHÔNG TỰ TÍNH TOÁN HAY CHUYỂN ĐỔI ĐƠN VỊ. (Ví dụ giấy ghi 15.6 thì trả về đúng 15.6).
Đồng thời, hãy nhìn vào đơn vị trên giấy và điền chuẩn xác đơn vị đó vào object `detected_units`.

Đặc biệt đối với xét nghiệm Nước Tiểu (Mẫu 23):
- albumin_Urine chính là Protein nước tiểu.
- sugar_Urine chính là Glucose nước tiểu.
- pusCells_pc chính là Bạch cầu nước tiểu.
- bacteria_ba chính là Nitrit / Vi khuẩn.
Hãy map kết quả sang số nguyên theo quy tắc 5 mức độ sau:
1. Nếu là 'Âm tính' / 'Negative' / '0', trả về số 0.
2. Nếu là 'Vết' / 'Dương tính nhẹ' / '+', trả về số 1.
3. Nếu là 'Dương tính vừa' / '++', trả về số 2.
4. Nếu là 'Dương tính mạnh' / '+++', trả về số 3.
5. Nếu là 'Rất mạnh' / '++++', trả về số 4.
Chỉ trả về JSON hợp lệ.";

            var requestBody = new
            {
                model = "google/gemini-2.5-flash-lite-preview-09-2025",
                max_tokens = 1000,

                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new { type = "text", text = prompt },
                            new
                            {
                                type = "image_url",
                                image_url = new
                                {
                                    url = $"data:{mimeType};base64,{base64Image}"
                                }
                            }
                        }
                    }
                },
                response_format = new { type = "json_object" }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("chat/completions", jsonContent);
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"OpenRouter API Error: {response.StatusCode} - {error}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(responseJson);
            
            var content = document.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrEmpty(content)) return "{}";
            
            // Xóa toàn bộ markdown code block một cách triệt để
            content = content.Trim();
            if (content.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                content = content.Substring(7);
            }
            else if (content.StartsWith("```"))
            {
                content = content.Substring(3);
            }
            
            content = content.TrimEnd();
            if (content.EndsWith("```"))
            {
                content = content.Substring(0, content.Length - 3);
            }

            return content.Trim();
        }
    }
}
