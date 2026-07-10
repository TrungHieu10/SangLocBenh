# ðŸš€ QUICK START: Neo4j + C# Backend Integration

> ðŸ’¡ **LÆ°u Ã½ vá» Port**: Khi cháº¡y local (`dotnet run`), API sá»­ dá»¥ng port **5182**. Khi cháº¡y qua Docker, API sá»­ dá»¥ng port **5000**.

## â±ï¸ BÆ°á»›c 1: Configuration (2 phÃºt)

### 1.1 Má»Ÿ file `appsettings.json`

**Path**: `d:\DATN\MedicalAIDb.API\appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MedicalAIDbDb;Trusted_Connection=true;"
  },
  "Neo4j": {
    "Uri": "neo4j://localhost:7687",
    "Username": "neo4j",
    "Password": "password",
    "Enabled": true
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

ðŸ’¡ **Quan trá»ng**: Thay `password` báº±ng password cá»§a Neo4j instance cá»§a báº¡n

## â±ï¸ BÆ°á»›c 2: Khá»Ÿi Ä‘á»™ng API (3 phÃºt)

### 2.1 Má»Ÿ PowerShell

```powershell
cd d:\DATN\MedicalAIDb.API
dotnet restore      # Download packages
dotnet run          # Start API
```

âœ… Khi tháº¥y `Now listening on: http://localhost:5182` â†’ Success! (hoáº·c `:5000` náº¿u cháº¡y qua Docker)

### 2.2 Kiá»ƒm tra Swagger

Browser: `http://localhost:5182/swagger/index.html` (hoáº·c port 5000 náº¿u dÃ¹ng Docker)

Pháº£i tháº¥y danh sÃ¡ch endpoints:
- `POST /api/clinical-rag/submit`
- `GET /api/clinical-rag/advice`
- etc.

## â±ï¸ BÆ°á»›c 3: Láº¥y JWT Token (2 phÃºt)

### 3.1 Login Ä‘á»ƒ láº¥y token

**PowerShell:**
```powershell
$body = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5182/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body | ConvertFrom-Json
```

Hoáº·c **cURL:**
```bash
curl -X POST http://localhost:5182/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

âœ… Copy token tá»« response: `{"token": "eyJhbGciOi..."}`

## â±ï¸ BÆ°á»›c 4: Test Endpoints (5 phÃºt)

### 4.1 Test 1: Get Advice

**PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

Invoke-WebRequest -Uri "http://localhost:5182/api/clinical-rag/advice?disease=ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2&riskScore=0.75" `
    -Headers $headers | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

âœ… Pháº£i nháº­n response:
```json
{
  "success": true,
  "advice": [
    "Cáº¯t giáº£m Ä‘Æ°á»ng tinh luyá»‡n, uá»‘ng nhiá»u nÆ°á»›c...",
    "Cáº§n giáº£m cÃ¢n kháº©n cáº¥p..."
  ]
}
```

### 4.2 Test 2: Submit Checkup

**PowerShell:**
```powershell
$body = @{
    age = 45
    systolicBP = 150
    diastolicBP = 90
    heartRate = 85
    temperature = 36.5
    weight = 85
    height = 170
    bloodGlucose = 180
    totalCholesterol = 220
    ldl = 140
    hdl = 35
    triglycerides = 200
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5182/api/clinical-rag/submit" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

âœ… Response pháº£i chá»©a:
- `checkupId`
- `predictions` (list diseases)
- `advice` (from Neo4j)
- `riskLevel`

### 4.3 Test 3: Get Result

**PowerShell:**
```powershell
# Láº¥y checkupId tá»« bÆ°á»›c trÆ°á»›c
$checkupId = "uuid-from-previous-response"

$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

Invoke-WebRequest -Uri "http://localhost:5182/api/clinical-rag/$checkupId/result" `
    -Headers $headers | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## â±ï¸ BÆ°á»›c 5: Kiá»ƒm tra Neo4j Data (2 phÃºt)

### 5.1 Neo4j Browser

Browser: `http://localhost:7474`

Login: `neo4j` / `password`

### 5.2 Cháº¡y Queries

**Query 1: Count Nodes**
```cypher
MATCH (n) RETURN labels(n) as type, count(*) as count;
```

Ká»³ vá»ng:
- Disease: 6
- RiskFactor: 8
- Advice: 6
- Total: 20

**Query 2: Get Advice cho Diabetes**
```cypher
MATCH (d:Disease {name: "ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2"})-[:HAS_ADVICE]->(a:Advice)
RETURN a.content;
```

Ká»³ vá»ng: 2 advice nodes

**Query 3: Get Risk Factors**
```cypher
MATCH (rf:RiskFactor)-[:INDICATES_RISK_OF]->(d:Disease {name: "ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2"})
RETURN rf.label, rf.name;
```

Ká»³ vá»ng: 2 risk factors (BloodGlucoseLevel, HbA1c)

## âœ… Troubleshooting

### âŒ Error: "Cannot connect to Neo4j"
```
Solution:
1. Kiá»ƒm tra Neo4j running: docker ps
2. Kiá»ƒm tra port: netstat -an | findstr 7687
3. Verify credentials trong appsettings.json
```

### âŒ Error: "No advice returned"
```
Solution:
1. Neo4j Browser â†’ kiá»ƒm tra diseases tá»“n táº¡i
2. Disease names pháº£i match: "ÄÃ¡i thÃ¡o Ä‘Æ°á»ng Type 2" (case-sensitive)
3. Query: MATCH (d:Disease)-[:HAS_ADVICE]->(a:Advice) RETURN count(*)
```

### âŒ Error: "401 Unauthorized"
```
Solution:
1. Äáº£m báº£o token Ä‘Æ°á»£c add vÃ o Authorization header
2. Token format: "Bearer YOUR_TOKEN_HERE"
3. Token cÃ³ thá»ƒ háº¿t háº¡n â†’ re-login
```

### âŒ Error: "500 Internal Server Error"
```
Solution:
1. Kiá»ƒm tra console logs trong PowerShell
2. Verify database connection string
3. Ensure database "MedicalAIDbDb" exists
```

## ðŸ“Š Expected Workflow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   1. Khá»Ÿi Ä‘á»™ng API (dotnet run)    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   2. Login â†’ Láº¥y JWT Token          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   3. Call /api/clinical-rag/submit  â”‚
â”‚      (submit health data)           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚ C# API         â”‚
        â”‚ - Call Python  â”‚
        â”‚   AI model     â”‚
        â”‚ - Query Neo4j  â”‚
        â”‚   for advice   â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   4. Receive Response               â”‚
â”‚   - AI Predictions                  â”‚
â”‚   - Neo4j Advice                    â”‚
â”‚   - Risk Level                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   5. Frontend Display               â”‚
â”‚   - ResultDashboard component       â”‚
â”‚   - Advice display                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## ðŸŽ¯ Next Steps

âœ… BÆ°á»›c 1: Configuration
âœ… BÆ°á»›c 2: Run API
âœ… BÆ°á»›c 3: Get Token
âœ… BÆ°á»›c 4: Test Endpoints
âœ… BÆ°á»›c 5: Verify Neo4j

ðŸ”„ BÆ°á»›c 6 (Frontend): 
- Update `usePrediction` hook
- Update `ResultDashboard` component
- Test end-to-end

## ðŸ“‹ Checklist

- [ ] `appsettings.json` configured
- [ ] API started successfully
- [ ] Swagger page loads
- [ ] JWT token obtained
- [ ] /advice endpoint returns data
- [ ] /submit endpoint works
- [ ] /result endpoint returns predictions + advice
- [ ] Neo4j Browser shows 20 nodes
- [ ] Cypher queries return expected results
- [ ] Ready for frontend integration

---

**Status**: ðŸš€ Ready to integrate with frontend!

**If stuck**: Check logs in PowerShell console for error messages

