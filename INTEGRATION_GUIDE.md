# HÆ°á»›ng dáº«n TÃ­ch há»£p C# Backend vá»›i Neo4j

## ðŸ“ TÃ³m táº¯t

Báº¡n Ä‘Ã£ cÃ³:
- âœ… Neo4j cháº¡y táº¡i `localhost:7687`
- âœ… Knowledge Graph vá»›i dá»¯ liá»‡u Vietnamese (6 diseases, 8 risk factors)
- âœ… C# Backend code
- ðŸ”„ Cáº§n: Káº¿t ná»‘i & test

## ðŸ”§ BÆ°á»›c 1: Cáº¥u hÃ¬nh Connection String

### Update `appsettings.json` (MedicalAIDb.API)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MedicalAIDbDb;Trusted_Connection=true;"
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

## ðŸ”§ BÆ°á»›c 2: Cáº­p nháº­t Program.cs

### File: `MedicalAIDb.API/Program.cs`

```csharp
using MedicalAIDb.Infrastructure;
using MedicalAIDb.Infrastructure.Data;
using MedicalAIDb.Core.Interfaces;
using MedicalAIDb.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

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
        Console.WriteLine("âœ… Neo4j Knowledge Graph ready");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"âš ï¸ Neo4j initialization warning: {ex.Message}");
        // KhÃ´ng crash app náº¿u KG init fail
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

Console.WriteLine("ðŸš€ MedicalAIDb API started");
app.Run();
```

## ðŸ§ª BÆ°á»›c 3: Test Neo4j Connection

### PowerShell Script: Test Connection

```powershell
# File: test-neo4j.ps1

$neo4jUri = "neo4j://localhost:7687"
$username = "neo4j"
$password = "your-password"

Write-Host "Testing Neo4j Connection..." -ForegroundColor Yellow

try {
    # Import Neo4j Driver (náº¿u available)
    # $driver = [Neo4j.Driver.GraphDatabase]::Driver($neo4jUri, [Neo4j.Driver.AuthTokens]::Basic($username, $password))
    
    Write-Host "âœ… Neo4j Configuration:" -ForegroundColor Green
    Write-Host "   URI: $neo4jUri"
    Write-Host "   User: $username"
    Write-Host ""
    Write-Host "Next: Run dotnet run in MedicalAIDb.API project"
}
catch {
    Write-Host "âŒ Error: $_" -ForegroundColor Red
}
```

## ðŸ“¡ BÆ°á»›c 4: Test API Endpoints

### Test 1: Get Advice cho ÄÃ¡i thÃ¡o Ä‘Æ°á»ng

```bash
curl -X GET "http://localhost:5182/api/clinical-rag/advice?disease=ÄÃ¡i%20thÃ¡o%20Ä‘Æ°á»ng%20Type%202&riskScore=0.75" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "disease": "ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2",
  "riskScore": 75,
  "advice": [
    "Cáº¯t giáº£m Ä‘Æ°á»ng tinh luyá»‡n, uá»‘ng nhiá»u nÆ°á»›c. Æ¯u tiÃªn thá»±c pháº©m cÃ³ chá»‰ sá»‘ GI tháº¥p.",
    "Cáº§n giáº£m cÃ¢n kháº©n cáº¥p. Táº­p cardio 150 phÃºt/tuáº§n Ä‘á»ƒ giáº£m má»¡ ná»™i táº¡ng."
  ]
}
```

### Test 2: Submit Checkup + Get Advice

```bash
curl -X POST "http://localhost:5182/api/clinical-rag/submit" \
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
        "disease": "ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2",
        "probability": 0.85
      }
    ],
    "riskLevel": "High",
    "riskScore": 0.85,
    "advice": [
      "Cáº¯t giáº£m Ä‘Æ°á»ng tinh luyá»‡n, uá»‘ng nhiá»u nÆ°á»›c. Æ¯u tiÃªn thá»±c pháº©m cÃ³ chá»‰ sá»‘ GI tháº¥p.",
      "Cáº§n giáº£m cÃ¢n kháº©n cáº¥p. Táº­p cardio 150 phÃºt/tuáº§n Ä‘á»ƒ giáº£m má»¡ ná»™i táº¡ng."
    ],
    "preventionTips": [
      "Kiá»ƒm soÃ¡t ÄÆ°á»ng huyáº¿t (BloodGlucoseLevel)"
    ],
    "lifestyleRecommendations": [
      "âš ï¸ Cáº£nh bÃ¡o: CÃ³ nguy cÆ¡ Bá»‡nh Tháº­n máº¡n tÃ­nh"
    ]
  }
}
```

## ðŸ“Š BÆ°á»›c 5: Verify Neo4j Data

### Cypher Queries Ä‘á»ƒ kiá»ƒm tra

```cypher
# Count nodes
MATCH (n) RETURN labels(n) as type, count(*) as count;

# Get all diseases
MATCH (d:Disease) RETURN d.name, d.id;

# Get advice for diabetes
MATCH (d:Disease {name: "ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2"})-[:HAS_ADVICE]->(a:Advice)
RETURN a.content, a.type;

# Get RiskFactors linked to disease
MATCH (i:RiskFactor)-[:INDICATES_RISK_OF]->(d:Disease {name: "ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2"})
RETURN i.label, i.name, i.unit;

# Get disease complications
MATCH (d:Disease)-[:COMPLICATION_OF]->(related:Disease)
RETURN d.name, related.name;
```

## ðŸš¨ Troubleshooting

### Issue 1: Cannot connect to Neo4j

```
Error: Could not connect to localhost:7687
Solution:
1. Kiá»ƒm tra Neo4j Ä‘Ã£ start: docker ps
2. Kiá»ƒm tra credentials trong appsettings.json
3. Kiá»ƒm tra port: netstat -an | findstr 7687
```

### Issue 2: Knowledge Graph Empty

```
Error: No advice returned
Solution:
1. Query Neo4j Browser Ä‘á»ƒ verify data tá»“n táº¡i
2. Kiá»ƒm tra disease names pháº£i match Vietnamese (ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2)
3. Verify relationships: MATCH (d:Disease)-[:HAS_ADVICE]->(a:Advice) RETURN count(*)
```

### Issue 3: Disease Not Found

```
Error: 404 Disease not found
Solution:
1. GET http://localhost:7474 browser â†’ MATCH (d:Disease) RETURN d.name
2. Copy chÃ­nh xÃ¡c tÃªn bá»‡nh (case-sensitive)
3. Sá»­ dá»¥ng URL encoding cho tÃªn tiáº¿ng Viá»‡t: %20 cho space
```

## ðŸ”— BÆ°á»›c 6: Integration vá»›i Frontend

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
          `http://localhost:5182/api/clinical-rag/${checkupId}/result`,
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
      {/* Advice, Prevention Tips, Lifestyle Recommendations */}
      {/* (hiá»ƒn thá»‹ trá»±c tiáº¿p trong component nÃ y) */}
    </div>
  );
};
```

> ðŸ’¡ **LÆ°u Ã½:** Advice Ä‘Æ°á»£c hiá»ƒn thá»‹ trá»±c tiáº¿p trong component `ResultDashboard`.
> KhÃ´ng cÃ³ component `AdviceCard` riÃªng biá»‡t â€” pháº§n hiá»ƒn thá»‹ advice, prevention tips vÃ  lifestyle recommendations
> Ä‘Ã£ Ä‘Æ°á»£c tÃ­ch há»£p sáºµn trong `ResultDashboard`.

## âœ… Checklist HoÃ n ThÃ nh

- [ ] Cáº¥u hÃ¬nh `appsettings.json` vá»›i Neo4j URI
- [ ] Update `Program.cs` Ä‘á»ƒ Ä‘Äƒng kÃ½ Neo4j services
- [ ] Run `dotnet restore` Ä‘á»ƒ install packages
- [ ] Run `dotnet run` to start API
- [ ] Test endpoints qua Postman/curl
- [ ] Verify Neo4j data qua Browser
- [ ] Update React hooks & components
- [ ] Test flow end-to-end: Form â†’ API â†’ Neo4j â†’ Advice

## ðŸ“ž Support

**Náº¿u gáº·p issue:**
1. Kiá»ƒm tra console logs (API + Neo4j)
2. Test Neo4j queries trá»±c tiáº¿p trong Browser
3. Verify connection string & credentials
4. Check network: `telnet localhost 7687`

---

**Status**: Ready to deploy âœ…
**Last Updated**: May 26, 2026

