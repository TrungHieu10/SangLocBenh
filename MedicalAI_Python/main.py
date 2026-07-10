from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from neo4j import GraphDatabase
import uvicorn
import joblib
import pandas as pd
import json
import os
import warnings
warnings.filterwarnings('ignore')

app = FastAPI(title="Medical AI Forecasting Engine", version="1.0")

# ==========================================
# 1. KẾT NỐI NEO4J & LOAD MODEL
# ==========================================
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

@app.on_event("shutdown")
def shutdown_event():
    driver.close()

DISEASE_CONFIG = {
    "Heart": {"prefix": "heart", "name": "Bệnh Tim mạch"},
    "Diabetes": {"prefix": "diabetes", "name": "Đái tháo đường Type 2"},
    "Stroke": {"prefix": "stroke", "name": "Đột quỵ"},
    "Kidney": {"prefix": "kidney", "name": "Bệnh Thận mạn tính"},
    "Liver": {"prefix": "liver", "name": "Bệnh Gan"}
}

MODELS = {}
LOAD_ERRORS = {}

def load_all_models():
    print("⏳ Đang nạp hệ thống Medical AI...")
    for disease, cfg in DISEASE_CONFIG.items():
        prefix = cfg['prefix']
        try:
            MODELS[disease] = {
                'model': joblib.load(f'models/{prefix}_xgboost.pkl'),
                'scaler': joblib.load(f'models/{prefix}_scaler.pkl'),
                'thresholds': joblib.load(f'models/{prefix}_thresholds.pkl'),
                'explainer': joblib.load(f'models/{prefix}_shap_explainer.pkl'),
                'features': joblib.load(f'models/{prefix}_features.pkl')
            }
            print(f"✅ Đã nạp thành công: {disease}")
        except Exception as e:
            err_msg = str(e)
            import traceback
            err_msg += " | " + traceback.format_exc()
            LOAD_ERRORS[disease] = err_msg
            print(f"❌ Bỏ qua model {disease} (Lỗi: {e})")

load_all_models()

# ==========================================
# 2. HÀM GIAO TIẾP VỚI NEO4J
# ==========================================
def get_advice_from_neo4j(disease_full_name, trigger_feature):
    # 1. Dịch tên bệnh từ Tiếng Việt sang Tiếng Anh (cho khớp với CSDL Neo4j)
    disease_mapping = {
        "Bệnh Tim mạch": "Heart Disease",
        "Đái tháo đường Type 2": "Diabetes",
        "Đột quỵ": "Stroke",
        "Bệnh Thận mạn tính": "Chronic Kidney Disease",
        "Bệnh Gan": "Liver Disease" # Dự phòng
    }
    english_disease_name = disease_mapping.get(disease_full_name, disease_full_name)
    
    # 2. Query Đồ thị lấy Lời khuyên (Advice) và Phòng chống (Prevention)
    query = """
    MATCH (d:Disease {name: $disease_name})-->(node)
    WHERE 'Advice' IN labels(node) OR 'Prevention' IN labels(node)
    RETURN node.content AS advice_content
    ORDER BY node.priority ASC
    LIMIT 3
    """
    
    try:
        with driver.session() as session:
            result = session.run(query, disease_name=english_disease_name)
            advices = [record["advice_content"] for record in result]
            
            if not advices:
                return f"Theo dõi chỉ số thường xuyên và duy trì lối sống lành mạnh để phòng ngừa {disease_full_name}."
            
            return " ".join(advices)
    except Exception as e:
        print(f"Lỗi Neo4j: {e}")
        return f"Hãy tham khảo ý kiến bác sĩ chuyên khoa để có phác đồ điều trị {disease_full_name} tốt nhất."

# ==========================================
# 3. SCHEMA HỨNG DỮ LIỆU TỪ C#
# ==========================================
class PatientMetrics(BaseModel):
    Age: Optional[int] = None
    Gender: Optional[int] = None
    Height_cm: Optional[float] = None
    Weight_kg: Optional[float] = None
    SystolicBP: Optional[float] = None
    DiastolicBP: Optional[float] = None
    BloodGlucose: Optional[float] = None
    HbA1c: Optional[float] = None
    Cholesterol_Total: Optional[float] = None
    SerumCreatinine: Optional[float] = None
    BloodUrea: Optional[float] = None
    Albumin_Urine: Optional[float] = None
    Sugar_Urine: Optional[float] = None
    ALT_SGPT: Optional[float] = None
    AST_SGOT: Optional[float] = None
    TotalBilirubin: Optional[float] = None
    DirectBilirubin: Optional[float] = None
    Hemoglobin: Optional[float] = None
    Alkaline_Phosphotase: Optional[float] = None
    Total_Protiens: Optional[float] = None
    Albumin_Blood: Optional[float] = None
    A_G_Ratio: Optional[float] = None
    SpecificGravity_sg: Optional[float] = None
    PackedCellVolume_pcv: Optional[float] = None
    WhiteBloodCell_wc: Optional[float] = None
    RedBloodCell_rc: Optional[float] = None
    Sodium_sod: Optional[float] = None
    Potassium_pot: Optional[float] = None
    PusCells_pc: Optional[int] = None
    PusCellClumps_pcc: Optional[int] = None
    Bacteria_ba: Optional[int] = None
    Appetite_appet: Optional[int] = None
    PedalEdema_pe: Optional[bool] = None
    Anemia_ane: Optional[bool] = None
    SmokingStatus: Optional[int] = None
    AlcoholConsumption: Optional[int] = None
    PhysicalActivity: Optional[int] = None
    Hypertension_History: Optional[int] = None
    HeartDisease_History: Optional[int] = None
    EverMarried: Optional[int] = None
    WorkType: Optional[int] = None
    ResidenceType: Optional[int] = None

# ==========================================
# 4. HÀM MAPPING & API CHÍNH
# ==========================================
import math

def get_df_for_model(disease, m_dict, features):
    """Hàm biến đổi tên cột từ C# sang đúng format của file feature.pkl"""
    data = {}
    
    # 1. KHÔNG CÒN HARDCODE DEFAULTS, MÀ SẼ LẤY TỪ m_dict
    default_values = {}
    
    # 2. VÁ LỖI ONE-HOT ENCODING: Mã hóa Công việc cho Đột quỵ (Stroke)
    work_types = ['work_type_Govt_job', 'work_type_Never_worked', 'work_type_Private', 'work_type_Self-employed', 'work_type_children']
    for wt in work_types:
        default_values[wt] = 0
    if 0 <= m_dict.get('WorkType', -1) < len(work_types):
        default_values[work_types[m_dict['WorkType']]] = 1

    data.update(default_values)

    # 3. GẮN MAPPING & CONVERT UNITS (VN -> US) CÁC CHỈ SỐ DO C# GỬI TỚI
    # Xử lý missing values bằng Healthy Baselines (đã là hệ US)
    def get_val(key, default_healthy_us_unit, conversion_factor=1.0, is_divide=False):
        val = m_dict.get(key, None)
        if val is None:
            return default_healthy_us_unit
        if is_divide:
            return val / conversion_factor
        return val * conversion_factor

    age = get_val('Age', 45)
    gender = m_dict.get('Gender', 0) if m_dict.get('Gender') is not None else 0
    height = get_val('Height_cm', 165)
    weight = get_val('Weight_kg', 60)
    sys_bp = get_val('SystolicBP', 120)
    dia_bp = get_val('DiastolicBP', 80)
    gluc = get_val('BloodGlucose', 90.0, 18.0) # mmol/L -> mg/dL
    hba1c = get_val('HbA1c', 5.3)
    chol = get_val('Cholesterol_Total', 170.0, 38.67) # mmol/L -> mg/dL
    creat = get_val('SerumCreatinine', 0.9, 88.4, True) # umol/L -> mg/dL
    urea = get_val('BloodUrea', 15.0, 6.01) # mmol/L -> mg/dL
    alt = get_val('ALT_SGPT', 25.0)
    ast = get_val('AST_SGOT', 25.0)
    t_bili = get_val('TotalBilirubin', 0.6, 17.1, True) # umol/L -> mg/dL
    d_bili = get_val('DirectBilirubin', 0.2, 17.1, True) # umol/L -> mg/dL
    hemo = get_val('Hemoglobin', 14.5) # g/dL (already in US unit)
    bmi = get_val('bmi', 22.0)
    pulse_pressure = get_val('pulse_pressure', 40.0)

    # Cholesterol (mg/dL): <200 => 1 (Normal), 200-240 => 2 (Above), >240 => 3 (Well above)
    chol_val = 1 if chol < 200.0 else (2 if chol <= 240.0 else 3)
    # Glucose (mg/dL): <100 => 1 (Normal), 100-126 => 2 (Above), >126 => 3 (Well above)
    gluc_val = 1 if gluc < 100.0 else (2 if gluc <= 126.0 else 3)
    
    if disease == "Heart":
        data.update({
            'age': age, 'gender': gender, 'height': height, 'weight': weight, 
            'ap_hi': sys_bp, 'ap_lo': dia_bp, 
            'cholesterol': chol_val, 'gluc': gluc_val, 
            'smoke': get_val('SmokingStatus', 0), 'alco': get_val('AlcoholConsumption', 0), 'active': get_val('PhysicalActivity', 1), 
            'bmi': bmi, 'pulse_pressure': pulse_pressure
        })
    elif disease == "Diabetes":
        data.update({
            'gender': gender, 'age': age, 'hypertension': get_val('Hypertension_History', 0), 
            'heart_disease': get_val('HeartDisease_History', 0), 'smoking_history': get_val('SmokingStatus', 0), 
            'bmi': bmi, 'hbA1c_level': hba1c, 
            'blood_glucose_level': gluc
        })
    elif disease == "Stroke":
        data.update({
            'gender': gender, 'age': age, 'hypertension': get_val('Hypertension_History', 0), 
            'heart_disease': get_val('HeartDisease_History', 0), 'ever_married': get_val('EverMarried', 0), 
            'Residence_type': get_val('ResidenceType', 1), 
            'avg_glucose_level': gluc,
            'bmi': bmi, 'smoking_status': get_val('SmokingStatus', 0)
        })
    elif disease == "Kidney":
        data.update({
            'age': age, 'bp': sys_bp, 'al': get_val('Albumin_Urine', 0), 'su': get_val('Sugar_Urine', 0), 
            'bgr': gluc,
            'bu': urea,
            'sc': creat,
            'hemo': hemo, 'htn': get_val('Hypertension_History', 0),
            'sg': get_val('SpecificGravity_sg', 1.020),
            'pcv': get_val('PackedCellVolume_pcv', 40.0),
            'wc': get_val('WhiteBloodCell_wc', 8000.0),
            'rc': get_val('RedBloodCell_rc', 4.8),
            'sod': get_val('Sodium_sod', 140.0),
            'pot': get_val('Potassium_pot', 4.5),
            'pc': get_val('PusCells_pc', 0),
            'pcc': get_val('PusCellClumps_pcc', 0),
            'ba': get_val('Bacteria_ba', 0),
            'appet': get_val('Appetite_appet', 0),
            'pe': 1 if get_val('PedalEdema_pe', False) else 0,
            'ane': 1 if get_val('Anemia_ane', False) else 0,
            'dm': 1 if hba1c > 6.4 else 0,
            'cad': 1 if m_dict.get('HeartDisease_History', 0) > 0 else 0
        })
    elif disease == "Liver":
        data.update({
            'Age': age, 'Gender': gender, 
            'Total_Bilirubin': t_bili,
            'Direct_Bilirubin': d_bili,
            'Alamine_Aminotransferase': math.log1p(max(0, alt)),
            'Aspartate_Aminotransferase': math.log1p(max(0, ast)),
            'Alkaline_Phosphotase': math.log1p(max(0, get_val('Alkaline_Phosphotase', 200.0))),
            'Total_Protiens': get_val('Total_Protiens', 6.5),
            'Albumin': get_val('Albumin_Blood', 3.5),
            'Albumin_and_Globulin_Ratio': get_val('A_G_Ratio', 1.0)
        })
    
    # 4. Ép DataFrame chuẩn
    df = pd.DataFrame([data])
    return df.reindex(columns=features, fill_value=0)

@app.post("/api/predict/all")
async def predict_all_diseases(metrics: PatientMetrics):
    if not MODELS:
        raise HTTPException(status_code=500, detail=f"Failed to load AI Models on server. Errors: {LOAD_ERRORS}")

    predictions = []
    m_dict = metrics.model_dump()
    
    # Tính toán các chỉ số phái sinh
    weight_val = metrics.Weight_kg if metrics.Weight_kg is not None else 0
    height_val = metrics.Height_cm if metrics.Height_cm is not None else 0
    sys_val = metrics.SystolicBP if metrics.SystolicBP is not None else 0
    dia_val = metrics.DiastolicBP if metrics.DiastolicBP is not None else 0
    
    m_dict['bmi'] = (weight_val / ((height_val / 100) ** 2)) if (height_val and height_val > 0) else 0
    m_dict['pulse_pressure'] = (sys_val - dia_val) if sys_val else 0

    for disease, cfg in DISEASE_CONFIG.items():
        if disease not in MODELS: continue
        
        try:
            m = MODELS[disease]
            
            # Lấy DataFrame chuẩn xác cho từng bệnh
            df = get_df_for_model(disease, m_dict, m['features'])
            
            # Predict
            scaled = m['scaler'].transform(df)
            prob = float(m['model'].predict_proba(scaled)[:, 1][0])
            threshold = m['thresholds'].get('f2_medical', 0.5)
            
            # Cắt nghĩa SHAP (Luôn tính kể cả nguy cơ thấp)
            raw_sv = m['explainer'].shap_values(scaled)
            if isinstance(raw_sv, list):
                sv = raw_sv[1][0] if len(raw_sv) == 2 else raw_sv[0]
            else:
                sv = raw_sv[0]
            factors = [{"feature": f, "impact": float(v)} for f, v in zip(m['features'], sv)]
            factors.sort(key=lambda x: abs(x["impact"]), reverse=True)
            
            # Gọi Neo4j
            advice = get_advice_from_neo4j(cfg['name'], factors[0]['feature'])
            
            risk_level = "High" if prob > (threshold + 0.1) else ("Medium" if prob >= threshold else "Low")
            
            predictions.append({
                "DiseaseType": disease,
                "Probability": prob,
                "RiskLevel": risk_level,
                "ThresholdUsed": threshold,
                "ShapValuesJSON": json.dumps(factors[:3]), # Chỉ lấy top 3 nguyên nhân gửi về C#
                "AdviceJSON": json.dumps({"vi": advice}),
                "ModelVersion": f"XGB-{disease}-V1"
            })
        except Exception as e:
            print(f"Lỗi {disease}: {e}")
            
    if not predictions:
        # Nếu chỉ số cực kỳ tốt, trả về thông báo sức khỏe ổn định thay vì lỗi 400
        return [{"DiseaseType": "Healthy", "Probability": 0.0, "RiskLevel": "Low", "ThresholdUsed": 0.0, "ShapValuesJSON": "[]", "AdviceJSON": json.dumps({"vi": "Chỉ số hoàn toàn bình thường."}), "ModelVersion": "System"}]

    return predictions

@app.get("/api/feature-importance/{disease}")
async def get_feature_importance(disease: str):
    disease = disease.capitalize()
    if disease not in MODELS:
        return {"error": f"Model for {disease} not found."}
    
    m = MODELS[disease]
    model = m['model']
    features = m['features']
    
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        
        import numpy as np
        sorted_idx = np.argsort(importances)[::-1]
        top_idx = sorted_idx[:10]  # Get top 10 to give good coverage
        
        return {
            "features": [features[i] for i in top_idx],
            "importance": [float(importances[i]) for i in top_idx]
        }
    return {"error": "Model does not support feature importances."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)