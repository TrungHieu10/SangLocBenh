/**
 * ClinicalForm - Multi-step form nhập dữ liệu khám sức khỏe cho 42 chỉ số ML
 * With per-step validation and step locking
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FormStepper from '../components/forms/FormStepper';
import MetricInputGroup from '../components/forms/MetricInputGroup';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import clinicalApi from '../api/clinicalApi';
import axiosClient from '../api/axiosClient';
import useAuth from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, HeartPulse, User, FlaskConical, Stethoscope, Upload, Image as ImageIcon } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export const ClinicalForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { patientForNurse, isEdit, checkupId, initialData } = location.state || {};
  
  const [testPatients, setTestPatients] = useState([]);
  const [testIndex, setTestIndex] = useState(0);
  
  useEffect(() => {
    // Nếu là Y tá mà chưa chọn bệnh nhân thì quay về dashboard
    if (user && user.role === 'Nurse' && !patientForNurse) {
      toast.error('Vui lòng tìm kiếm hoặc tạo bệnh nhân trước khi nhập phiếu khám!');
      navigate('/nurse/dashboard');
      return;
    }

    fetch('/test_data/real_test_patients.json')
      .then(r => r.json())
      .then(data => setTestPatients(data))
      .catch(e => console.log('Error loading test data', e));
  }, [user, patientForNurse, navigate]);

  const loadRandomSample = () => {
    if (!testPatients.length) {
      alert('Đang tải dữ liệu mẫu, vui lòng thử lại sau 1 giây.');
      return;
    }
    
    const randomPatient = testPatients[testIndex];
    setTestIndex((prev) => (prev + 1) % testPatients.length);

    const updated = { ...formData };
    
    Object.keys(randomPatient).forEach(key => {
      if (!key.startsWith('_')) {
        updated[key] = randomPatient[key];
      }
    });
    
    setFormData(updated);
    setStepErrors({});

    // Bắt buộc chuyển các đơn vị về chuẩn VN vì file JSON mẫu lưu chuẩn VN
    setUnits({
      bloodGlucose: 'mmol/L',
      cholesterol_Total: 'mmol/L',
      serumCreatinine: 'umol/L',
      hemoglobin: 'g/dL',
      totalBilirubin: 'umol/L',
      directBilirubin: 'umol/L',
      total_Protiens: 'g/L',
      albumin_Blood: 'g/L',
      packedCellVolume_pcv: '%',
      whiteBloodCell_wc: 'cells/cumm'
    });

    
    alert(`Đã điền mẫu bệnh nhân: ${randomPatient._label_vi}\nKịch bản: ${randomPatient._scenario}\nNguồn: ${randomPatient._source}`);
  };

  // Validation states
  const [stepErrors, setStepErrors] = useState({});
  const [stepsCompleted, setStepsCompleted] = useState({});
  const [showMissingDataModal, setShowMissingDataModal] = useState(false);

  const [units, setUnits] = useState({
    bloodGlucose: 'mg/dL',
    cholesterol_Total: 'mg/dL',
    serumCreatinine: 'mg/dL',
    hemoglobin: 'g/dL',
    totalBilirubin: 'mg/dL',
    directBilirubin: 'mg/dL',
    total_Protiens: 'g/dL',
    albumin_Blood: 'g/dL',
    packedCellVolume_pcv: '%',
    whiteBloodCell_wc: 'cells/cumm'
  });

  // Khóa localStorage cho riêng từng user hoặc bệnh nhân
  const storageKey = patientForNurse 
    ? `lastClinicalMetrics_patient_${patientForNurse.id}` 
    : (user?.id ? `lastClinicalMetrics_${user.id}` : 'lastClinicalMetrics');

  // 26 Features matching the ML model backend
  const [formData, setFormData] = useState({
    // Step 1: Cơ bản & Sinh hiệu
    age: '',
    gender: '', // 1: Nam, 0: Nữ
    height_cm: '',
    weight_kg: '',
    systolicBP: '',
    diastolicBP: '',

    // Step 2: Tiền sử & Lối sống
    smokingStatus: '', // 0, 1, 2
    alcoholConsumption: false,
    physicalActivity: false,
    hypertension_History: false,
    heartDisease_History: false,

    // Step 3: Xã hội
    everMarried: false,
    workType: '', // 0, 1, 2, 3, 4
    residenceType: '', // 1: Thành thị, 0: Nông thôn

    // Step 4: Xét nghiệm (Lab Tests)
    bloodGlucose: '',
    hbA1c: '',
    cholesterol_Total: '',
    serumCreatinine: '',
    bloodUrea: '',
    albumin_Urine: '',
    sugar_Urine: '',
    alt_SGPT: '',
    ast_SGOT: '',
    totalBilirubin: '',
    directBilirubin: '',
    hemoglobin: '',
    alkaline_Phosphotase: '',
    total_Protiens: '',
    albumin_Blood: '',
    a_G_Ratio: '',
    specificGravity_sg: '',
    packedCellVolume_pcv: '',
    whiteBloodCell_wc: '',
    redBloodCell_rc: '',
    sodium_sod: '',
    potassium_pot: '',
    pusCells_pc: '',
    pusCellClumps_pcc: '',
    bacteria_ba: '',
    appetite_appet: '',
    pedalEdema_pe: false,
    anemia_ane: false
  });


  useEffect(() => {
    if (!user) return; // Chỉ lấy khi đã có thông tin user
    
    const saved = localStorage.getItem(storageKey);
    let hasLoadedFromCache = false;

    if (isEdit && initialData) {
      setFormData(prev => {
        const updated = { ...prev };
        
        // Map case-insensitive
        const formKeys = Object.keys(updated);
        
        Object.keys(initialData).forEach(key => {
          if (initialData[key] !== null && initialData[key] !== undefined) {
             // Thử tìm chính xác
             if (updated[key] !== undefined) {
                 updated[key] = initialData[key];
             } else {
                 // Tìm không phân biệt hoa thường
                 const matchedKey = formKeys.find(fk => fk.toLowerCase() === key.toLowerCase());
                 if (matchedKey) {
                     updated[matchedKey] = initialData[key];
                 }
             }
          }
        });
        
        // Cập nhật lại tuổi và giới tính từ thông tin gốc nếu chưa có
        if (!updated.age && patientForNurse && patientForNurse.dateOfBirth) {
           const birthDate = new Date(patientForNurse.dateOfBirth);
           const today = new Date();
           let calcAge = today.getFullYear() - birthDate.getFullYear();
           const m = today.getMonth() - birthDate.getMonth();
           if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
             calcAge--;
           }
           updated.age = calcAge > 0 ? calcAge : 1;
        }
        
        if (updated.gender === '' || updated.gender === undefined) {
           if (patientForNurse && patientForNurse.gender !== undefined && patientForNurse.gender !== null) {
              updated.gender = patientForNurse.gender;
           } else if (user && user.gender !== undefined && user.gender !== null) {
              updated.gender = user.gender === 'Male' || user.gender === 1 || user.gender === '1' ? 1 : 0;
           }
        }
        
        return updated;
      });
      setAutoFilled(true);
      return;
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          setFormData(prev => ({ ...prev, ...parsed.formData }));
          hasLoadedFromCache = true;
          setAutoFilled(true);
        } else {
          // Backward compatibility
          setFormData(prev => ({ ...prev, ...parsed }));
          hasLoadedFromCache = true;
          setAutoFilled(true);
        }
        if (parsed.units) setUnits(parsed.units);
      } catch (e) {
        console.error("Lỗi đọc cache local:", e);
      }
    }

    if (!hasLoadedFromCache) {
      // Nếu không có cache, lấy từ API lượt khám gần nhất
      const fetchLatestCheckup = async () => {
        try {
          const data = await clinicalApi.getHistory({ page: 1, pageSize: 1, sortBy: '-createdAt' });
          if (data && data.items && data.items.length > 0) {
            const latest = data.items[0];
            const metrics = latest.metrics || {};
            
            // Lọc ra những trường dữ liệu cơ bản không thường xuyên thay đổi
            const fieldsToAutoFill = [
              'height_cm', 'weight_kg', 'smokingStatus', 'alcoholConsumption', 
              'physicalActivity', 'hypertension_History', 'heartDisease_History', 
              'everMarried', 'workType', 'residenceType'
            ];
            
            setFormData(prev => {
              const updated = { ...prev };
              fieldsToAutoFill.forEach(key => {
                // Handle different casing from API (metrics might be PascalCase or camelCase)
                const apiValue = metrics[key] !== undefined ? metrics[key] : 
                               (metrics[key.charAt(0).toUpperCase() + key.slice(1)] !== undefined ? metrics[key.charAt(0).toUpperCase() + key.slice(1)] : null);
                
                if (apiValue !== null) {
                  updated[key] = apiValue;
                }
              });

              // Tính toán tuổi và giới tính từ profile bệnh nhân (nếu có) hoặc user
              if (patientForNurse && patientForNurse.dateOfBirth) {
                const birthDate = new Date(patientForNurse.dateOfBirth);
                const today = new Date();
                let calcAge = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  calcAge--;
                }
                updated.age = calcAge > 0 ? calcAge : 1;
              } else if (user.dateOfBirth) {
                const birthDate = new Date(user.dateOfBirth);
                const today = new Date();
                let calcAge = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  calcAge--;
                }
                updated.age = calcAge > 0 ? calcAge : 1;
              }
              
              if (patientForNurse && patientForNurse.gender !== undefined) {
                updated.gender = patientForNurse.gender;
              } else if (user.gender !== undefined && user.gender !== null) {
                updated.gender = user.gender === 'Male' ? 1 : (user.gender === 'Female' ? 0 : user.gender);
              }

              return updated;
            });
            setAutoFilled(true);
          } else {
            // Nếu chưa khám bao giờ, vẫn lấy tuổi và giới tính từ profile
            setFormData(prev => {
              const updated = { ...prev };
              if (patientForNurse && patientForNurse.dateOfBirth) {
                const birthDate = new Date(patientForNurse.dateOfBirth);
                const today = new Date();
                let calcAge = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  calcAge--;
                }
                updated.age = calcAge > 0 ? calcAge : 1;
              } else if (user.dateOfBirth) {
                const birthDate = new Date(user.dateOfBirth);
                const today = new Date();
                let calcAge = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  calcAge--;
                }
                updated.age = calcAge > 0 ? calcAge : 1;
              }
              
              if (patientForNurse && patientForNurse.gender !== undefined) {
                updated.gender = patientForNurse.gender;
              } else if (user.gender !== undefined && user.gender !== null) {
                updated.gender = user.gender === 'Male' || user.gender === 1 || user.gender === '1' ? 1 : 0;
              }
              return updated;
            });
          }
        } catch (err) {
          console.error("Lỗi lấy dữ liệu khám cũ:", err);
        }
      };
      
      fetchLatestCheckup();
    }
  }, [user, storageKey]);

  const handleUnitChange = (name, unit) => {
    setUnits(prev => ({ ...prev, [name]: unit }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Vui lòng chọn một tệp hình ảnh hoặc PDF hợp lệ.');
      return;
    }

    setOcrLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1];
        
        try {
          const response = await clinicalApi.extractOcr(base64String, file.type);
          
          let parsedData = response.data;
          // Nếu data trả về là string thì parse
          if (typeof parsedData === 'string') {
             try {
               // Trích xuất phần JSON từ text bất kỳ (phòng trường hợp AI trả lời dài dòng)
               const jsonMatch = parsedData.match(/\{[\s\S]*\}/);
               if (jsonMatch) {
                  parsedData = JSON.parse(jsonMatch[0]);
               } else {
                  let cleanStr = parsedData.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
                  parsedData = JSON.parse(cleanStr);
               }
             } catch (e) {
               console.error('Lỗi parse JSON OCR', e);
               console.log('Raw data from OCR:', parsedData);
             }
          }

          // Tự động nhận diện đơn vị và đổi dropdown
          if (parsedData && parsedData.detected_units) {
            const detectedUnits = parsedData.detected_units;
            setUnits(prev => {
              const newUnits = { ...prev };
              for (const [key, detectedUnit] of Object.entries(detectedUnits)) {
                if (detectedUnit) {
                  const unitLower = detectedUnit.toString().toLowerCase();
                  if (unitLower.includes('mmol')) newUnits[key] = 'mmol/L';
                  else if (unitLower.includes('umol') || unitLower.includes('µmol') || (unitLower.includes('mol/l') && !unitLower.includes('mmol'))) newUnits[key] = 'umol/L';
                  else if (unitLower.includes('mg/dl')) newUnits[key] = 'mg/dL';
                  else if (unitLower.includes('g/l') && !unitLower.includes('g/dl')) newUnits[key] = 'g/L';
                  else if (unitLower.includes('g/dl')) newUnits[key] = 'g/dL';
                  else if (key === 'packedCellVolume_pcv' && unitLower.includes('l/l')) newUnits[key] = 'L/L';
                  else if (key === 'packedCellVolume_pcv' && unitLower.includes('%')) newUnits[key] = '%';
                  else if (key === 'whiteBloodCell_wc' && (unitLower.includes('10^9') || unitLower.includes('g/l') || unitLower.includes('10*9'))) newUnits[key] = '10^9/L';
                  else if (key === 'whiteBloodCell_wc' && unitLower.includes('cumm')) newUnits[key] = 'cells/cumm';
                }
              }
              return newUnits;
            });
            delete parsedData.detected_units;
          }

          if (!parsedData || typeof parsedData !== 'object') {
             console.error('Invalid parsedData:', parsedData);
             setError('Mô hình AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.');
             setOcrLoading(false);
             return;
          }
          
          const extracted = {};
          Object.keys(parsedData).forEach(key => {
            let rawValue = parsedData[key];
            if (rawValue !== null && rawValue !== undefined && rawValue !== "" && rawValue !== "N/A" && rawValue !== "null") {
               // Đảm bảo kiểu số, loại bỏ dấu phẩy nếu có
               let valStr = String(rawValue).replace(',', '.');
               let valNum = parseFloat(valStr);
               if (!isNaN(valNum)) {
                  extracted[key] = valNum;
               }
            }
          });
          
          if (Object.keys(extracted).length > 0) {
            setFormData(prev => {
              const next = { ...prev };
              for (const key in extracted) {
                // Nếu giá trị cũ trống hoặc là 0, luôn nhận giá trị mới
                if (prev[key] === '' || prev[key] === null || prev[key] === undefined || prev[key] === 0 || prev[key] === '0') {
                  next[key] = extracted[key];
                } else {
                  // Nếu giá trị cũ đã có (ví dụ 5.5 từ ảnh xét nghiệm máu)
                  // và ảnh mới (xét nghiệm nước tiểu) trả về 0 cho chỉ số đó -> bỏ qua không ghi đè
                  if (extracted[key] !== 0) {
                    next[key] = extracted[key];
                  }
                }
              }
              return next;
            });
          } else {
             setError('Không tìm thấy chỉ số nào trong ảnh.');
          }
        } catch (err) {
          setError('Lỗi khi đọc ảnh: ' + (err.message || 'Server error'));
        } finally {
          setOcrLoading(false);
          // Clear input file
          e.target.value = null;
        }
      };
      reader.onerror = () => {
         setError('Lỗi khi đọc file ảnh.');
         setOcrLoading(false);
      };
    } catch (err) {
      setError('Lỗi không xác định.');
      setOcrLoading(false);
    }
  };

  // ========== Định nghĩa Form Fields ==========
  const basicMetrics = [
    { name: 'age', label: 'Tuổi', type: 'number', placeholder: 'VD: 45', required: true, step: '1' },
    { 
      name: 'gender', 
      label: 'Giới tính', 
      type: 'select', 
      placeholder: 'Chọn giới tính', 
      required: true,
      options: [
        { label: 'Nam', value: 1 },
        { label: 'Nữ', value: 0 }
      ]
    },
    { name: 'height_cm', label: 'Chiều cao (cm)', type: 'number', placeholder: 'VD: 165', required: true, step: '0.1' },
    { name: 'weight_kg', label: 'Cân nặng (kg)', type: 'number', placeholder: 'VD: 60', required: true, step: '0.1' },
    { name: 'systolicBP', label: 'Huyết áp tâm thu (mmHg)', type: 'number', placeholder: 'VD: 120', required: true, step: '1' },
    { name: 'diastolicBP', label: 'Huyết áp tâm trương (mmHg)', type: 'number', placeholder: 'VD: 80', required: true, step: '1' },
  ];

  const lifestyleMetrics = [
    { 
      name: 'smokingStatus', 
      label: 'Tình trạng hút thuốc', 
      type: 'select', 
      required: true,
      options: [
        { label: 'Chưa bao giờ hút thuốc', value: 0 },
        { label: 'Đã từng hút (hiện tại đã bỏ)', value: 1 },
        { label: 'Đang hút thuốc thường xuyên', value: 2 }
      ]
    },
    { name: 'alcoholConsumption', label: 'Có uống rượu bia?', type: 'checkbox' },
    { name: 'physicalActivity', label: 'Có tập thể dục thường xuyên?', type: 'checkbox' },
    { name: 'hypertension_History', label: 'Tiền sử Cao huyết áp?', type: 'checkbox' },
    { name: 'heartDisease_History', label: 'Tiền sử Bệnh tim?', type: 'checkbox' },
  ];

  const socialMetrics = [
    { name: 'everMarried', label: 'Đã từng kết hôn?', type: 'checkbox' },
    { 
      name: 'workType', 
      label: 'Đặc thù công việc', 
      type: 'select', 
      required: true,
      options: [
        { label: 'Trẻ em / Học sinh sinh viên', value: 0 },
        { label: 'Cán bộ viên chức nhà nước', value: 1 },
        { label: 'Doanh nghiệp tư nhân', value: 2 },
        { label: 'Tự làm chủ / Kinh doanh tự do', value: 3 },
        { label: 'Không làm việc / Ở nhà', value: 4 }
      ]
    },
    { 
      name: 'residenceType', 
      label: 'Khu vực sống', 
      type: 'select', 
      required: true,
      options: [
        { label: 'Nông thôn', value: 0 },
        { label: 'Thành thị', value: 1 }
      ]
    },
  ];

  const labTestMetrics = [
    { name: 'bloodGlucose', label: 'Đường huyết', type: 'number', placeholder: 'VD: 100', step: '0.1', units: ['mg/dL', 'mmol/L'], selectedUnit: units.bloodGlucose, onUnitChange: handleUnitChange },
    { name: 'hbA1c', label: 'Chỉ số HbA1c (%)', type: 'number', placeholder: 'VD: 5.5', step: '0.1' },
    { name: 'cholesterol_Total', label: 'Cholesterol toàn phần', type: 'number', placeholder: 'VD: 180', step: '0.1', units: ['mg/dL', 'mmol/L'], selectedUnit: units.cholesterol_Total, onUnitChange: handleUnitChange },
    { name: 'serumCreatinine', label: 'Creatinine huyết thanh', type: 'number', placeholder: 'VD: 0.9', step: '0.1', units: ['mg/dL', 'umol/L'], selectedUnit: units.serumCreatinine, onUnitChange: handleUnitChange },
    { name: 'bloodUrea', label: 'Ure máu (mmol/L)', type: 'number', placeholder: 'VD: 5', step: '0.1' },
    { 
      name: 'albumin_Urine', 
      label: 'Albumin nước tiểu', 
      type: 'select', 
      options: [
        { label: '0 - Âm tính (Negative)', value: 0 },
        { label: '1 - Vết / Dương tính nhẹ (+)', value: 1 },
        { label: '2 - Dương tính vừa (++)', value: 2 },
        { label: '3 - Dương tính mạnh (+++)', value: 3 },
        { label: '4 - Rất mạnh (++++)', value: 4 }
      ]
    },
    { 
      name: 'sugar_Urine', 
      label: 'Đường nước tiểu', 
      type: 'select', 
      options: [
        { label: '0 - Âm tính (Negative)', value: 0 },
        { label: '1 - Vết / Dương tính nhẹ (+)', value: 1 },
        { label: '2 - Dương tính vừa (++)', value: 2 },
        { label: '3 - Dương tính mạnh (+++)', value: 3 },
        { label: '4 - Rất mạnh (++++)', value: 4 }
      ]
    },
    { name: 'alt_SGPT', label: 'Men gan ALT/SGPT (U/L)', type: 'number', placeholder: 'VD: 25', step: '0.1' },
    { name: 'ast_SGOT', label: 'Men gan AST/SGOT (U/L)', type: 'number', placeholder: 'VD: 20', step: '0.1' },
    { name: 'totalBilirubin', label: 'Bilirubin toàn phần', type: 'number', placeholder: 'VD: 0.8', step: '0.1', units: ['mg/dL', 'umol/L'], selectedUnit: units.totalBilirubin, onUnitChange: handleUnitChange },
    { name: 'directBilirubin', label: 'Bilirubin trực tiếp', type: 'number', placeholder: 'VD: 0.2', step: '0.1', units: ['mg/dL', 'umol/L'], selectedUnit: units.directBilirubin, onUnitChange: handleUnitChange },
    { name: 'hemoglobin', label: 'Hemoglobin', type: 'number', placeholder: 'VD: 14', step: '0.1', units: ['g/dL', 'g/L'], selectedUnit: units.hemoglobin, onUnitChange: handleUnitChange },
  
    { name: 'alkaline_Phosphotase', label: 'Phosphatase kiềm (ALP)', type: 'number', placeholder: 'VD: 200', step: '0.1' },
    { name: 'total_Protiens', label: 'Protein toàn phần', type: 'number', placeholder: 'VD: 6.5', step: '0.1', units: ['g/dL', 'g/L'], selectedUnit: units.total_Protiens, onUnitChange: handleUnitChange },
    { name: 'albumin_Blood', label: 'Albumin máu', type: 'number', placeholder: 'VD: 3.5', step: '0.1', units: ['g/dL', 'g/L'], selectedUnit: units.albumin_Blood, onUnitChange: handleUnitChange },
    { name: 'a_G_Ratio', label: 'Tỷ lệ A/G', type: 'number', placeholder: 'VD: 1.2', step: '0.1' },
    { name: 'specificGravity_sg', label: 'Tỷ trọng nước tiểu (SG)', type: 'number', placeholder: 'VD: 1.02', step: '0.001' },
    { name: 'packedCellVolume_pcv', label: 'Thể tích hồng cầu (PCV)', type: 'number', placeholder: 'VD: 40', step: '0.1', units: ['%', 'L/L'], selectedUnit: units.packedCellVolume_pcv, onUnitChange: handleUnitChange },
    { name: 'whiteBloodCell_wc', label: 'Bạch cầu', type: 'number', placeholder: 'VD: 8000', step: '1', units: ['cells/cumm', '10^9/L'], selectedUnit: units.whiteBloodCell_wc, onUnitChange: handleUnitChange },
    { name: 'redBloodCell_rc', label: 'Hồng cầu (millions/cmm)', type: 'number', placeholder: 'VD: 4.8', step: '0.1' },
    { name: 'sodium_sod', label: 'Natri (mEq/L)', type: 'number', placeholder: 'VD: 140', step: '0.1' },
    { name: 'potassium_pot', label: 'Kali (mEq/L)', type: 'number', placeholder: 'VD: 4.5', step: '0.1' },
    { name: 'pusCells_pc', label: 'Tế bào mủ (Pus Cells)', type: 'select', options: [{label: 'Bình thường (0)', value: 0}, {label: 'Bất thường (1)', value: 1}] },
    { name: 'pusCellClumps_pcc', label: 'Cụm tế bào mủ', type: 'select', options: [{label: 'Không có (0)', value: 0}, {label: 'Có (1)', value: 1}] },
    { name: 'bacteria_ba', label: 'Vi khuẩn (Urine)', type: 'select', options: [{label: 'Không có (0)', value: 0}, {label: 'Có (1)', value: 1}] }
  ];

  const symptomMetrics = [
    { name: 'appetite_appet', label: 'Tình trạng ăn uống', type: 'select', options: [{label: 'Tốt (Bình thường)', value: 0}, {label: 'Chán ăn / Kém', value: 1}] },
    { name: 'pedalEdema_pe', label: 'Có bị phù chân?', type: 'checkbox' },
    { name: 'anemia_ane', label: 'Có bị thiếu máu lâm sàng?', type: 'checkbox' }
  ];

  const steps = ['Sinh hiệu', 'Tiền sử', 'Xã hội', 'Xét nghiệm', 'Triệu chứng', 'Xem lại & Gửi'];

  // ========== Validation Logic ==========
  const validateStep = useCallback((stepIndex) => {
    const errors = {};

    const isEmptyValue = (val) => val === '' || val === null || val === undefined;

    switch (stepIndex) {
      case 0: {
        // Step 1: Patient info - all required
        if (isEmptyValue(formData.age)) {
          errors.age = 'Vui lòng nhập tuổi';
        } else if (Number(formData.age) < 1 || Number(formData.age) > 120) {
          errors.age = 'Tuổi phải từ 1 đến 120';
        }
        if (isEmptyValue(formData.gender) && formData.gender !== 0) {
          errors.gender = 'Vui lòng chọn giới tính';
        }
        if (isEmptyValue(formData.height_cm)) {
          errors.height_cm = 'Vui lòng nhập chiều cao';
        } else if (Number(formData.height_cm) < 50 || Number(formData.height_cm) > 250) {
          errors.height_cm = 'Chiều cao phải từ 50 đến 250 cm';
        }
        if (isEmptyValue(formData.weight_kg)) {
          errors.weight_kg = 'Vui lòng nhập cân nặng';
        } else if (Number(formData.weight_kg) < 10 || Number(formData.weight_kg) > 300) {
          errors.weight_kg = 'Cân nặng phải từ 10 đến 300 kg';
        }
        if (isEmptyValue(formData.systolicBP)) {
          errors.systolicBP = 'Vui lòng nhập huyết áp tâm thu';
        } else if (Number(formData.systolicBP) < 70 || Number(formData.systolicBP) > 260) {
          errors.systolicBP = 'Huyết áp tâm thu phải từ 70 đến 260 mmHg';
        }
        if (isEmptyValue(formData.diastolicBP)) {
          errors.diastolicBP = 'Vui lòng nhập huyết áp tâm trương';
        } else if (Number(formData.diastolicBP) < 40 || Number(formData.diastolicBP) > 150) {
          errors.diastolicBP = 'Huyết áp tâm trương phải từ 40 đến 150 mmHg';
        } else if (!isEmptyValue(formData.systolicBP) && Number(formData.systolicBP) <= Number(formData.diastolicBP)) {
          errors.diastolicBP = 'Huyết áp tâm trương phải nhỏ hơn tâm thu';
        }
        break;
      }
      case 1: {
        // Step 2: Lifestyle - smokingStatus is required (select), checkboxes are always valid
        if (isEmptyValue(formData.smokingStatus) && formData.smokingStatus !== 0) {
          errors.smokingStatus = 'Vui lòng chọn tình trạng hút thuốc';
        }
        break;
      }
      case 2: {
        // Step 3: Social - workType and residenceType are required selects
        if (isEmptyValue(formData.workType) && formData.workType !== 0) {
          errors.workType = 'Vui lòng chọn đặc thù công việc';
        }
        if (isEmptyValue(formData.residenceType) && formData.residenceType !== 0) {
          errors.residenceType = 'Vui lòng chọn khu vực sống';
        }
        break;
      }
      case 3: {
        // Step 4: Lab tests - optional fields, no strict validation needed
        // But if values are entered, validate they are reasonable numbers
        const numericFields = [
          'bloodGlucose', 'hbA1c', 'cholesterol_Total', 'serumCreatinine',
          'bloodUrea', 'albumin_Urine', 'sugar_Urine', 'alt_SGPT',
          'ast_SGOT', 'totalBilirubin', 'directBilirubin', 'hemoglobin',
          'alkaline_Phosphotase', 'total_Protiens', 'albumin_Blood', 'a_G_Ratio',
          'specificGravity_sg', 'packedCellVolume_pcv', 'whiteBloodCell_wc',
          'redBloodCell_rc', 'sodium_sod', 'potassium_pot'
        ];
        numericFields.forEach(field => {
          const val = formData[field];
          if (!isEmptyValue(val) && (isNaN(Number(val)) || Number(val) < 0)) {
            errors[field] = 'Giá trị không hợp lệ';
          }
        });
        break;
      }
      case 4:
        // Symptoms - no strict validation needed
        break;
      case 5:
        // Review step - no validation needed
        break;
      default:
        break;
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }, [formData]);

  // Check if all previous steps are valid (for step locking)
  const areAllPreviousStepsValid = useCallback((targetStep) => {
    for (let i = 0; i < targetStep; i++) {
      const { valid } = validateStep(i);
      if (!valid) return false;
    }
    return true;
  }, [validateStep]);

  // Compute validated and locked steps for the stepper
  const validatedSteps = {};
  const lockedSteps = {};
  for (let i = 0; i < steps.length; i++) {
    if (stepsCompleted[i]) {
      const { valid } = validateStep(i);
      validatedSteps[i] = valid;
    }
    // A step is locked if any previous step is not yet valid
    if (i > 0) {
      lockedSteps[i] = !areAllPreviousStepsValid(i);
    }
  }

  const handleInputChange = (name, value) => {
    // Ép kiểu number cho các ô select (ngoại trừ checkbox tự trả boolean)
    let finalValue = value;
    if (typeof value === 'string' && value !== '') {
      // Nếu là chuỗi số thì parse sang float (để api nhận đúng chuẩn số liệu)
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && String(parsed) === value) {
         finalValue = parsed;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    
    // Clear error for this field when user types
    if (stepErrors[name]) {
      setStepErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleNext = () => {
    // Validate current step before moving to next
    const { valid, errors } = validateStep(currentStep);
    
    // Mark current step as completed (visited)
    setStepsCompleted(prev => ({ ...prev, [currentStep]: true }));
    
    if (!valid) {
      setStepErrors(errors);
      setError('Vui lòng điền đầy đủ thông tin bắt buộc trước khi tiếp tục.');
      return;
    }
    
    // Clear errors if valid
    setStepErrors({});
    setError('');
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setStepErrors({});
      setError('');
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (index) => {
    // Can always go back to previous steps
    if (index < currentStep) {
      // Mark current step as completed before going back
      setStepsCompleted(prev => ({ ...prev, [currentStep]: true }));
      setStepErrors({});
      setError('');
      setCurrentStep(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // To go forward, all previous steps must be valid
    if (index > currentStep) {
      // Validate current step first
      const { valid: currentValid, errors: currentErrors } = validateStep(currentStep);
      setStepsCompleted(prev => ({ ...prev, [currentStep]: true }));
      
      if (!currentValid) {
        setStepErrors(currentErrors);
        setError('Vui lòng hoàn thành bước hiện tại trước khi chuyển bước.');
        return;
      }
      
      // Check all steps between current and target
      if (!areAllPreviousStepsValid(index)) {
        setError('Vui lòng hoàn thành các bước trước đó.');
        return;
      }
      
      setStepErrors({});
      setError('');
      setCurrentStep(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    for (let i = 0; i < steps.length - 1; i++) {
      const { valid, errors } = validateStep(i);
      if (!valid) {
        setCurrentStep(i);
        setStepErrors(errors);
        setError('Vui lòng kiểm tra lại thông tin ở bước ' + (i + 1) + '.');
        return;
      }
    }

    // Check for missing lab tests
    const labTestFields = [
      'bloodGlucose', 'hbA1c', 'cholesterol_Total', 'serumCreatinine',
      'bloodUrea', 'albumin_Urine', 'sugar_Urine', 'alt_SGPT',
      'ast_SGOT', 'totalBilirubin', 'directBilirubin', 'hemoglobin',
      'alkaline_Phosphotase', 'total_Protiens', 'albumin_Blood', 'a_G_Ratio',
      'specificGravity_sg', 'packedCellVolume_pcv', 'whiteBloodCell_wc',
      'redBloodCell_rc', 'sodium_sod', 'potassium_pot'
    ];
    
    const hasMissingLabTests = labTestFields.some(field => 
      formData[field] === '' || formData[field] === null || formData[field] === undefined
    );

    if (hasMissingLabTests) {
      setShowMissingDataModal(true);
    } else {
      processSubmit();
    }
  };

  const processSubmit = async () => {
    setShowMissingDataModal(false);
    setLoading(true);
    setError('');

    // Chuyển toàn bộ các chuỗi rỗng thành 0 hoặc null nếu cần, 
    // ở đây do API backend cần đúng định dạng 26 cột, ta gửi luôn
    const payload = { ...formData };
    
    // Đảm bảo ép đúng số và chuyển chuỗi rỗng sang null để C# binding đúng
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string') {
        if (payload[key] === '') {
          payload[key] = null;
        } else {
          payload[key] = parseFloat(payload[key]);
        }
      }
    });

    // Unit Conversions before sending to ML API
    // DB now expects VN Units (mmol/L, umol/L, g/dL). So if user selects US units (mg/dL), we MUST convert to VN units!
    if (units.bloodGlucose === 'mg/dL' && payload.bloodGlucose) {
       payload.bloodGlucose = parseFloat((payload.bloodGlucose / 18).toFixed(2));
    }
    if (units.cholesterol_Total === 'mg/dL' && payload.cholesterol_Total) {
       payload.cholesterol_Total = parseFloat((payload.cholesterol_Total / 38.67).toFixed(2));
    }
    if (units.serumCreatinine === 'mg/dL' && payload.serumCreatinine) {
       payload.serumCreatinine = parseFloat((payload.serumCreatinine * 88.4).toFixed(2));
    }
    if (units.hemoglobin === 'g/L' && payload.hemoglobin) {
       payload.hemoglobin = parseFloat((payload.hemoglobin / 10).toFixed(2));
    }
    if (units.totalBilirubin === 'mg/dL' && payload.totalBilirubin) {
       payload.totalBilirubin = parseFloat((payload.totalBilirubin * 17.1).toFixed(2));
    }
    if (units.directBilirubin === 'mg/dL' && payload.directBilirubin) {
       payload.directBilirubin = parseFloat((payload.directBilirubin * 17.1).toFixed(2));
    }
    if (units.total_Protiens === 'g/L' && payload.total_Protiens) {
       payload.total_Protiens = parseFloat((payload.total_Protiens / 10).toFixed(2));
    }
    if (units.albumin_Blood === 'g/L' && payload.albumin_Blood) {
       payload.albumin_Blood = parseFloat((payload.albumin_Blood / 10).toFixed(2));
    }

    // Lưu các chỉ số tĩnh vào localStorage để lần sau điền tự động
    const staticMetrics = {
      formData: {
        age: payload.age,
        gender: payload.gender,
        height_cm: payload.height_cm,
        weight_kg: payload.weight_kg,
        smokingStatus: payload.smokingStatus,
        alcoholConsumption: payload.alcoholConsumption,
        physicalActivity: payload.physicalActivity,
        hypertension_History: payload.hypertension_History,
        heartDisease_History: payload.heartDisease_History,
        everMarried: payload.everMarried,
        workType: payload.workType,
        residenceType: payload.residenceType
      },
      units: units
    };
    localStorage.setItem(storageKey, JSON.stringify(staticMetrics));
    localStorage.setItem('latest_submitted_age', payload.age);
    localStorage.setItem('latest_submitted_gender', payload.gender);

    try {
      let response;
      if (user?.role === 'Nurse' && patientForNurse) {
        // Y tá nộp thay bệnh nhân
        if (isEdit) {
          const res = await axiosClient.put(`/nurse/update-checkup/${checkupId}`, payload);
          response = res.data.data || res.data;
        } else {
          const res = await axiosClient.post('/nurse/submit-checkup', {
            ...payload,
            patientId: patientForNurse.id
          });
          response = res.data.data || res.data;
        }
      } else {
        // Bệnh nhân tự nộp
        response = await clinicalApi.submitCheckup(payload);
      }
      
      navigate(`/result/${response.checkupId}`);
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi dữ liệu khám sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  // Helper render view lại thông tin
  const renderReviewItem = (label, value, type, options, unit) => {
    let displayVal = value;
    if (type === 'checkbox') displayVal = value ? 'Có' : 'Không';
    else if (type === 'select' && options) {
      const opt = options.find(o => String(o.value) === String(value));
      if (opt) displayVal = opt.label;
    }

    let finalLabel = label;
    let finalUnit = unit;

    // Extract unit from label if it exists e.g. "Ure máu (mg/dL)"
    const match = label.match(/(.*?)\s*\((.*?)\)$/);
    if (match) {
      const insideBrackets = match[2].trim();
      // Only extract if it looks like a unit (has slash, %, or known unit keywords)
      const isUnit = /[/%\^]|kg|cm|mmHg|mg|mmol|umol|g\/|cells|millions|mEq/i.test(insideBrackets);
      
      if (isUnit) {
        finalLabel = match[1].trim();
        if (!finalUnit) {
          finalUnit = insideBrackets;
        }
      }
    }

    if (displayVal !== '' && displayVal !== undefined && displayVal !== null && finalUnit) {
      displayVal = `${displayVal} ${finalUnit}`;
    }

    return (
      <div key={label}>
        <p className="text-xs text-glass-500 font-medium">{finalLabel}</p>
        <p className="font-semibold text-glass-100">{displayVal !== '' && displayVal !== undefined ? displayVal : '--'}</p>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="animate-fade-in">
            <MetricInputGroup title="Sinh hiệu & Cơ bản" icon={User} metrics={basicMetrics} values={formData} onChange={handleInputChange} errors={stepErrors} />
          </div>
        );
      case 1:
        return (
          <div className="animate-fade-in">
            <MetricInputGroup title="Tiền sử bệnh & Lối sống" icon={HeartPulse} metrics={lifestyleMetrics} values={formData} onChange={handleInputChange} errors={stepErrors} />
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <MetricInputGroup title="Thông tin xã hội & Công việc" icon={User} metrics={socialMetrics} values={formData} onChange={handleInputChange} errors={stepErrors} />
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/10">
              <div>
                <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
                  <ImageIcon size={20} className="text-cyan-400" />
                  Điền tự động bằng ảnh phiếu xét nghiệm
                </h4>
                <p className="text-sm text-glass-400 mt-1">AI của chúng tôi có thể đọc phiếu xét nghiệm và tự động điền các chỉ số giúp bạn.</p>
              </div>
              <div>
                <input type="file" accept="image/*,application/pdf" id="ocr-upload" className="hidden" onChange={handleImageUpload} disabled={ocrLoading} />
                <label htmlFor="ocr-upload" className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${ocrLoading ? 'bg-midnight-300 text-glass-500' : 'gradient-cyan-teal text-midnight hover:shadow-glow-cyan'}`}>
                  {ocrLoading ? <Spinner size={16} /> : <Upload size={16} />}
                  {ocrLoading ? 'Đang phân tích...' : 'Tải file/ảnh lên'}
                </label>
              </div>
            </div>
            {ocrLoading && (
              <div className="absolute inset-0 bg-midnight/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl transition-all duration-300">
                 <div className="glass-card-elevated p-6 rounded-2xl shadow-glass-lg flex flex-col items-center animate-scale-in">
                    <Spinner size={36} />
                    <p className="mt-4 font-medium text-cyan-300">AI đang đọc phiếu xét nghiệm...</p>
                 </div>
              </div>
            )}
            <MetricInputGroup title="Kết quả Xét nghiệm (Cận lâm sàng)" icon={FlaskConical} metrics={labTestMetrics} values={formData} onChange={handleInputChange} errors={stepErrors} />
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
            <MetricInputGroup title="Triệu chứng lâm sàng" icon={Stethoscope} metrics={symptomMetrics} values={formData} onChange={handleInputChange} errors={stepErrors} />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <Card header={<div className="font-semibold text-base text-glass-100 flex items-center gap-2"><Stethoscope size={18}/> Xem lại thông tin</div>}>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 border-b border-cyan-500/8 pb-2">1. Sinh hiệu cơ bản</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {basicMetrics.map(m => renderReviewItem(m.label, formData[m.name], m.type, m.options, units[m.name]))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 border-b border-cyan-500/8 pb-2">2. Tiền sử & Lối sống</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {lifestyleMetrics.map(m => renderReviewItem(m.label, formData[m.name], m.type, m.options, units[m.name]))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 border-b border-cyan-500/8 pb-2">3. Thông tin xã hội</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {socialMetrics.map(m => renderReviewItem(m.label, formData[m.name], m.type, m.options, units[m.name]))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 border-b border-cyan-500/8 pb-2">4. Xét nghiệm (Cận lâm sàng)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {labTestMetrics.map(m => renderReviewItem(m.label, formData[m.name], m.type, m.options, units[m.name]))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 border-b border-cyan-500/8 pb-2">5. Triệu chứng & Vấn đề lâm sàng</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {symptomMetrics.map(m => renderReviewItem(m.label, formData[m.name], m.type, m.options, units[m.name]))}
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-4 flex gap-3 text-cyan-300">
              <CheckCircle2 className="shrink-0 text-cyan-400 mt-0.5" size={20} />
              <p className="text-sm text-glass-300">
                Bấm <strong className="text-cyan-400">"Gửi kết quả"</strong> để hệ thống AI bắt đầu phân tích dữ liệu 42 chỉ số của bạn.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-glass-50 mb-2">{isEdit ? 'Sửa phiếu khám' : 'Khám sức khỏe'}</h1>
          <p className="text-glass-400 text-sm">
            {isEdit 
              ? 'Cập nhật lại các chỉ số y khoa để AI phân tích lại nguy cơ' 
              : 'Vui lòng nhập 42 chỉ số y khoa để AI phân tích và dự đoán nguy cơ'
            }
          </p>
        </div>
        <Button variant="outline" onClick={loadRandomSample} className="flex gap-2 items-center text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10">
          <FlaskConical size={18} /> Điền mẫu thử (Test)
        </Button>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 mb-8 animate-fade-in stagger-1">
        <FormStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          validatedSteps={validatedSteps}
          lockedSteps={lockedSteps}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex gap-3 items-start animate-shake">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {autoFilled && currentStep === 0 && (
          <div className="mb-6 p-4 bg-cyan-500/8 border border-cyan-500/15 text-cyan-300 rounded-xl flex gap-3 items-start animate-fade-in">
            <CheckCircle2 className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-glass-300">Hệ thống đã tự động điền các thông tin cơ bản từ lần khám trước. Bạn chỉ cần cập nhật chỉ số cận lâm sàng!</p>
          </div>
        )}

        <div className="min-h-[400px]">
          {renderStep()}
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 border-t border-cyan-500/8 pt-6 animate-fade-in stagger-2">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0 || loading}
          className="min-w-[120px]"
        >
          Quay lại
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button variant="primary" onClick={handleNext} className="min-w-[120px]">
            Tiếp theo
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            className="min-w-[160px] shadow-glow-cyan"
          >
            {isEdit ? 'Lưu thay đổi' : 'Gửi kết quả'}
          </Button>
        )}
      </div>

      <Modal 
        isOpen={showMissingDataModal} 
        onClose={() => setShowMissingDataModal(false)}
        title="Xác nhận dữ liệu xét nghiệm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-400">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm leading-relaxed">
              Bạn chưa nhập đầy đủ các chỉ số xét nghiệm cận lâm sàng (ví dụ: Xét nghiệm máu, nước tiểu...).
            </p>
          </div>
          
          <p className="text-glass-300 text-sm leading-relaxed">
            Hệ thống AI sẽ <strong className="text-cyan-400">tự động giả định các chỉ số bạn bỏ trống là hoàn toàn bình thường/khỏe mạnh</strong> để tiến hành phân tích dự đoán mà không làm sai lệch mô hình.
          </p>

          <p className="text-glass-300 text-sm leading-relaxed font-medium">
            Bạn có chắc chắn muốn gửi dữ liệu với các chỉ số hiện tại không?
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowMissingDataModal(false)}>
              Quay lại điền thêm
            </Button>
            <Button variant="primary" onClick={processSubmit} loading={loading}>
              Đồng ý gửi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClinicalForm;