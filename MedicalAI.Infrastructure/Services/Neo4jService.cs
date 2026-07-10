using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalAI.Infrastructure.Services
{
    /// <summary>
    /// Neo4j Service - Quản lý kết nối và query đến Neo4j database
    /// Knowledge Graph chứa: Disease -> Symptoms -> Risk Factors -> Recommendations
    /// </summary>
    public interface INeo4jService : IAsyncDisposable
    {
        Task<List<string>> GetAdviceByRiskLevelAsync(string disease, double riskScore);
        Task<List<string>> GetPreventionTipsAsync(string disease);
        Task<List<string>> GetLifestyleRecommendationsAsync(List<string> riskFactors);
        Task InitializeKnowledgeGraphAsync();
    }

    public class Neo4jService : INeo4jService, IAsyncDisposable
    {
        private readonly IDriver _driver;

        public Neo4jService(string uri, string username, string password)
        {
            _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
        }

        /// <summary>
        /// Lấy lời khuyên dựa trên chỉ số y tế có giá trị cao
        /// Query: Indicator -[:INDICATES_RISK_OF]-> Disease -[:HAS_ADVICE_FOR]-> Advice
        /// </summary>
        public async Task<List<string>> GetAdviceByRiskLevelAsync(string disease, double riskScore)
        {
            try
            {
                using var session = _driver.AsyncSession();
                // Tìm disease theo tên Vietnamese
                var query = @"
                    MATCH (d:Disease {name: $disease})
                    MATCH (d)-[:HAS_ADVICE]->(a:Advice)
                    RETURN DISTINCT a.content as advice
                    LIMIT 5
                ";

                var result = await session.RunAsync(query, new { disease });
                var records = await result.ToListAsync();

                return records.Select(r => r["advice"].As<string>()).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Neo4j Error: {ex.Message}");
                return new List<string>();
            }
        }

        /// <summary>
        /// Lấy các chỉ số liên quan đến bệnh
        /// </summary>
        public async Task<List<string>> GetPreventionTipsAsync(string disease)
        {
            try
            {
                using var session = _driver.AsyncSession();
                // Tìm các Indicator liên quan tới bệnh
                var query = @"
                    MATCH (i:Indicator)-[:INDICATES_RISK_OF]->(d:Disease {name: $disease})
                    RETURN DISTINCT i.label as indicator, i.name as indicatorName
                    LIMIT 10
                ";

                var result = await session.RunAsync(query, new { disease });
                var records = await result.ToListAsync();

                return records.Select(r => 
                    $"Kiểm soát {r["indicator"].As<string>()} ({r["indicatorName"].As<string>()})"
                ).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Neo4j Error: {ex.Message}");
                return new List<string>();
            }
        }

        /// <summary>
        /// Lấy các bệnh liên quan (complications)
        /// </summary>
        public async Task<List<string>> GetLifestyleRecommendationsAsync(List<string> riskFactors)
        {
            try
            {
                using var session = _driver.AsyncSession();
                // Tìm lifestyle recommendations theo risk factors
                var query = @"
                    MATCH (rf:RiskFactor)-[:HAS_LIFESTYLE_RECOMMENDATION]->(ls:LifestyleRecommendation)
                    WHERE rf.name IN $riskFactors
                    RETURN DISTINCT ls.content AS content, ls.category AS category, ls.difficulty AS difficulty
                    LIMIT 10
                ";

                var result = await session.RunAsync(query, new { riskFactors });
                var records = await result.ToListAsync();

                return records.Select(r => 
                    r["content"].As<string>()
                ).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Neo4j Error: {ex.Message}");
                return new List<string>();
            }
        }

        /// <summary>
        /// Khởi tạo Knowledge Graph với dữ liệu cơ bản
        /// </summary>
        public async Task InitializeKnowledgeGraphAsync()
        {
            try
            {
                using var session = _driver.AsyncSession();

                // Tạo Constraints
                await session.RunAsync("CREATE CONSTRAINT IF NOT EXISTS FOR (d:Disease) REQUIRE d.name IS UNIQUE");
                await session.RunAsync("CREATE CONSTRAINT IF NOT EXISTS FOR (rf:RiskFactor) REQUIRE rf.name IS UNIQUE");
                await session.RunAsync("CREATE CONSTRAINT IF NOT EXISTS FOR (i:Indicator) REQUIRE i.label IS UNIQUE");

                // Check if data already exists
                var checkResult = await session.RunAsync("MATCH (d:Disease) RETURN count(d) as count");
                var record = await checkResult.SingleAsync();
                var count = record["count"].As<int>();
                if (count > 0)
                {
                    Console.WriteLine("Neo4j knowledge graph already initialized, skipping.");
                    return;
                }

                // Xóa dữ liệu cũ (first time setup cleanup)
                await session.RunAsync("MATCH (n) DETACH DELETE n");

                // Tạo Diseases
                await CreateDiseasesAsync(session);

                // Tạo Risk Factors
                await CreateRiskFactorsAsync(session);

                // Tạo Advice
                await CreateAdviceAsync(session);

                // Tạo Prevention Tips
                await CreatePreventionTipsAsync(session);

                // Tạo Lifestyle Recommendations
                await CreateLifestyleRecommendationsAsync(session);

                // Tạo quan hệ
                await CreateRelationshipsAsync(session);

                Console.WriteLine("Knowledge Graph initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing knowledge graph: {ex.Message}");
            }
        }

        private async Task CreateDiseasesAsync(IAsyncSession session)
        {
            var query = @"
                CREATE 
                (d1:Disease {name: 'Diabetes', description: 'Blood sugar disorder', icd10: 'E11'}),
                (d2:Disease {name: 'Hypertension', description: 'High blood pressure', icd10: 'I10'}),
                (d3:Disease {name: 'Heart Disease', description: 'Cardiovascular disorder', icd10: 'I25'}),
                (d4:Disease {name: 'Obesity', description: 'Excess body weight', icd10: 'E66'}),
                (d5:Disease {name: 'Stroke', description: 'Cerebrovascular accident', icd10: 'I63'})
            ";
            await session.RunAsync(query);
        }

        private async Task CreateRiskFactorsAsync(IAsyncSession session)
        {
            var query = @"
                CREATE
                (rf1:RiskFactor {name: 'High Blood Glucose', category: 'metabolic'}),
                (rf2:RiskFactor {name: 'High Blood Pressure', category: 'cardiovascular'}),
                (rf3:RiskFactor {name: 'High Cholesterol', category: 'metabolic'}),
                (rf4:RiskFactor {name: 'Smoking', category: 'lifestyle'}),
                (rf5:RiskFactor {name: 'Obesity', category: 'metabolic'}),
                (rf6:RiskFactor {name: 'Sedentary Lifestyle', category: 'lifestyle'}),
                (rf7:RiskFactor {name: 'Alcohol Abuse', category: 'lifestyle'}),
                (rf8:RiskFactor {name: 'High Stress', category: 'psychological'})
            ";
            await session.RunAsync(query);
        }

        private async Task CreateAdviceAsync(IAsyncSession session)
        {
            var query = @"
                CREATE
                (a1:Advice {content: 'Monitor blood glucose levels regularly (3-6 months)', minRisk: 0.3, maxRisk: 0.6, priority: 1}),
                (a2:Advice {content: 'Consult an endocrinologist for personalized diabetes management', minRisk: 0.6, maxRisk: 1.0, priority: 1}),
                (a3:Advice {content: 'Start a low-sodium diet to control blood pressure', minRisk: 0.3, maxRisk: 1.0, priority: 1}),
                (a4:Advice {content: 'Take antihypertensive medications as prescribed', minRisk: 0.6, maxRisk: 1.0, priority: 1}),
                (a5:Advice {content: 'Get blood lipid panel done quarterly', minRisk: 0.5, maxRisk: 1.0, priority: 2}),
                (a6:Advice {content: 'Consider cardiac screening with your physician', minRisk: 0.7, maxRisk: 1.0, priority: 1}),
                (a7:Advice {content: 'Work on weight loss with a balanced diet', minRisk: 0.4, maxRisk: 1.0, priority: 1}),
                (a8:Advice {content: 'Maintain daily exercise routine for cardiovascular health', minRisk: 0.0, maxRisk: 1.0, priority: 2}),
                (a9:Advice {content: 'Quit smoking to significantly reduce health risks', minRisk: 0.5, maxRisk: 1.0, priority: 1}),
                (a10:Advice {content: 'Practice stress management techniques like meditation', minRisk: 0.3, maxRisk: 1.0, priority: 2})
            ";
            await session.RunAsync(query);
        }

        private async Task CreatePreventionTipsAsync(IAsyncSession session)
        {
            var query = @"
                CREATE
                (p1:Prevention {content: 'Maintain fasting glucose below 126 mg/dL', priority: 1}),
                (p2:Prevention {content: 'Keep blood pressure below 130/80 mmHg', priority: 1}),
                (p3:Prevention {content: 'Maintain total cholesterol below 200 mg/dL', priority: 1}),
                (p4:Prevention {content: 'Achieve and maintain healthy BMI (18.5-24.9)', priority: 1}),
                (p5:Prevention {content: 'Avoid processed foods and sugary drinks', priority: 2}),
                (p6:Prevention {content: 'Get 7-9 hours of quality sleep daily', priority: 2}),
                (p7:Prevention {content: 'Exercise at least 150 minutes per week', priority: 1}),
                (p8:Prevention {content: 'Reduce salt intake to less than 2.3g/day', priority: 2}),
                (p9:Prevention {content: 'Avoid smoking and secondhand smoke', priority: 1}),
                (p10:Prevention {content: 'Limit alcohol consumption', priority: 2})
            ";
            await session.RunAsync(query);
        }

        private async Task CreateLifestyleRecommendationsAsync(IAsyncSession session)
        {
            var query = @"
                CREATE
                (lr1:LifestyleRecommendation {content: 'Start with 30 minutes of moderate exercise, 5 days a week'}),
                (lr2:LifestyleRecommendation {content: 'Incorporate more vegetables and whole grains into meals'}),
                (lr3:LifestyleRecommendation {content: 'Reduce sodium intake by avoiding processed foods'}),
                (lr4:LifestyleRecommendation {content: 'Practice yoga or meditation for stress relief'}),
                (lr5:LifestyleRecommendation {content: 'Maintain consistent sleep schedule (10 PM - 6 AM)'}),
                (lr6:LifestyleRecommendation {content: 'Stay hydrated by drinking 8 glasses of water daily'}),
                (lr7:LifestyleRecommendation {content: 'Join a support group for lifestyle changes'}),
                (lr8:LifestyleRecommendation {content: 'Track daily nutrition and activity with a health app'})
            ";
            await session.RunAsync(query);
        }

        private async Task CreateRelationshipsAsync(IAsyncSession session)
        {
            var queries = new List<string>
            {
                "MATCH (d:Disease {name: 'Diabetes'}), (a:Advice) WHERE a.content CONTAINS 'glucose' OR a.content CONTAINS 'endocrinologist' CREATE (d)-[:HAS_ADVICE]->(a)",
                "MATCH (d:Disease {name: 'Hypertension'}), (a:Advice) WHERE a.content CONTAINS 'blood pressure' OR a.content CONTAINS 'antihypertensive' CREATE (d)-[:HAS_ADVICE]->(a)",
                "MATCH (d:Disease {name: 'Heart Disease'}), (a:Advice) WHERE a.content CONTAINS 'cardiac' OR a.content CONTAINS 'lipid' CREATE (d)-[:HAS_ADVICE]->(a)",
                "MATCH (d:Disease {name: 'Diabetes'}), (p:Prevention) WHERE p.content CONTAINS 'glucose' OR p.content CONTAINS 'exercise' CREATE (d)-[:HAS_PREVENTION]->(p)",
                "MATCH (d:Disease {name: 'Hypertension'}), (p:Prevention) WHERE p.content CONTAINS 'blood pressure' OR p.content CONTAINS 'salt' CREATE (d)-[:HAS_PREVENTION]->(p)",
                "MATCH (rf:RiskFactor {name: 'Sedentary Lifestyle'}), (lr:LifestyleRecommendation) WHERE lr.content CONTAINS 'exercise' CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(lr)",
                "MATCH (rf:RiskFactor {name: 'Obesity'}), (lr:LifestyleRecommendation) WHERE lr.content CONTAINS 'vegetables' OR lr.content CONTAINS 'exercise' CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(lr)",
                "MATCH (rf:RiskFactor {name: 'High Stress'}), (lr:LifestyleRecommendation) WHERE lr.content CONTAINS 'meditation' OR lr.content CONTAINS 'sleep' CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(lr)",
                "MATCH (rf:RiskFactor {name: 'Smoking'}), (lr:LifestyleRecommendation) WHERE lr.content CONTAINS 'support group' CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(lr)"
            };

            foreach (var q in queries)
            {
                await session.RunAsync(q);
            }
        }

        public async ValueTask DisposeAsync()
        {
            if (_driver != null) await _driver.DisposeAsync(); 
        }
    }
}
