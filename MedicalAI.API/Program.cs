using MedicalAI.Infrastructure.Data;
using MedicalAI.Infrastructure;
using MedicalAI.Core.Interfaces;
using MedicalAI.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Đăng ký DbContext kết nối SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
    
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IClinicalService, ClinicalService>();
builder.Services.AddHttpClient<IOcrService, OpenRouterOcrService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ISignalRNotificationService, MedicalAI.API.Services.SignalRNotificationService>();
builder.Services.AddSignalR();

// NEO4J RAG SERVICES
if (builder.Configuration.GetValue<bool>("Neo4j:Enabled"))
{
    builder.Services.AddNeo4jRagServices(
        neo4jUri: builder.Configuration["Neo4j:Uri"],
        neo4jUsername: builder.Configuration["Neo4j:Username"],
        neo4jPassword: builder.Configuration["Neo4j:Password"]
    );
}

builder.Services.AddScoped<IClinicalServiceWithRAG, ClinicalServiceWithRAG>();
builder.Services.AddHttpClient<IAIPredictionClient, AIPredictionClient>(client =>
{
    var aiBaseUrl = builder.Configuration["AIPredictionServer:BaseUrl"] ?? "http://127.0.0.1:8000";
    client.BaseAddress = new Uri(aiBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});
// CORS
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
        ?? new[] { "http://localhost:5173", "https://medical-ai.me", "https://www.medical-ai.me" };
        
    options.AddPolicy("AllowAll", p =>
        p.WithOrigins(allowedOrigins)
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials());
});

var secretKey = builder.Configuration["JwtSettings:SecretKey"];
if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 16)
{
    throw new InvalidOperationException("JwtSettings:SecretKey is missing or too short. It must be at least 16 characters long.");
}

// CẤU HÌNH JWT BẢO MẬT 
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    
    // Cấu hình để SignalR có thể đọc token từ query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/api/notificationHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Medical AI API", Version = "v1" });

    // 1. Thêm định nghĩa cho nút Authorize (hiển thị giao diện)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"Nhập JWT token theo định dạng: Bearer [khoảng trắng] [chuỗi token]. Ví dụ: 'Bearer eyJhbGci...'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // 2. Ép Swagger phải đính kèm token này vào Header của mỗi request
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// Initialize Neo4j Knowledge Graph
using (var scope = app.Services.CreateScope())
{
    try
    {
        await scope.ServiceProvider.InitializeNeo4jKnowledgeGraphAsync();
        Console.WriteLine("✅ Neo4j Knowledge Graph initialized");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Neo4j initialization: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var env = app.Environment;
var uploadsFolder = Path.Combine(env.ContentRootPath, "wwwroot", "avatars");
if (!Directory.Exists(uploadsFolder))
{
    Directory.CreateDirectory(uploadsFolder);
}

app.UseCors("AllowAll");

app.UseStaticFiles(); // Serve default wwwroot if needed

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(Path.Combine(env.ContentRootPath, "wwwroot", "avatars")),
    RequestPath = "/avatars"
});
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();
app.MapHub<MedicalAI.API.Hubs.NotificationHub>("/api/notificationHub");

// Auto-migrate database for Docker
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MedicalAI.Infrastructure.Data.ApplicationDbContext>();
    var maxRetries = 5;
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            dbContext.Database.Migrate();
            Console.WriteLine("✅ SQL Database Migrated successfully.");
            break;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Database Migration attempt {i + 1} failed: {ex.Message}");
            if (i == maxRetries - 1) throw; // Throw on final attempt
            System.Threading.Thread.Sleep(5000); // Wait 5 seconds before retry
        }
    }
}

app.Run();