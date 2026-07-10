import pandas as pd
import json
import random
import os

def fetch_real_cases():
    patients = []
    
    # 1. Fetch real Stroke cases from local dataset.csv (because it perfectly matches)
    try:
        stroke_df = pd.read_csv(r"d:\DA\MedicalAI_Python\test data\dataset.csv")
        stroke_pos = stroke_df[stroke_df['stroke'] == 1].dropna().sample(1).iloc[0]
        stroke_neg = stroke_df[stroke_df['stroke'] == 0].dropna().sample(1).iloc[0]
        
        for case, label_en, label_vi in [(stroke_pos, "Positive (Stroke)", "Dương tính - Đột quỵ"), 
                                         (stroke_neg, "Negative (Stroke)", "Âm tính - Đột quỵ")]:
            patients.append({
                "age": float(case['age']),
                "gender": 1 if str(case['gender']).lower() == 'male' else 0,
                "hypertension_History": True if case['hypertension'] == 1 else False,
                "heartDisease_History": True if case['heart_disease'] == 1 else False,
                "everMarried": True if str(case['ever_married']).lower() == 'yes' else False,
                "workType": 0 if 'children' in str(case['work_type']).lower() else (1 if 'govt' in str(case['work_type']).lower() else (2 if 'private' in str(case['work_type']).lower() else 3)),
                "residenceType": 1 if str(case['Residence_type']).lower() == 'urban' else 0,
                "bloodGlucose": float(case['avg_glucose_level']),
                "bmi": float(case['bmi']),
                "smokingStatus": 0 if str(case['smoking_status']).lower() in ['never smoked', 'unknown'] else (1 if str(case['smoking_status']).lower() == 'formerly smoked' else 2),
                "_source": "Stroke Prediction Dataset (Kaggle)",
                "_label": label_en,
                "_label_vi": label_vi,
                "_scenario": f"Bệnh nhân thực tế từ dataset Đột quỵ (Kaggle). Tuổi: {case['age']}"
            })
    except Exception as e:
        print("Lỗi Stroke:", e)

    # 2. Fetch real Liver cases from UCI ILPD Dataset online
    try:
        ilpd_url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00225/Indian%20Liver%20Patient%20Dataset%20(ILPD).csv"
        col_names = ["Age", "Gender", "Total_Bilirubin", "Direct_Bilirubin", "Alkaline_Phosphotase", "Alamine_Aminotransferase", "Aspartate_Aminotransferase", "Total_Protiens", "Albumin", "Albumin_and_Globulin_Ratio", "Dataset"]
        liver_df = pd.read_csv(ilpd_url, names=col_names).dropna()
        
        # Dataset: 1 = liver patient, 2 = not liver patient
        liver_pos = liver_df[liver_df['Dataset'] == 1].sample(1).iloc[0]
        liver_neg = liver_df[liver_df['Dataset'] == 2].sample(1).iloc[0]

        for case, label_en, label_vi in [(liver_pos, "Positive (Liver)", "Dương tính - Viêm Gan"), 
                                         (liver_neg, "Negative (Liver)", "Âm tính - Gan khỏe mạnh")]:
            patients.append({
                "age": float(case['Age']),
                "gender": 1 if str(case['Gender']).lower() == 'male' else 0,
                "totalBilirubin": float(case['Total_Bilirubin']),
                "directBilirubin": float(case['Direct_Bilirubin']),
                "alkaline_Phosphotase": float(case['Alkaline_Phosphotase']),
                "alt_SGPT": float(case['Alamine_Aminotransferase']),
                "ast_SGOT": float(case['Aspartate_Aminotransferase']),
                "total_Protiens": float(case['Total_Protiens']),
                "albumin_Blood": float(case['Albumin']),
                "a_G_Ratio": float(case['Albumin_and_Globulin_Ratio']),
                "_source": "ILPD Indian Liver Patient Dataset (UCI)",
                "_label": label_en,
                "_label_vi": label_vi,
                "_scenario": f"Bệnh nhân thực tế từ viện ILPD. Tuổi: {case['Age']}, Men gan: {case['Alamine_Aminotransferase']} U/L"
            })
    except Exception as e:
        print("Lỗi Liver:", e)
        
    # Điền các giá trị mặc định cho 42 biến nếu bị thiếu
    default_vals = {
        "age": 40, "gender": 1, "height_cm": 165, "weight_kg": 60, "systolicBP": 120, "diastolicBP": 80,
        "smokingStatus": 0, "alcoholConsumption": False, "physicalActivity": True,
        "hypertension_History": False, "heartDisease_History": False, "everMarried": True, "workType": 2, "residenceType": 1,
        "bloodGlucose": 90.0, "hbA1c": 5.4, "cholesterol_Total": 180.0, "serumCreatinine": 0.9, "bloodUrea": 15.0,
        "albumin_Urine": 0, "sugar_Urine": 0, "alt_SGPT": 25.0, "ast_SGOT": 25.0, "totalBilirubin": 0.6, "directBilirubin": 0.2,
        "hemoglobin": 14.5, "alkaline_Phosphotase": 200.0, "total_Protiens": 6.5, "albumin_Blood": 3.5, "a_G_Ratio": 1.0,
        "specificGravity_sg": 1.020, "packedCellVolume_pcv": 40.0, "whiteBloodCell_wc": 8000.0, "redBloodCell_rc": 4.8,
        "sodium_sod": 140.0, "potassium_pot": 4.5, "pusCells_pc": 0, "pusCellClumps_pcc": 0, "bacteria_ba": 0,
        "appetite_appet": 0, "pedalEdema_pe": False, "anemia_ane": False
    }

    for p in patients:
        for k, v in default_vals.items():
            if k not in p:
                p[k] = v

    output_path = r"d:\DA\medical-ai-web\test_data\real_test_patients.json"
    
    # Append to existing or create new
    if os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            existing = json.load(f)
            # Remove old stroke/liver synthetic ones if needed, or just append
    else:
        existing = []
        
    # We will just rewrite the entire list to keep it clean (synthetic heart/kidney/diabetes + real stroke/liver)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(patients, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    fetch_real_cases()
    print("Done fetching real data!")
