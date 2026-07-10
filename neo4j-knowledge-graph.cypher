// Neo4j Cypher Script - Medical Knowledge Graph Initialization
// Usage: Copy & paste into Neo4j Browser or run via driver

// ============================================================================
// 1. CREATE CONSTRAINT (ensure unique disease names)
// ============================================================================
CREATE CONSTRAINT disease_name IF NOT EXISTS 
  FOR (d:Disease) REQUIRE d.name IS UNIQUE;

CREATE CONSTRAINT risk_factor_name IF NOT EXISTS 
  FOR (rf:RiskFactor) REQUIRE rf.name IS UNIQUE;

CREATE CONSTRAINT advice_id IF NOT EXISTS 
  FOR (a:Advice) REQUIRE a.id IS UNIQUE;

// ============================================================================
// 2. CREATE DISEASES
// ============================================================================
CREATE 
  (diabetes:Disease {
    name: 'Diabetes',
    description: 'Blood sugar disorder',
    icd10: 'E11',
    severity: 'High',
    prevalence: 0.07
  }),
  (hypertension:Disease {
    name: 'Hypertension',
    description: 'High blood pressure',
    icd10: 'I10',
    severity: 'High',
    prevalence: 0.30
  }),
  (heartDisease:Disease {
    name: 'Heart Disease',
    description: 'Cardiovascular disorder',
    icd10: 'I25',
    severity: 'Critical',
    prevalence: 0.04
  }),
  (obesity:Disease {
    name: 'Obesity',
    description: 'Excess body weight',
    icd10: 'E66',
    severity: 'Medium',
    prevalence: 0.30
  }),
  (stroke:Disease {
    name: 'Stroke',
    description: 'Cerebrovascular accident',
    icd10: 'I63',
    severity: 'Critical',
    prevalence: 0.02
  }),
  (kidney:Disease {
    name: 'Chronic Kidney Disease',
    description: 'Progressive kidney function loss',
    icd10: 'N18',
    severity: 'High',
    prevalence: 0.03
  });

// ============================================================================
// 3. CREATE RISK FACTORS
// ============================================================================
CREATE
  (highGlucose:RiskFactor {
    name: 'High Blood Glucose',
    category: 'metabolic',
    threshold: 126,
    unit: 'mg/dL'
  }),
  (highBP:RiskFactor {
    name: 'High Blood Pressure',
    category: 'cardiovascular',
    threshold: 140,
    unit: 'mmHg (systolic)'
  }),
  (highCholesterol:RiskFactor {
    name: 'High Cholesterol',
    category: 'metabolic',
    threshold: 240,
    unit: 'mg/dL'
  }),
  (smoking:RiskFactor {
    name: 'Smoking',
    category: 'lifestyle',
    riskMultiplier: 2.5
  }),
  (obesity2:RiskFactor {
    name: 'Obesity',
    category: 'metabolic',
    bmiThreshold: 30
  }),
  (sedentary:RiskFactor {
    name: 'Sedentary Lifestyle',
    category: 'lifestyle',
    exerciseMinutes: 150
  }),
  (alcohol:RiskFactor {
    name: 'Alcohol Abuse',
    category: 'lifestyle',
    unitsPerWeek: 14
  }),
  (stress:RiskFactor {
    name: 'High Stress',
    category: 'psychological',
    stressLevel: 8
  });

// ============================================================================
// 4. CREATE ADVICE
// ============================================================================
CREATE
  (advice1:Advice {
    id: 'ADV001',
    content: 'Monitor blood glucose levels regularly every 3-6 months using HbA1c test',
    minRisk: 0.3,
    maxRisk: 0.6,
    priority: 1,
    actionable: true
  }),
  (advice2:Advice {
    id: 'ADV002',
    content: 'Consult an endocrinologist for personalized diabetes management and treatment plan',
    minRisk: 0.6,
    maxRisk: 1.0,
    priority: 1,
    actionable: true
  }),
  (advice3:Advice {
    id: 'ADV003',
    content: 'Adopt a low-sodium diet (<2.3g/day) to control blood pressure effectively',
    minRisk: 0.3,
    maxRisk: 1.0,
    priority: 1,
    actionable: true
  }),
  (advice4:Advice {
    id: 'ADV004',
    content: 'Take antihypertensive medications as prescribed by your physician',
    minRisk: 0.6,
    maxRisk: 1.0,
    priority: 1,
    actionable: false
  }),
  (advice5:Advice {
    id: 'ADV005',
    content: 'Get comprehensive blood lipid panel done quarterly to monitor cholesterol',
    minRisk: 0.5,
    maxRisk: 1.0,
    priority: 2,
    actionable: true
  }),
  (advice6:Advice {
    id: 'ADV006',
    content: 'Consider cardiac screening including ECG and echocardiogram with your physician',
    minRisk: 0.7,
    maxRisk: 1.0,
    priority: 1,
    actionable: false
  }),
  (advice7:Advice {
    id: 'ADV007',
    content: 'Work on sustained weight loss through balanced diet and exercise',
    minRisk: 0.4,
    maxRisk: 1.0,
    priority: 1,
    actionable: true
  }),
  (advice8:Advice {
    id: 'ADV008',
    content: 'Maintain daily physical exercise routine for cardiovascular health (150 min/week)',
    minRisk: 0.0,
    maxRisk: 1.0,
    priority: 2,
    actionable: true
  }),
  (advice9:Advice {
    id: 'ADV009',
    content: 'Quit smoking immediately to significantly reduce health risks',
    minRisk: 0.5,
    maxRisk: 1.0,
    priority: 1,
    actionable: true
  }),
  (advice10:Advice {
    id: 'ADV010',
    content: 'Practice daily stress management techniques like meditation or yoga',
    minRisk: 0.3,
    maxRisk: 1.0,
    priority: 2,
    actionable: true
  });

// ============================================================================
// 5. CREATE PREVENTION TIPS
// ============================================================================
CREATE
  (prevent1:Prevention {
    id: 'PREV001',
    content: 'Maintain fasting blood glucose below 126 mg/dL',
    priority: 1,
    disease: 'Diabetes'
  }),
  (prevent2:Prevention {
    id: 'PREV002',
    content: 'Keep blood pressure below 130/80 mmHg consistently',
    priority: 1,
    disease: 'Hypertension'
  }),
  (prevent3:Prevention {
    id: 'PREV003',
    content: 'Maintain total cholesterol below 200 mg/dL',
    priority: 1,
    disease: 'Heart Disease'
  }),
  (prevent4:Prevention {
    id: 'PREV004',
    content: 'Achieve and maintain healthy BMI (18.5-24.9)',
    priority: 1,
    disease: 'Obesity'
  }),
  (prevent5:Prevention {
    id: 'PREV005',
    content: 'Avoid processed foods and sugary drinks regularly',
    priority: 2,
    disease: 'Diabetes'
  }),
  (prevent6:Prevention {
    id: 'PREV006',
    content: 'Get 7-9 hours of quality sleep daily',
    priority: 2,
    disease: 'All'
  }),
  (prevent7:Prevention {
    id: 'PREV007',
    content: 'Exercise at least 150 minutes per week at moderate intensity',
    priority: 1,
    disease: 'All'
  }),
  (prevent8:Prevention {
    id: 'PREV008',
    content: 'Reduce salt intake to less than 2.3g/day',
    priority: 2,
    disease: 'Hypertension'
  }),
  (prevent9:Prevention {
    id: 'PREV009',
    content: 'Avoid smoking and secondhand smoke exposure',
    priority: 1,
    disease: 'Heart Disease'
  }),
  (prevent10:Prevention {
    id: 'PREV010',
    content: 'Limit alcohol consumption to recommended levels',
    priority: 2,
    disease: 'All'
  });

// ============================================================================
// 6. CREATE LIFESTYLE RECOMMENDATIONS
// ============================================================================
CREATE
  (lifestyle1:LifestyleRecommendation {
    id: 'LS001',
    content: 'Start with 30 minutes of moderate exercise (brisk walking, cycling), 5 days per week',
    difficulty: 'Easy',
    category: 'Exercise'
  }),
  (lifestyle2:LifestyleRecommendation {
    id: 'LS002',
    content: 'Incorporate 5+ servings of vegetables and whole grains into daily meals',
    difficulty: 'Medium',
    category: 'Nutrition'
  }),
  (lifestyle3:LifestyleRecommendation {
    id: 'LS003',
    content: 'Reduce sodium intake by cooking at home instead of eating processed foods',
    difficulty: 'Medium',
    category: 'Nutrition'
  }),
  (lifestyle4:LifestyleRecommendation {
    id: 'LS004',
    content: 'Practice yoga or meditation for 10-15 minutes daily for stress relief',
    difficulty: 'Easy',
    category: 'Mental Health'
  }),
  (lifestyle5:LifestyleRecommendation {
    id: 'LS005',
    content: 'Maintain consistent sleep schedule going to bed at 10 PM, waking at 6 AM',
    difficulty: 'Medium',
    category: 'Sleep'
  }),
  (lifestyle6:LifestyleRecommendation {
    id: 'LS006',
    content: 'Stay hydrated by drinking 8-10 glasses of water throughout the day',
    difficulty: 'Easy',
    category: 'Nutrition'
  }),
  (lifestyle7:LifestyleRecommendation {
    id: 'LS007',
    content: 'Join a health support group or find an accountability partner for motivation',
    difficulty: 'Hard',
    category: 'Social Support'
  }),
  (lifestyle8:LifestyleRecommendation {
    id: 'LS008',
    content: 'Track daily nutrition and activity using health apps like MyFitnessPal or Apple Health',
    difficulty: 'Easy',
    category: 'Tracking'
  });

// ============================================================================
// 7. CREATE RELATIONSHIPS - Disease to Advice
// ============================================================================
MATCH (d:Disease {name: 'Diabetes'}), (a:Advice) 
  WHERE a.id IN ['ADV001', 'ADV002', 'ADV008']
CREATE (d)-[:HAS_ADVICE]->(a);

MATCH (d:Disease {name: 'Hypertension'}), (a:Advice) 
  WHERE a.id IN ['ADV003', 'ADV004', 'ADV008']
CREATE (d)-[:HAS_ADVICE]->(a);

MATCH (d:Disease {name: 'Heart Disease'}), (a:Advice) 
  WHERE a.id IN ['ADV005', 'ADV006', 'ADV008', 'ADV009']
CREATE (d)-[:HAS_ADVICE]->(a);

MATCH (d:Disease {name: 'Obesity'}), (a:Advice) 
  WHERE a.id IN ['ADV007', 'ADV008']
CREATE (d)-[:HAS_ADVICE]->(a);

MATCH (d:Disease {name: 'Stroke'}), (a:Advice) 
  WHERE a.id IN ['ADV003', 'ADV009', 'ADV010']
CREATE (d)-[:HAS_ADVICE]->(a);

// ============================================================================
// 8. CREATE RELATIONSHIPS - Disease to Prevention
// ============================================================================
MATCH (d:Disease {name: 'Diabetes'}), (p:Prevention) 
  WHERE p.id IN ['PREV001', 'PREV005', 'PREV007']
CREATE (d)-[:HAS_PREVENTION]->(p);

MATCH (d:Disease {name: 'Hypertension'}), (p:Prevention) 
  WHERE p.id IN ['PREV002', 'PREV008', 'PREV007']
CREATE (d)-[:HAS_PREVENTION]->(p);

MATCH (d:Disease {name: 'Heart Disease'}), (p:Prevention) 
  WHERE p.id IN ['PREV003', 'PREV009', 'PREV007']
CREATE (d)-[:HAS_PREVENTION]->(p);

MATCH (d:Disease {name: 'Obesity'}), (p:Prevention) 
  WHERE p.id IN ['PREV004', 'PREV007']
CREATE (d)-[:HAS_PREVENTION]->(p);

// Add missing Liver Disease and Kidney Disease
CREATE (liver:Disease {
  name: 'Liver Disease',
  description: 'Liver function disorder',
  icd10: 'K76',
  severity: 'High',
  prevalence: 0.05
});

MATCH (d:Disease {name: 'Liver Disease'}), (a:Advice)
  WHERE a.id IN ['ADV008', 'ADV009']
CREATE (d)-[:HAS_ADVICE]->(a);

MATCH (d:Disease {name: 'Chronic Kidney Disease'}), (a:Advice)
  WHERE a.id IN ['ADV003', 'ADV008']
CREATE (d)-[:HAS_ADVICE]->(a);

MATCH (d:Disease {name: 'Chronic Kidney Disease'}), (p:Prevention)
  WHERE p.id IN ['PREV002', 'PREV007', 'PREV010']
CREATE (d)-[:HAS_PREVENTION]->(p);

MATCH (d:Disease {name: 'Liver Disease'}), (p:Prevention)
  WHERE p.id IN ['PREV009', 'PREV010', 'PREV007']
CREATE (d)-[:HAS_PREVENTION]->(p);

// ============================================================================
// 9. CREATE RELATIONSHIPS - RiskFactor to Lifestyle
// ============================================================================
MATCH (rf:RiskFactor {name: 'Sedentary Lifestyle'}), (ls:LifestyleRecommendation) 
  WHERE ls.id IN ['LS001', 'LS005']
CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(ls);

MATCH (rf:RiskFactor {name: 'Obesity'}), (ls:LifestyleRecommendation) 
  WHERE ls.id IN ['LS001', 'LS002', 'LS003', 'LS006']
CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(ls);

MATCH (rf:RiskFactor {name: 'High Stress'}), (ls:LifestyleRecommendation) 
  WHERE ls.id IN ['LS004', 'LS005']
CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(ls);

MATCH (rf:RiskFactor {name: 'High Blood Glucose'}), (ls:LifestyleRecommendation) 
  WHERE ls.id IN ['LS001', 'LS002', 'LS003', 'LS006']
CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(ls);

MATCH (rf:RiskFactor {name: 'Smoking'}), (ls:LifestyleRecommendation) 
  WHERE ls.id IN ['LS004', 'LS007']
CREATE (rf)-[:HAS_LIFESTYLE_RECOMMENDATION]->(ls);

// ============================================================================
// 10. VERIFY - Count all nodes and relationships
// ============================================================================
MATCH (n) RETURN labels(n) as type, count(*) as count;
MATCH ()-[r]-() RETURN type(r) as relationship, count(*) as count;

// ============================================================================
// 11. TEST QUERIES
// ============================================================================

// Get advice for diabetes patients with high risk
MATCH (d:Disease {name: 'Diabetes'})-[:HAS_ADVICE]->(a:Advice)
WHERE a.minRisk <= 0.75 AND a.maxRisk >= 0.75
RETURN a.content as advice, a.priority
ORDER BY a.priority DESC;

// Get all lifestyle recommendations for someone with obesity
MATCH (rf:RiskFactor {name: 'Obesity'})-[:HAS_LIFESTYLE_RECOMMENDATION]->(ls:LifestyleRecommendation)
RETURN ls.content as recommendation;

// Get prevention tips for heart disease
MATCH (d:Disease {name: 'Heart Disease'})-[:HAS_PREVENTION]->(p:Prevention)
RETURN p.content as tip
ORDER BY p.priority DESC;
