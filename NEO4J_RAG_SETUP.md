# Neo4j RAG Engine Setup Guide

## ðŸ“‹ Tá»•ng Quan

Neo4j RAG (Retrieval Augmented Generation) Engine lÃ  má»™t knowledge graph system Ä‘á»ƒ cung cáº¥p advice vÃ  khuyáº¿n nghá»‹ y táº¿ personalized cho bá»‡nh nhÃ¢n dá»±a trÃªn AI predictions.

## ðŸ—ï¸ Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              User Input (Health Data)               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
                   â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚   C# Backend API     â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚   Python AI Model    â”‚  â—„â”€ Predictions
        â”‚  (XGBoost + SHAP)    â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚   RAG Engine         â”‚
        â”‚  (ClinicalService)   â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚   Neo4j Knowledge    â”‚  â—„â”€ Advice + Recommendations
        â”‚      Graph           â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚   Frontend           â”‚  â—„â”€ Advice Display
        â”‚   (React)            â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## ðŸš€ Installation & Setup

### 1. Neo4j Database Setup

**Option A: Neo4j Cloud (Recommended)**
- Visit: https://neo4j.com/cloud/platform/aura/
- Create free instance
- Note: Connection URI, Username, Password

**Option B: Local Neo4j with Docker**
```bash
docker run -d \
  --name neo4j \
  -p 7687:7687 \
  -p 7474:7474 \
  -e NEO4J_AUTH=neo4j/your-password \
  neo4j:5.0
```

### 2. Add Neo4j NuGet Package

```bash
dotnet add package Neo4j.Driver
```

### 3. Configure in Program.cs

```csharp
using MedicalAI.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add RAG services
builder.Services.AddNeo4jRagServices(
    neo4jUri: builder.Configuration["Neo4j:Uri"] 
        ?? "neo4j+s://your-instance.databases.neo4j.io",
    neo4jUsername: builder.Configuration["Neo4j:Username"] ?? "neo4j",
    neo4jPassword: builder.Configuration["Neo4j:Password"]
);

var app = builder.Build();

// Initialize Neo4j Knowledge Graph
using (var scope = app.Services.CreateScope())
{
    try
    {
        await scope.ServiceProvider.InitializeNeo4jKnowledgeGraphAsync();
        Console.WriteLine("âœ… Neo4j Knowledge Graph initialized");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"âš ï¸ Neo4j initialization: {ex.Message}");
    }
}

app.Run();
```

### 4. Update appsettings.json

```json
{
  "Neo4j": {
    "Uri": "neo4j+s://your-instance.databases.neo4j.io",
    "Username": "neo4j",
    "Password": "your-secure-password"
  }
}
```

## ðŸ“Š Knowledge Graph Structure

### Nodes

#### Disease
```
Disease {
  name: string,           // e.g., "Diabetes"
  description: string,    // Clinical description
  icd10: string          // ICD-10 code
}
```

#### Risk Factor
```
RiskFactor {
  name: string,          // e.g., "High Blood Glucose"
  category: string       // metabolic, cardiovascular, lifestyle, psychological
}
```

#### Advice
```
Advice {
  content: string,       // Medical recommendation
  minRisk: number,       // 0-1
  maxRisk: number,       // 0-1
  priority: number       // 1-5 (higher = more important)
}
```

#### Prevention
```
Prevention {
  content: string,       // Prevention tip
  priority: number
}
```

#### Lifestyle Recommendation
```
LifestyleRecommendation {
  content: string        // Actionable lifestyle change
}
```

### Relationships

```
Disease -[:HAS_ADVICE]-> Advice
Disease -[:HAS_PREVENTION]-> Prevention
RiskFactor -[:HAS_LIFESTYLE_RECOMMENDATION]-> LifestyleRecommendation
```

## ðŸ”Œ API Endpoints

### 1. Submit Checkup with Advice
```
POST /api/clinical-rag/submit
Content-Type: application/json

{
  "age": 45,
  "systolicBP": 150,
  "diastolicBP": 90,
  "bloodGlucose": 180,
  "weight": 85,
  "height": 170,
  ...
}

Response:
{
  "success": true,
  "data": {
    "checkupId": "uuid",
    "predictions": [
      {
        "disease": "Diabetes",
        "probability": 0.75
      }
    ],
    "riskLevel": "High",
    "riskScore": 0.75,
    "advice": [
      "Monitor blood glucose levels regularly...",
      "Consult an endocrinologist..."
    ],
    "preventionTips": [...],
    "lifestyleRecommendations": [...]
  }
}
```

### 2. Get Prediction with Advice
```
GET /api/clinical-rag/{checkupId}/result

Response: Same as above
```

### 3. Get Advice for Disease
```
GET /api/clinical-rag/advice?disease=Diabetes&riskScore=0.75

Response:
{
  "success": true,
  "disease": "Diabetes",
  "riskScore": 75,
  "advice": [...]
}
```

### 4. Get Prevention Tips
```
GET /api/clinical-rag/prevention?disease=Hypertension

Response:
{
  "success": true,
  "disease": "Hypertension",
  "prevention": [...]
}
```

### 5. Get Lifestyle Recommendations
```
POST /api/clinical-rag/lifestyle-recommendations
Content-Type: application/json

["High Blood Glucose", "Obesity", "Sedentary Lifestyle"]

Response:
{
  "success": true,
  "recommendations": [...]
}
```

## ðŸ’» Frontend Integration

### Update ResultDashboard.jsx

```jsx
import { usePrediction } from '../hooks/usePrediction';

export const ResultDashboard = () => {
  const { checkupId } = useParams();
  const { prediction, loading, error } = usePrediction(checkupId);

  if (prediction?.advice) {
    return (
      <AdviceCard 
        advice={prediction.advice}
        preventionTips={prediction.preventionTips}
        lifestyleRecommendations={prediction.lifestyleRecommendations}
      />
    );
  }
  
  // ... rest of component
};
```

### Update AdviceCard.jsx

```jsx
export const AdviceCard = ({ advice, preventionTips, lifestyleRecommendations }) => {
  return (
    <Card header="Personalized Recommendations" shadow="lg">
      {/* Advice Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Medical Advice</h3>
        <ul className="space-y-2">
          {advice?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-600">ðŸ’Š</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prevention Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Prevention Tips</h3>
        <ul className="space-y-2">
          {preventionTips?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-green-600">âœ“</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lifestyle Recommendations */}
      <div>
        <h3 className="font-semibold mb-3">Lifestyle Changes</h3>
        <ul className="space-y-2">
          {lifestyleRecommendations?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-orange-600">ðŸŽ¯</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
```

## ðŸ§ª Testing

### Query Neo4j Browser

1. Open: http://localhost:7474 (local) or cloud URL
2. Connect with credentials
3. Test queries:

```cypher
// View all diseases
MATCH (d:Disease) RETURN d

// View disease with advice
MATCH (d:Disease {name: "Diabetes"})-[:HAS_ADVICE]->(a:Advice) 
RETURN a

// View risk factors
MATCH (rf:RiskFactor)-[:HAS_LIFESTYLE_RECOMMENDATION]->(lr:LifestyleRecommendation)
RETURN rf, lr

// Count nodes
MATCH (n) RETURN labels(n), count(*) as count
```

## ðŸ”§ Troubleshooting

### Connection Error
```
Error: Could not connect to Neo4j
Solution: Check URI, username, password in appsettings.json
```

### Knowledge Graph Empty
```
Solution: Run InitializeNeo4jKnowledgeGraphAsync() in Program.cs
or manually visit: POST /api/clinical-rag/initialize
```

### Advice Not Returning
```
Solution: Check if disease name matches exactly in DB
Use: SELECT DISTINCT disease FROM predictions
```

## ðŸ“ˆ Extending the Knowledge Graph

### Add New Disease

```csharp
// In Neo4jService.cs
var query = @"
  CREATE (d:Disease {
    name: 'Chronic Kidney Disease',
    description: '...',
    icd10: 'N18'
  })
";
await _session.RunAsync(query);
```

### Add Custom Advice

```csharp
var query = @"
  MATCH (d:Disease {name: 'Diabetes'})
  CREATE (a:Advice {
    content: 'Your custom advice here',
    minRisk: 0.5,
    maxRisk: 0.8,
    priority: 1
  })
  CREATE (d)-[:HAS_ADVICE]->(a)
";
await _session.RunAsync(query);
```

## ðŸ“š References

- Neo4j Documentation: https://neo4j.com/docs/
- Cypher Query Language: https://neo4j.com/docs/cypher-manual/
- Neo4j .NET Driver: https://github.com/neo4j/neo4j-dotnet-driver
- RAG Pattern: https://en.wikipedia.org/wiki/Retrieval-augmented_generation

## ðŸ¤ Contributing

To extend the RAG system:
1. Add new node types to Neo4jService
2. Create corresponding relationships
3. Add query methods to INeo4jService
4. Update RAGEngine to use new queries

---

**Last Updated**: May 25, 2026
**Maintainer**: MedicalAI Team

