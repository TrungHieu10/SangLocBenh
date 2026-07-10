import joblib

MODELS_INFO = {
    "Heart": "models/heart_features.pkl",
    "Diabetes": "models/diabetes_features.pkl",
    "Stroke": "models/stroke_features.pkl",
    "Kidney": "models/kidney_features.pkl",
    "Liver": "models/liver_features.pkl"
}

all_features = set()
feature_dict = {}

for disease, feature_path in MODELS_INFO.items():
    features = joblib.load(feature_path)
    feature_dict[disease] = features
    
    for f in features:
        # normalize strings
        f_lower = f.lower()
        all_features.add(f_lower)

print("Unique raw model features:", len(all_features))
for d, f_list in feature_dict.items():
    print(f"{d}: {len(f_list)} features")
