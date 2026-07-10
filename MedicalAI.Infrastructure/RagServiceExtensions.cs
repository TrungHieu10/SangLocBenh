using Microsoft.Extensions.DependencyInjection;
using MedicalAI.Infrastructure.Services;

namespace MedicalAI.Infrastructure
{
    /// <summary>
    /// Extension methods để đăng ký Neo4j RAG services
    /// </summary>
    public static class RagServiceExtensions
    {
        /// <summary>
        /// Thêm Neo4j + RAG Engine vào DI container
        /// 
        /// Usage trong Program.cs:
        /// services.AddNeo4jRagServices(
        ///     "neo4j+s://your-neo4j-instance.com",
        ///     "neo4j",
        ///     "your-password"
        /// );
        /// </summary>
        public static IServiceCollection AddNeo4jRagServices(
            this IServiceCollection services,
            string neo4jUri,
            string neo4jUsername,
            string neo4jPassword)
        {
            // Đăng ký Neo4j Service as Singleton
            services.AddSingleton<INeo4jService>(sp =>
                new Neo4jService(neo4jUri, neo4jUsername, neo4jPassword));

            // Đăng ký RAG Engine as Transient
            services.AddTransient<IRAGEngine, RAGEngine>();

            // Đăng ký Clinical Service with RAG as Transient
            services.AddTransient<IClinicalServiceWithRAG, ClinicalServiceWithRAG>();

            return services;
        }

        /// <summary>
        /// Khởi tạo Knowledge Graph (gọi sau khi app start)
        /// Usage: 
        /// var neo4jService = app.Services.GetRequiredService<INeo4jService>();
        /// await neo4jService.InitializeKnowledgeGraphAsync();
        /// </summary>
        public static async Task InitializeNeo4jKnowledgeGraphAsync(
            this IServiceProvider services)
        {
            try
            {
                var neo4jService = services.GetRequiredService<INeo4jService>();
                await neo4jService.InitializeKnowledgeGraphAsync();
                Console.WriteLine("✅ Neo4j Knowledge Graph initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error initializing Neo4j Knowledge Graph: {ex.Message}");
            }
        }
    }
}
