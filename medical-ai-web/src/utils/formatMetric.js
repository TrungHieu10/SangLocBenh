/**
 * formatMetric.js - Helper functions định dạng chỉ số sức khỏe
 */

export const formatBMI = (weight, height) => {
  if (!weight || !height) return null;
  const bmi = weight / ((height / 100) ** 2);
  return bmi.toFixed(1);
};

export const formatBP = (systolic, diastolic) => {
  if (!systolic || !diastolic) return null;
  return `${systolic}/${diastolic} mmHg`;
};

export const formatBloodGlucose = (value) => {
  if (!value) return null;
  return `${value} mg/dL`;
};

export const formatCholesterol = (value) => {
  if (!value) return null;
  return `${value} mg/dL`;
};

export const formatHeartRate = (value) => {
  if (!value) return null;
  return `${value} bpm`;
};

export const formatTemperature = (value) => {
  if (!value) return null;
  return `${value}°C`;
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return null;
  return `${(value * 100).toFixed(1)}%`;
};

export const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString('vi-VN');
};

export const getBMICategory = (bmi) => {
  // Chuẩn WHO dành cho người Châu Á
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 23) return 'Normal';
  if (bmi < 25) return 'Overweight';
  return 'Obese';
};

export const getBloodPressureCategory = (systolic, diastolic) => {
  if (systolic < 120 && diastolic < 80) return 'Normal';
  if (systolic < 130 && diastolic < 80) return 'Elevated';
  if (systolic < 140 && diastolic < 90) return 'Stage 1 Hypertension';
  if (systolic >= 180 || diastolic >= 120) return 'Hypertensive Crisis';
  return 'Stage 2 Hypertension';
};

export const getBloodGlucoseCategory = (glucose) => {
  if (glucose < 70) return 'Low (Hypoglycemia)';
  if (glucose < 100) return 'Normal (Fasting)';
  if (glucose < 126) return 'Prediabetes';
  return 'Diabetes';
};

export const translateDisease = (disease) => {
  if (!disease) return 'Sức khỏe tổng quát';
  const mapping = {
    'Heart': 'Bệnh Tim Mạch',
    'Diabetes': 'Bệnh Tiểu Đường',
    'Stroke': 'Đột Quỵ',
    'Kidney': 'Bệnh Thận',
    'Liver': 'Bệnh Gan',
    'Healthy': 'Khỏe Mạnh'
  };
  return mapping[disease] || disease;
};

export const translateFeature = (feature) => {
  if (!feature) return 'Chỉ số';
  const mapping = {
    'age': 'Tuổi',
    'gender': 'Giới tính',
    'height': 'Chiều cao',
    'weight': 'Cân nặng',
    'ap_hi': 'Huyết áp tâm thu',
    'ap_lo': 'Huyết áp tâm trương',
    'cholesterol': 'Cholesterol',
    'gluc': 'Đường huyết',
    'smoke': 'Hút thuốc',
    'alco': 'Uống rượu',
    'active': 'Vận động',
    'bmi': 'Chỉ số BMI',
    'pulse_pressure': 'Huyết áp hiệu số',
    'hypertension': 'Tiền sử Cao Huyết Áp',
    'heart_disease': 'Tiền sử Bệnh Tim',
    'smoking_history': 'Lịch sử hút thuốc',
    'hbA1c_level': 'Chỉ số HbA1c',
    'blood_glucose_level': 'Đường huyết',
    'ever_married': 'Đã kết hôn',
    'Residence_type': 'Nơi sống',
    'avg_glucose_level': 'Đường huyết trung bình',
    'smoking_status': 'Tình trạng hút thuốc',
    'bp': 'Huyết áp',
    'al': 'Albumin (Nước tiểu)',
    'su': 'Đường (Nước tiểu)',
    'bgr': 'Đường huyết ngẫu nhiên',
    'bu': 'Ure máu',
    'sc': 'Creatinine máu',
    'hemo': 'Hemoglobin',
    'htn': 'Cao Huyết Áp',
    'Age': 'Tuổi',
    'Gender': 'Giới tính',
    'Total_Bilirubin': 'Bilirubin toàn phần',
    'Direct_Bilirubin': 'Bilirubin trực tiếp',
    'Alamine_Aminotransferase': 'Chỉ số ALT',
    'Aspartate_Aminotransferase': 'Chỉ số AST',
  };
  return mapping[feature] || feature;
};

export const getDiseaseDescription = (disease, topFeature = null, topFeatureImpact = 0) => {
  const descriptions = {
    'Heart': 'Bệnh Tim mạch xảy ra khi các mạch máu (động mạch vành) cung cấp oxy cho cơ tim bị thu hẹp hoặc tắc nghẽn, thường do sự tích tụ mảng bám (cholesterol).',
    'Diabetes': 'Đái tháo đường Type 2 là tình trạng cơ thể kháng hoặc không sản xuất đủ Insulin để đưa đường (Glucose) vào tế bào, khiến đường huyết luôn ở mức cao.',
    'Stroke': 'Đột quỵ (Tai biến mạch máu não) xảy ra khi dòng máu cung cấp cho một phần của não bộ bị tắc nghẽn (nhồi máu) hoặc vỡ mạch máu (xuất huyết).',
    'Kidney': 'Bệnh Thận mạn tính là sự suy giảm từ từ chức năng lọc chất thải và chất lỏng dư thừa khỏi máu của thận.',
    'Liver': 'Bệnh Gan bao gồm các tổn thương như viêm gan, gan nhiễm mỡ, hoặc xơ gan, làm suy giảm khả năng lọc độc tố và chuyển hóa của cơ thể.',
    'Healthy': 'Hiện tại các chỉ số sức khỏe của bạn đang ở mức an toàn. Hãy tiếp tục duy trì lối sống lành mạnh!'
  };

  const baseDesc = descriptions[disease] || 'Vui lòng tham khảo ý kiến bác sĩ để biết thêm chi tiết.';
  let deepEval = null;

  if (topFeature && disease !== 'Healthy') {
    const isPositiveImpact = topFeatureImpact > 0;
    
    if (disease === 'Heart') {
      if (['ap_hi', 'ap_lo', 'pulse_pressure'].includes(topFeature)) {
        deepEval = isPositiveImpact 
          ? "Huyết áp của bạn đang là yếu tố nguy cơ tim mạch nổi bật nhất. Tình trạng tăng huyết áp kéo dài có thể làm tăng nguy cơ xơ vữa mạch máu, suy tim và đột quỵ."
          : "Huyết áp của bạn đang được kiểm soát tốt, đây là yếu tố quan trọng giúp bảo vệ hệ tim mạch.";
      } else if (topFeature === 'cholesterol') {
        deepEval = isPositiveImpact
          ? "Cholesterol máu cao đang là yếu tố nguy cơ nổi bật, có thể thúc đẩy quá trình xơ vữa động mạch và làm tăng nguy cơ bệnh tim mạch."
          : "Chỉ số Cholesterol của bạn nằm ở mức an toàn, góp phần làm giảm nguy cơ xơ vữa động mạch.";
      } else if (['bmi', 'weight', 'height_cm', 'weight_kg'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Tình trạng thừa cân hoặc béo phì đang làm tăng áp lực lên hệ tim mạch và liên quan chặt chẽ đến tăng huyết áp, rối loạn mỡ máu và bệnh tim mạch."
          : "Chỉ số hình thể (BMI/Cân nặng) của bạn khá tốt, giúp giảm thiểu gánh nặng cho hệ tim mạch.";
      } else if (topFeature === 'gluc' || topFeature === 'blood_glucose_level' || topFeature === 'hbA1c_level') {
        deepEval = isPositiveImpact
          ? "Đường huyết cao kéo dài có thể gây tổn thương thành mạch máu và làm tăng nguy cơ biến chứng tim mạch."
          : "Đường huyết của bạn đang ổn định, giúp ngăn ngừa tổn thương mạch máu.";
      } else if (['age', 'Age'].includes(topFeature)) {
         deepEval = isPositiveImpact
          ? "Tuổi tác là một yếu tố nguy cơ tự nhiên không thể thay đổi đối với bệnh tim mạch."
          : "Độ tuổi của bạn hiện tại là một lợi thế tự nhiên giúp hệ tim mạch khỏe mạnh.";
      }
    } else if (disease === 'Diabetes') {
      if (['blood_glucose_level', 'hbA1c_level', 'gluc'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Chỉ số đường huyết hoặc HbA1c của bạn đang cao hơn mức khuyến nghị, cho thấy nguy cơ rối loạn kiểm soát đường huyết và tiểu đường type 2."
          : "Chỉ số đường huyết và HbA1c của bạn đang được kiểm soát xuất sắc, cho thấy cơ thể xử lý đường rất tốt.";
      } else if (['bmi', 'weight', 'height_cm', 'weight_kg'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Thừa cân hoặc béo phì có liên quan mật thiết đến tình trạng kháng insulin, làm tăng nguy cơ mắc tiểu đường type 2."
          : "Cân nặng hợp lý của bạn giúp duy trì độ nhạy của insulin, phòng ngừa tốt bệnh tiểu đường.";
      } else if (['age', 'Age'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Nguy cơ mắc tiểu đường type 2 tăng lên theo tuổi tác do sự suy giảm chức năng tụy."
          : "Tuổi tác của bạn là yếu tố thuận lợi, giúp giảm nguy cơ kháng insulin.";
      }
    } else if (disease === 'Kidney') {
      if (['sc', 'bu', 'SerumCreatinine', 'BloodUrea'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Chỉ số Ure/Creatinine tăng cho thấy chức năng lọc của thận có thể đang bị suy giảm."
          : "Chức năng lọc của thận (Ure/Creatinine) đang hoạt động rất tốt để đào thải độc tố.";
      } else if (['al', 'Albumin_Urine'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Sự xuất hiện Albumin trong nước tiểu là dấu hiệu cho thấy màng lọc cầu thận có thể đang bị tổn thương."
          : "Không có dấu hiệu tổn thương cầu thận qua chỉ số nước tiểu.";
      } else if (['bp', 'SystolicBP', 'DiastolicBP', 'ap_hi', 'ap_lo'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Huyết áp cao kéo dài có thể gây tổn thương các mạch máu nhỏ trong thận và làm tăng nguy cơ suy giảm chức năng thận."
          : "Huyết áp ổn định giúp duy trì sự khỏe mạnh của các vi mạch trong thận.";
      } else if (['hemo', 'Hemoglobin'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Thiếu máu (Hemoglobin thấp) thường là biến chứng phổ biến khi chức năng thận suy giảm do giảm sản xuất Erythropoietin."
          : "Chỉ số Hemoglobin ổn định cho thấy không có dấu hiệu thiếu máu liên quan đến thận.";
      }
    } else if (disease === 'Liver') {
      if (['Alamine_Aminotransferase', 'Aspartate_Aminotransferase', 'ALT_SGPT', 'AST_SGOT'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Men gan AST/ALT tăng cho thấy tế bào gan có thể đang bị tổn thương hoặc viêm."
          : "Chỉ số men gan ổn định cho thấy tế bào gan của bạn đang khỏe mạnh và không bị viêm tấy.";
      } else if (['Total_Bilirubin', 'Direct_Bilirubin'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Bilirubin tăng có thể liên quan đến rối loạn chức năng gan hoặc đường mật, và có thể gây vàng da nếu kéo dài."
          : "Khả năng chuyển hóa Bilirubin của gan đang hoạt động hiệu quả.";
      } else if (['Total_Protiens', 'Albumin_and_Globulin_Ratio'].includes(topFeature)) {
        deepEval = isPositiveImpact
          ? "Bất thường trong chỉ số Protein hoặc Tỷ lệ A/G cảnh báo khả năng tổng hợp chất của gan đang suy giảm."
          : "Khả năng tổng hợp Protein của gan diễn ra bình thường, đáp ứng tốt nhu cầu cơ thể.";
      }
    } else if (disease === 'Stroke') {
       if (['age', 'Age'].includes(topFeature)) {
          deepEval = isPositiveImpact
           ? "Tuổi tác lớn làm tăng nguy cơ xơ cứng mạch máu não và đột quỵ."
           : "Độ tuổi của bạn gắn liền với hệ thống mạch máu não còn đàn hồi tốt.";
       } else if (topFeature === 'avg_glucose_level' || topFeature === 'gluc' || topFeature === 'blood_glucose_level') {
          deepEval = isPositiveImpact
           ? "Đường huyết cao làm tổn thương mạch máu não, gia tăng nguy cơ đột quỵ."
           : "Đường huyết được duy trì tốt, giúp bảo vệ thành mạch máu não.";
       } else if (topFeature === 'smoking_status' || topFeature === 'smoke') {
          deepEval = isPositiveImpact
           ? "Hút thuốc lá làm tăng rủi ro hình thành cục máu đông và xơ vữa mạch máu não."
           : "Thói quen không hút thuốc (hoặc đã bỏ thuốc) đang bảo vệ đáng kể sức khỏe mạch máu của bạn.";
       }
    }
  }

  return { baseDesc, deepEval };
};

export default {
  formatBMI,
  formatBP,
  formatBloodGlucose,
  formatCholesterol,
  formatHeartRate,
  formatTemperature,
  formatPercentage,
  formatDate,
  formatDateTime,
  getBMICategory,
  getBloodPressureCategory,
  getBloodGlucoseCategory,
  translateDisease,
  translateFeature,
  getDiseaseDescription,
};
