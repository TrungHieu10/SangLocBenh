using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MedicalAI.Core.DTOs;
using MedicalAI.Core.Interfaces;
using MedicalAI.Infrastructure.Services;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MedicalAI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClinicalRAGController : ControllerBase
    {
        private readonly IClinicalServiceWithRAG _clinicalService;
        private readonly IRAGEngine _ragEngine;

        public ClinicalRAGController(
            IClinicalServiceWithRAG clinicalService,
            IRAGEngine ragEngine)
        {
            _clinicalService = clinicalService;
            _ragEngine = ragEngine;
        }

        /// <summary>
        /// Submit checkup mới + nhận dự đoán + sinh advice từ RAG
        /// POST /api/clinical-rag/submit
        /// </summary>
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitCheckup([FromBody] AIPredictionRequestDTO request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                             ?? User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin định danh người dùng" });
                }
                string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Patient";
                             
                var result = await _clinicalService.SubmitCheckupWithAdviceAsync(request, userId, userRole);

                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Lưu kết quả khám thành công"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống khi lưu kết quả. " + ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy kết quả dự đoán + lời khuyên từ RAG
        /// GET /api/clinical-rag/{checkupId}/result
        /// </summary>
        [HttpGet("{checkupId}/result")]
        public async Task<IActionResult> GetPredictionWithAdvice(long checkupId) 
        {
            try
            {
                string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                             ?? User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin định danh người dùng" });
                }
                string userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Patient";

                var result = await _clinicalService.GetPredictionWithAdviceAsync(checkupId, userId, userRole);

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống khi tải kết quả dự đoán. " + ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy advice cho một bệnh cụ thể
        /// GET /api/clinical-rag/advice?disease=Diabetes&riskScore=0.75
        /// </summary>
        [HttpGet("advice")]
        public async Task<IActionResult> GetAdviceByDisease([FromQuery] string disease, [FromQuery] double riskScore)
        {
            try
            {
                if (string.IsNullOrEmpty(disease))
                    return BadRequest("Tên bệnh là bắt buộc");

                var advice = await _ragEngine.GenerateAdviceAsync(disease, riskScore);

                return Ok(new
                {
                    success = true,
                    disease = disease,
                    riskScore = Math.Round(riskScore * 100, 2),
                    advice = advice
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống khi tạo lời khuyên. Vui lòng thử lại sau."
                });
            }
        }

        /// <summary>
        /// Lấy mẹo phòng chống bệnh
        /// GET /api/clinical-rag/prevention?disease=Diabetes
        /// </summary>
        [HttpGet("prevention")]
        public async Task<IActionResult> GetPreventionTips([FromQuery] string disease)
        {
            try
            {
                if (string.IsNullOrEmpty(disease))
                    return BadRequest("Tên bệnh là bắt buộc");

                var prevention = await _ragEngine.GeneratePreventionAsync(disease);

                return Ok(new
                {
                    success = true,
                    disease = disease,
                    prevention = prevention
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống khi tải mẹo phòng ngừa. Vui lòng thử lại sau."
                });
            }
        }

        /// <summary>
        /// Lấy khuyến nghị lối sống dựa trên yếu tố nguy hiểm
        /// POST /api/clinical-rag/lifestyle-recommendations
        /// </summary>
        [HttpPost("lifestyle-recommendations")]
        public async Task<IActionResult> GetLifestyleRecommendations([FromBody] List<string> riskFactors)
        {
            try
            {
                if (riskFactors == null || !riskFactors.Any())
                    return BadRequest("Yếu tố nguy cơ là bắt buộc");

                var recommendations = await _ragEngine.GenerateLifestyleRecommendationsAsync(riskFactors);

                return Ok(new
                {
                    success = true,
                    riskFactors = riskFactors,
                    recommendations = recommendations
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống khi tải khuyến nghị. Vui lòng thử lại sau."
                });
            }
        }

        /// <summary>
        /// Sinh lời khuyên chi tiết với ngữ cảnh
        /// GET /api/clinical-rag/augmented-advice?disease=Diabetes&riskScore=0.75
        /// </summary>
        [HttpGet("augmented-advice")]
        public async Task<IActionResult> GetAugmentedAdvice([FromQuery] string disease, [FromQuery] double riskScore)
        {
            try
            {
                if (string.IsNullOrEmpty(disease))
                    return BadRequest("Tên bệnh là bắt buộc");

                var advice = await _ragEngine.AugmentAdviceWithContextAsync(disease, riskScore);

                return Ok(new
                {
                    success = true,
                    disease = disease,
                    riskScore = Math.Round(riskScore * 100, 2),
                    augmentedAdvice = advice
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống khi tải lời khuyên. Vui lòng thử lại sau."
                });
            }
        }
    }
}