using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalAI.Infrastructure.Services
{
    /// <summary>
    /// RAG Engine - Retrieval Augmented Generation
    /// Truy vấn Knowledge Graph để lấy advice và recommendations dựa trên predictions
    /// </summary>
    public interface IRAGEngine
    {
        Task<List<string>> GenerateAdviceAsync(string disease, double riskScore);
        Task<List<string>> GeneratePreventionAsync(string disease);
        Task<List<string>> GenerateLifestyleRecommendationsAsync(List<string> riskFactors);
        Task<string> AugmentAdviceWithContextAsync(string disease, double riskScore);
    }

    public class RAGEngine : IRAGEngine
    {
        private readonly INeo4jService _neo4jService;

        public RAGEngine(INeo4jService neo4jService)
        {
            _neo4jService = neo4jService;
        }

        /// <summary>
        /// Sinh lời khuyên y tế dựa trên bệnh và mức độ rủi ro
        /// </summary>
        public async Task<List<string>> GenerateAdviceAsync(string disease, double riskScore)
        {
            var advice = await _neo4jService.GetAdviceByRiskLevelAsync(disease, riskScore);
            
            if (!advice.Any())
            {
                // Fallback advice nếu không có dữ liệu từ KG
                advice = GetDefaultAdviceByRiskLevel(disease, riskScore);
            }

            return advice;
        }

        /// <summary>
        /// Sinh mẹo phòng chống bệnh
        /// </summary>
        public async Task<List<string>> GeneratePreventionAsync(string disease)
        {
            var prevention = await _neo4jService.GetPreventionTipsAsync(disease);
            
            if (!prevention.Any())
            {
                prevention = GetDefaultPrevention(disease);
            }

            return prevention;
        }

        /// <summary>
        /// Sinh khuyến nghị lối sống dựa trên yếu tố nguy hiểm
        /// </summary>
        public async Task<List<string>> GenerateLifestyleRecommendationsAsync(List<string> riskFactors)
        {
            var recommendations = await _neo4jService.GetLifestyleRecommendationsAsync(riskFactors);
            
            if (!recommendations.Any())
            {
                recommendations = GetDefaultLifestyleRecommendations();
            }

            return recommendations;
        }

        /// <summary>
        /// Sinh lời khuyên chi tiết với ngữ cảnh (prompt engineering)
        /// </summary>
        public async Task<string> AugmentAdviceWithContextAsync(string disease, double riskScore)
        {
            var advice = await GenerateAdviceAsync(disease, riskScore);
            var prevention = await GeneratePreventionAsync(disease);
            var riskLevel = GetRiskLevel(riskScore);

            var context = new
            {
                Disease = disease,
                RiskLevel = riskLevel,
                RiskScore = Math.Round(riskScore * 100, 2),
                Advice = advice,
                Prevention = prevention
            };

            // Tạo prompt cho LLM (nếu sử dụng OpenAI hoặc LLM khác)
            var prompt = $@"
Based on the following medical data:
- Disease: {disease}
- Risk Level: {riskLevel}
- Risk Score: {context.RiskScore}%

Medical Advice:
{string.Join("\n", advice.Select((a, i) => $"{i + 1}. {a}"))}

Prevention Tips:
{string.Join("\n", prevention.Select((p, i) => $"{i + 1}. {p}"))}

Please provide a concise, professional medical recommendation in Vietnamese (max 2-3 sentences).
";

            // Đây là placeholder - trong thực tế sẽ call LLM API
            return GenerateFinalRecommendation(disease, riskLevel, advice, prevention);
        }

        private string GetRiskLevel(double riskScore)
        {
            if (riskScore < 0.3) return "Low";
            if (riskScore < 0.6) return "Medium";
            if (riskScore < 0.8) return "High";
            return "Very High";
        }

        private List<string> GetDefaultAdviceByRiskLevel(string disease, double riskScore)
        {
            var riskLevel = GetRiskLevel(riskScore);

            return disease.ToLower() switch
            {
                "diabetes" when riskLevel == "Low" => new List<string>
                {
                    "Duy trì lối sống lành mạnh hiện tại",
                    "Kiểm tra đường huyết định kỳ",
                    "Tiếp tục khám sức khỏe tổng quát hàng năm",
                    "Giữ chế độ ăn uống cân bằng, kiểm soát khẩu phần"
                },
                "diabetes" when riskLevel == "Medium" => new List<string>
                {
                    "Theo dõi đường huyết 3 tháng một lần",
                    "Tăng cường hoạt động thể chất lên 150 phút/tuần",
                    "Giảm lượng đường tinh chế và thực phẩm chế biến sẵn",
                    "Tham khảo ý kiến chuyên gia dinh dưỡng để điều chỉnh chế độ ăn"
                },
                "diabetes" when riskLevel == "High" => new List<string>
                {
                    "Cần thăm khám ngay với bác sĩ nội tiết",
                    "Cân nhắc sử dụng thuốc điều trị theo chỉ định",
                    "Theo dõi đường huyết hàng ngày bằng máy đo tại nhà",
                    "Tham gia các lớp hướng dẫn quản lý bệnh tiểu đường"
                },

                "hypertension" when riskLevel == "Low" => new List<string>
                {
                    "Duy trì huyết áp ở mức ổn định hiện tại",
                    "Tiếp tục tập thể dục nhịp điệu đều đặn",
                    "Kiểm tra huyết áp hàng tháng",
                    "Giảm dần lượng muối trong khẩu phần ăn"
                },
                "hypertension" when riskLevel == "Medium" => new List<string>
                {
                    "Theo dõi huyết áp hàng tuần",
                    "Giảm lượng muối ăn xuống dưới 2.300mg/ngày",
                    "Bắt đầu hoặc tăng cường tập thể dục thường xuyên",
                    "Cân nhắc các chương trình điều chỉnh lối sống"
                },
                "hypertension" when riskLevel == "High" => new List<string>
                {
                    "Khám ngay với bác sĩ chuyên khoa tim mạch/huyết áp",
                    "Bắt đầu sử dụng thuốc hạ huyết áp theo đơn",
                    "Theo dõi huyết áp hàng ngày",
                    "Hạn chế muối nghiêm ngặt trong chế độ ăn"
                },

                "heart disease" when riskLevel == "Low" => new List<string>
                {
                    "Duy trì thể lực tim mạch hiện tại",
                    "Kiểm soát tốt chỉ số mỡ máu (cholesterol)",
                    "Tập thể dục 150 phút mỗi tuần",
                    "Tầm soát tim mạch định kỳ hàng năm"
                },
                "heart disease" when riskLevel == "Medium" => new List<string>
                {
                    "Xét nghiệm mỡ máu định kỳ mỗi quý",
                    "Tăng dần cường độ bài tập tim mạch",
                    "Giảm lượng chất béo bão hòa trong bữa ăn",
                    "Tham vấn bác sĩ tim mạch để có kế hoạch phòng ngừa"
                },
                "heart disease" when riskLevel == "High" => new List<string>
                {
                    "Cần khám gấp với bác sĩ chuyên khoa tim mạch",
                    "Cân nhắc các chẩn đoán hình ảnh (Điện tâm đồ, Siêu âm tim)",
                    "Bắt đầu sử dụng thuốc điều trị tim mạch nếu được kê đơn",
                    "Tham gia chương trình phục hồi chức năng tim mạch"
                },

                _ => new List<string>
                {
                    "Tham khảo ý kiến bác sĩ chuyên khoa",
                    "Duy trì lịch khám sức khỏe định kỳ",
                    "Tuân thủ lối sống lành mạnh",
                    "Cập nhật hồ sơ bệnh án thường xuyên"
                }
            };
        }

        private List<string> GetDefaultPrevention(string disease)
        {
            return disease.ToLower() switch
            {
                "diabetes" => new List<string>
                {
                    "Duy trì chỉ số BMI khỏe mạnh (18.5-24.9)",
                    "Tập thể dục 30 phút mỗi ngày",
                    "Tránh đồ uống có đường và thực phẩm chế biến sẵn",
                    "Theo dõi cân nặng thường xuyên",
                    "Ngủ đủ 7-8 tiếng mỗi đêm"
                },
                "hypertension" => new List<string>
                {
                    "Giữ huyết áp dưới 130/80 mmHg",
                    "Giới hạn lượng muối dưới 2.3g/ngày",
                    "Tập thể dục đều đặn (30 phút/ngày)",
                    "Quản lý căng thẳng (stress) hiệu quả",
                    "Tránh sử dụng quá nhiều rượu bia"
                },
                "heart disease" => new List<string>
                {
                    "Giữ cholesterol dưới 200 mg/dL",
                    "Không hút thuốc lá",
                    "Duy trì cân nặng hợp lý",
                    "Tập thể dục thường xuyên",
                    "Ăn chế độ tốt cho tim mạch (như chế độ ăn Địa Trung Hải)"
                },
                _ => new List<string>
                {
                    "Duy trì lối sống lành mạnh",
                    "Khám sức khỏe định kỳ",
                    "Dinh dưỡng cân bằng",
                    "Hoạt động thể chất thường xuyên",
                    "Quản lý căng thẳng tốt"
                }
            };
        }

        private List<string> GetDefaultLifestyleRecommendations()
        {
            return new List<string>
            {
                "Bắt đầu với 30 phút tập thể dục vừa phải, 5 ngày/tuần (đi bộ, bơi lội, đạp xe)",
                "Bổ sung nhiều rau xanh, ngũ cốc nguyên hạt và protein nạc vào chế độ ăn",
                "Giảm lượng muối bằng cách hạn chế đồ hộp và ưu tiên nấu ăn tại nhà",
                "Tập yoga, thiền hoặc hít thở sâu 10-15 phút mỗi ngày",
                "Duy trì lịch ngủ đều đặn (22h - 6h) đảm bảo 7-8 tiếng",
                "Cung cấp đủ nước cho cơ thể bằng cách uống 8-10 ly nước mỗi ngày",
                "Tham gia nhóm hỗ trợ sức khỏe hoặc tìm người cùng đồng hành",
                "Theo dõi dinh dưỡng và hoạt động hàng ngày qua các ứng dụng sức khỏe",
                "Hạn chế tiêu thụ caffeine và tuyệt đối tránh hút thuốc lá",
                "Lên lịch kiểm tra sức khỏe tổng quát mỗi 6 tháng"
            };
        }

        private string GenerateFinalRecommendation(string disease, string riskLevel, List<string> advice, List<string> prevention)
        {
            var topAdvice = advice.FirstOrDefault() ?? "Hãy tham khảo ý kiến bác sĩ chuyên khoa";
            var vnDisease = disease.ToLower() switch {
                "diabetes" => "Tiểu đường",
                "hypertension" => "Cao huyết áp",
                "heart disease" => "Bệnh tim mạch",
                "stroke" => "Đột quỵ",
                "kidney" => "Bệnh thận",
                "liver" => "Bệnh gan",
                _ => disease
            };
            
            return riskLevel switch
            {
                "Low" => $"Nguy cơ mắc {vnDisease} của bạn đang ở mức THẤP. {topAdvice} để tiếp tục bảo vệ sức khỏe.",
                "Medium" => $"Bạn có nguy cơ TRUNG BÌNH đối với {vnDisease}. {topAdvice} và nghiêm túc thực hiện các biện pháp phòng ngừa.",
                "High" => $"Bạn đang có nguy cơ CAO mắc {vnDisease}. {topAdvice} và lập tức thay đổi thói quen sinh hoạt.",
                "Very High" => $"CẢNH BÁO: Nguy cơ mắc {vnDisease} của bạn ở mức RẤT CAO. Vui lòng đến bệnh viện kiểm tra ngay lập tức và tuân thủ phác đồ điều trị.",
                _ => "Vui lòng tham khảo ý kiến chuyên gia y tế để có đánh giá chính xác nhất."
            };
        }
    }
}
