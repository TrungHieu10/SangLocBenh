# 🚀 QUICK START: Neo4j + C# Backend Integration

## ⏱️ Bước 1: Configuration (2 phút)

### 1.1 Mở file `appsettings.json`

**Path**: `d:\DA\MedicalAI.API\appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=medicalai;Trusted_Connection=true;"
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

💡 **Quan trọng**: Thay `password` bằng password của Neo4j instance của bạn

## ⏱️ Bước 2: Khởi động API (3 phút)

### 2.1 Mở PowerShell

```powershell
cd d:\DA\MedicalAI.API
dotnet restore      # Download packages
dotnet run          # Start API
```

✅ Khi thấy `Now listening on: http://localhost:5000` → Success!

### 2.2 Kiểm tra Swagger

Browser: `http://localhost:5000/swagger/index.html`

Phải thấy danh sách endpoints:
- `POST /api/clinical-rag/submit`
- `GET /api/clinical-rag/advice`
- etc.

## ⏱️ Bước 3: Lấy JWT Token (2 phút)

### 3.1 Login để lấy token

**PowerShell:**
```powershell
$body = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body | ConvertFrom-Json
```

Hoặc **cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

✅ Copy token từ response: `{"token": "eyJhbGciOi..."}`

## ⏱️ Bước 4: Test Endpoints (5 phút)

### 4.1 Test 1: Get Advice

**PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/clinical-rag/advice?disease=Đái tháo đường Type 2&riskScore=0.75" `
    -Headers $headers | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

✅ Phải nhận response:
```json
{
  "success": true,
  "advice": [
    "Cắt giảm đường tinh luyện, uống nhiều nước...",
    "Cần giảm cân khẩn cấp..."
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

Invoke-WebRequest -Uri "http://localhost:5000/api/clinical-rag/submit" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

✅ Response phải chứa:
- `checkupId`
- `predictions` (list diseases)
- `advice` (from Neo4j)
- `riskLevel`

### 4.3 Test 3: Get Result

**PowerShell:**
```powershell
# Lấy checkupId từ bước trước
$checkupId = "uuid-from-previous-response"

$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/clinical-rag/$checkupId/result" `
    -Headers $headers | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## ⏱️ Bước 5: Kiểm tra Neo4j Data (2 phút)

### 5.1 Neo4j Browser

Browser: `http://localhost:7687`

Login: `neo4j` / `password`

### 5.2 Chạy Queries

**Query 1: Count Nodes**
```cypher
MATCH (n) RETURN labels(n) as type, count(*) as count;
```

Kỳ vọng:
- Disease: 5
- Indicator: 9
- Advice: 6
- Total: 20

**Query 2: Get Advice cho Diabetes**
```cypher
MATCH (d:Disease {name: "Đái tháo đường Type 2"})-[:HAS_ADVICE_FOR]->(a:Advice)
RETURN a.content;
```

Kỳ vọng: 2 advice nodes

**Query 3: Get Indicators**
```cypher
MATCH (i:Indicator)-[:INDICATES_RISK_OF]->(d:Disease {name: "Đái tháo đường Type 2"})
RETURN i.label, i.name;
```

Kỳ vọng: 2 indicators (BloodGlucoseLevel, HbA1c)

## ✅ Troubleshooting

### ❌ Error: "Cannot connect to Neo4j"
```
Solution:
1. Kiểm tra Neo4j running: docker ps
2. Kiểm tra port: netstat -an | findstr 7687
3. Verify credentials trong appsettings.json
```

### ❌ Error: "No advice returned"
```
Solution:
1. Neo4j Browser → kiểm tra diseases tồn tại
2. Disease names phải match: "Đái tháo đường Type 2" (case-sensitive)
3. Query: MATCH (d:Disease)-[:HAS_ADVICE_FOR]->(a:Advice) RETURN count(*)
```

### ❌ Error: "401 Unauthorized"
```
Solution:
1. Đảm bảo token được add vào Authorization header
2. Token format: "Bearer YOUR_TOKEN_HERE"
3. Token có thể hết hạn → re-login
```

### ❌ Error: "500 Internal Server Error"
```
Solution:
1. Kiểm tra console logs trong PowerShell
2. Verify database connection string
3. Ensure database "medicalai" exists
```

## 📊 Expected Workflow

```
┌─────────────────────────────────────┐
│   1. Khởi động API (dotnet run)    │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   2. Login → Lấy JWT Token          │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   3. Call /api/clinical-rag/submit  │
│      (submit health data)           │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │ C# API         │
        │ - Call Python  │
        │   AI model     │
        │ - Query Neo4j  │
        │   for advice   │
        └────────┬────────┘
                 │
┌────────────────▼────────────────────┐
│   4. Receive Response               │
│   - AI Predictions                  │
│   - Neo4j Advice                    │
│   - Risk Level                      │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   5. Frontend Display               │
│   - ResultDashboard component       │
│   - AdviceCard with real advice     │
└─────────────────────────────────────┘
```

## 🎯 Next Steps

✅ Bước 1: Configuration
✅ Bước 2: Run API
✅ Bước 3: Get Token
✅ Bước 4: Test Endpoints
✅ Bước 5: Verify Neo4j

🔄 Bước 6 (Frontend): 
- Update `usePrediction` hook
- Update `ResultDashboard` component
- Test end-to-end

## 📋 Checklist

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

**Status**: 🚀 Ready to integrate with frontend!

**If stuck**: Check logs in PowerShell console for error messages
