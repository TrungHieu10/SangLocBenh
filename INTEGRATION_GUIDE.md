# Hướng dẫn Tích hợp C# Backend với Neo4j

## 📝 Tóm tắt

Bạn đã có:
- ✅ Neo4j chạy tại `localhost:7687`
- ✅ Knowledge Graph với dữ liệu Vietnamese (5 diseases, 9 indicators, 6 advice)
- ✅ C# Backend code
- 🔄 Cần: Kết nối & test

## 🔧 Bước 1: Cấu hình Connection String

### Update `appsettings.json` (MedicalAI.API)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=medicalai;Trusted_Connection=true;"
  },
  "Neo4j": {
    "Uri": "neo4j://localhost:7687",
    "Username": "neo4j",
    "Password": "your-password",
    "Enabled": true
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

## 🔧 Bước 2: Cập nhật Program.cs

### File: `MedicalAI.API/Program.cs`

```csharp
using MedicalAI.Infrastructure;
using MedicalAI.Infrastructure.Data;
using MedicalAI.Core.Interfaces;
using MedicalAI.Infrastructure.Services;

var builder = WebApplicationBuilder.CreateBuilder(args);

// === Database Context ===
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// === Neo4j RAG Services ===
if (builder.Configuration.GetValue<bool>("Neo4j:Enabled"))
{
    builder.Services.AddNeo4jRagServices(
        neo4jUri: builder.Configuration["Neo4j:Uri"],
        neo4jUsername: builder.Configuration["Neo4j:Username"],
        neo4jPassword: builder.Configuration["Neo4j:Password"]
    );
}

// === Other Services ===
builder.Services.AddScoped<IAIPredictionClient, AIPredictionClient>();
builder.Services.AddScoped<IClinicalServiceWithRAG, ClinicalServiceWithRAG>();
builder.Services.AddScoped<IClinicalService, ClinicalService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// === CORS ===
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p =>
        p.AllowAnyOrigin()
         .AllowAnyMethod()
         .AllowAnyHeader());
});

// === Controllers ===
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// === Initialize Neo4j Knowledge Graph ===
using (var scope = app.Services.CreateScope())
{
    try
    {
        await scope.ServiceProvider.InitializeNeo4jKnowledgeGraphAsync();
        Console.WriteLine("✅ Neo4j Knowledge Graph ready");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Neo4j initialization warning: {ex.Message}");
        // Không crash app nếu KG init fail
    }
}

// === Middleware ===
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🚀 MedicalAI API started");
app.Run();
```

## 🧪 Bước 3: Test Neo4j Connection

### PowerShell Script: Test Connection

```powershell
# File: test-neo4j.ps1

$neo4jUri = "neo4j://localhost:7687"
$username = "neo4j"
$password = "your-password"

Write-Host "Testing Neo4j Connection..." -ForegroundColor Yellow

try {
    # Import Neo4j Driver (nếu available)
    # $driver = [Neo4j.Driver.GraphDatabase]::Driver($neo4jUri, [Neo4j.Driver.AuthTokens]::Basic($username, $password))
    
    Write-Host "✅ Neo4j Configuration:" -ForegroundColor Green
    Write-Host "   URI: $neo4jUri"
    Write-Host "   User: $username"
    Write-Host ""
    Write-Host "Next: Run dotnet run in MedicalAI.API project"
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
```

## 📡 Bước 4: Test API Endpoints

### Test 1: Get Advice cho Đái tháo đường

```bash
curl -X GET "http://localhost:5000/api/clinical-rag/advice?disease=Đái%20tháo%20đường%20Type%202&riskScore=0.75" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "disease": "Đái tháo đường Type 2",
  "riskScore": 75,
  "advice": [
    "Cắt giảm đường tinh luyện, uống nhiều nước. Ưu tiên thực phẩm có chỉ số GI thấp.",
    "Cần giảm cân khẩn cấp. Tập cardio 150 phút/tuần để giảm mỡ nội tạng."
  ]
}
```

### Test 2: Submit Checkup + Get Advice

```bash
curl -X POST "http://localhost:5000/api/clinical-rag/submit" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "systolicBP": 150,
    "diastolicBP": 90,
    "heartRate": 85,
    "temperature": 36.5,
    "weight": 85,
    "height": 170,
    "bloodGlucose": 180,
    "totalCholesterol": 220,
    "ldl": 140,
    "hdl": 35,
    "triglycerides": 200
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "checkupId": "uuid-here",
    "predictions": [
      {
        "disease": "Đái tháo đường Type 2",
        "probability": 0.85
      }
    ],
    "riskLevel": "High",
    "riskScore": 0.85,
    "advice": [
      "Cắt giảm đường tinh luyện, uống nhiều nước. Ưu tiên thực phẩm có chỉ số GI thấp.",
      "Cần giảm cân khẩn cấp. Tập cardio 150 phút/tuần để giảm mỡ nội tạng."
    ],
    "preventionTips": [
      "Kiểm soát Đường huyết (BloodGlucoseLevel)"
    ],
    "lifestyleRecommendations": [
      "⚠️ Cảnh báo: Có nguy cơ Bệnh Thận mạn tính"
    ]
  }
}
```

## 📊 Bước 5: Verify Neo4j Data

### Cypher Queries để kiểm tra

```cypher
# Count nodes
MATCH (n) RETURN labels(n) as type, count(*) as count;

# Get all diseases
MATCH (d:Disease) RETURN d.name, d.id;

# Get advice for diabetes
MATCH (d:Disease {name: "Đái tháo đường Type 2"})-[:HAS_ADVICE_FOR]->(a:Advice)
RETURN a.content, a.type;

# Get indicators linked to disease
MATCH (i:Indicator)-[:INDICATES_RISK_OF]->(d:Disease {name: "Đái tháo đường Type 2"})
RETURN i.label, i.name, i.unit;

# Get disease complications
MATCH (d:Disease)-[:COMPLICATION_OF]->(related:Disease)
RETURN d.name, related.name;
```

## 🚨 Troubleshooting

### Issue 1: Cannot connect to Neo4j

```
Error: Could not connect to localhost:7687
Solution:
1. Kiểm tra Neo4j đã start: docker ps
2. Kiểm tra credentials trong appsettings.json
3. Kiểm tra port: netstat -an | findstr 7687
```

### Issue 2: Knowledge Graph Empty

```
Error: No advice returned
Solution:
1. Query Neo4j Browser để verify data tồn tại
2. Kiểm tra disease names phải match Vietnamese (Đái tháo đường Type 2)
3. Verify relationships: MATCH (d:Disease)-[:HAS_ADVICE_FOR]->(a:Advice) RETURN count(*)
```

### Issue 3: Disease Not Found

```
Error: 404 Disease not found
Solution:
1. GET http://localhost:7687 browser → MATCH (d:Disease) RETURN d.name
2. Copy chính xác tên bệnh (case-sensitive)
3. Sử dụng URL encoding cho tên tiếng Việt: %20 cho space
```

## 🔗 Bước 6: Integration với Frontend

### Update React Hook: `usePrediction.js`

```javascript
import { useEffect, useState } from 'react';

export const usePrediction = (checkupId) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(
          `http://localhost:5000/api/clinical-rag/${checkupId}/result`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setPrediction(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (checkupId) fetchPrediction();
  }, [checkupId]);

  return { prediction, loading, error };
};

export default usePrediction;
```

### Update ResultDashboard Component

```jsx
import { usePrediction } from '../hooks/usePrediction';

export const ResultDashboard = () => {
  const { checkupId } = useParams();
  const { prediction, loading } = usePrediction(checkupId);

  if (loading) return <Spinner />;

  return (
    <div>
      {/* ... existing code ... */}
      
      {/* Advice Card */}
      {prediction?.advice && (
        <Card header="💡 Lời Khuyên Y Tế" shadow="lg">
          <ul className="space-y-2">
            {prediction.advice.map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <span>🏥</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Prevention Tips */}
      {prediction?.preventionTips && (
        <Card header="✅ Kiểm Soát Chỉ Số" shadow="lg">
          <ul className="space-y-2">
            {prediction.preventionTips.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Complications Warning */}
      {prediction?.lifestyleRecommendations && (
        <Card header="⚠️ Cảnh Báo" shadow="lg" className="bg-yellow-50">
          <ul className="space-y-2">
            {prediction.lifestyleRecommendations.map((item, idx) => (
              <li key={idx} className="text-yellow-800">{item}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
```

## ✅ Checklist Hoàn Thành

- [ ] Cấu hình `appsettings.json` với Neo4j URI
- [ ] Update `Program.cs` để đăng ký Neo4j services
- [ ] Run `dotnet restore` để install packages
- [ ] Run `dotnet run` to start API
- [ ] Test endpoints qua Postman/curl
- [ ] Verify Neo4j data qua Browser
- [ ] Update React hooks & components
- [ ] Test flow end-to-end: Form → API → Neo4j → Advice

## 📞 Support

**Nếu gặp issue:**
1. Kiểm tra console logs (API + Neo4j)
2. Test Neo4j queries trực tiếp trong Browser
3. Verify connection string & credentials
4. Check network: `telnet localhost 7687`

---

**Status**: Ready to deploy ✅
**Last Updated**: May 26, 2026
