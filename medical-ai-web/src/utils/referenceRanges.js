/**
 * referenceRanges.js
 * Hệ tham chiếu cho các chỉ số xét nghiệm y khoa (Dựa trên chuẩn thông thường / WHO)
 */

export const REFERENCE_RANGES = {
  bloodGlucose: { min: 3.9, max: 5.6, unit: 'mmol/L', label: 'Đường huyết đói' },
  hbA1c: { min: 4.0, max: 5.7, unit: '%', label: 'HbA1c' },
  cholesterol_Total: { min: 0, max: 5.2, unit: 'mmol/L', label: 'Cholesterol toàn phần' },
  bloodUrea: { min: 2.5, max: 7.1, unit: 'mmol/L', label: 'Ure máu' },
  serumCreatinine_Male: { min: 62, max: 115, unit: 'µmol/L', label: 'Creatinine (Nam)' },
  serumCreatinine_Female: { min: 53, max: 97, unit: 'µmol/L', label: 'Creatinine (Nữ)' },
  hemoglobin_Male: { min: 13.0, max: 17.5, unit: 'g/dL', label: 'Hemoglobin (Nam)' },
  hemoglobin_Female: { min: 12.0, max: 15.5, unit: 'g/dL', label: 'Hemoglobin (Nữ)' },
  ast_SGOT: { min: 8, max: 40, unit: 'U/L', label: 'AST (SGOT)' },
  alt_SGPT: { min: 7, max: 56, unit: 'U/L', label: 'ALT (SGPT)' },
  totalBilirubin: { min: 3.4, max: 20.5, unit: 'µmol/L', label: 'Bilirubin toàn phần' },
  directBilirubin: { min: 0, max: 5.1, unit: 'µmol/L', label: 'Bilirubin trực tiếp' },
  systolicBP: { min: 90, max: 120, unit: 'mmHg', label: 'Huyết áp tâm thu' },
  diastolicBP: { min: 60, max: 80, unit: 'mmHg', label: 'Huyết áp tâm trương' },
  alkaline_Phosphotase: { min: 44, max: 147, unit: 'U/L', label: 'Phosphatase kiềm (ALP)' },
  total_Protiens: { min: 6.0, max: 8.3, unit: 'g/dL', label: 'Protein toàn phần' },
  albumin_Blood: { min: 3.5, max: 5.0, unit: 'g/dL', label: 'Albumin máu' },
  a_G_Ratio: { min: 1.1, max: 2.5, unit: '', label: 'Tỉ lệ A/G' },
  specificGravity_sg: { min: 1.005, max: 1.030, unit: '', label: 'Tỷ trọng nước tiểu (SG)' },
  packedCellVolume_pcv: { min: 36, max: 50, unit: '%', label: 'Thể tích hồng cầu (PCV)' },
  whiteBloodCell_wc: { min: 4000, max: 11000, unit: 'cells/µL', label: 'Bạch cầu (WBC)' },
  redBloodCell_rc: { min: 4.2, max: 5.9, unit: 'm/cmm', label: 'Hồng cầu (RBC)' },
  sodium_sod: { min: 135, max: 145, unit: 'mEq/L', label: 'Natri' },
  potassium_pot: { min: 3.5, max: 5.0, unit: 'mEq/L', label: 'Kali' },
};

/**
 * Hàm quy đổi giá trị từ database (chuẩn US: mg/dL) sang đơn vị hiển thị (chuẩn VN: mmol/L, µmol/L)
 * @param {string} key - Tên chỉ số trong DB
 * @param {number} dbValue - Giá trị lưu trong DB
 * @returns {number|null} Giá trị đã quy đổi để hiển thị
 */
export const convertDbToDisplay = (key, dbValue) => {
  if (dbValue === undefined || dbValue === null) return null;
  // OCR và Database lưu số theo chuẩn VN, nên hiển thị trực tiếp, không cần quy đổi nữa.
  return dbValue;
};

/**
 * Hàm đánh giá chỉ số xét nghiệm
 * @param {string} key - Tên chỉ số trong DB (e.g. 'bloodGlucose')
 * @param {number} value - Giá trị hiển thị đã được quy đổi (convertDbToDisplay)
 * @param {number|string} gender - Giới tính (1: Nam, 0: Nữ)
 * @returns {object} - { status: 'normal'|'high'|'low', rangeText: string, min, max, unit }
 */
export const evaluateMetric = (key, value, gender = null) => {
  // Normalize key name (handle case differences)
  let normalizedKey = Object.keys(REFERENCE_RANGES).find(k => k.toLowerCase() === key.toLowerCase());
  
  // Xử lý các chỉ số có phân biệt giới tính
  if (key.toLowerCase() === 'serumcreatinine') {
    const isFemale = gender === 0 || gender === 'Female' || gender === 'Nữ';
    normalizedKey = isFemale ? 'serumCreatinine_Female' : 'serumCreatinine_Male';
  } else if (key.toLowerCase() === 'hemoglobin') {
    const isFemale = gender === 0 || gender === 'Female' || gender === 'Nữ';
    normalizedKey = isFemale ? 'hemoglobin_Female' : 'hemoglobin_Male';
  }

  if (!normalizedKey || value === undefined || value === null) {
    return { status: 'unknown', rangeText: 'Không có tham chiếu', min: null, max: null, unit: '' };
  }

  const range = REFERENCE_RANGES[normalizedKey];
  let status = 'normal';

  if (value > range.max) status = 'high';
  else if (value < range.min) status = 'low';

  return {
    status,
    rangeText: `${range.min} - ${range.max} ${range.unit}`,
    min: range.min,
    max: range.max,
    unit: range.unit,
    label: range.label
  };
};
