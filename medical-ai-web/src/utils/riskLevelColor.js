/**
 * riskLevelColor.js - Ánh xạ mức độ rủi ro sang màu sắc (theme-aware)
 */

export const getRiskLevelColor = (riskLevel) => {
  const colorMap = {
    low: 'success', // green
    medium: 'warning', // yellow
    high: 'danger', // red
    'very high': 'danger', // red (darker if supported)
  };
  return colorMap[riskLevel?.toLowerCase()] || 'default';
};

export const getRiskLevelStyle = (riskLevel) => {
  const styleMap = {
    low: {
      bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20',
      bgHex: '#dcfce7', textHex: '#166534', borderHex: '#22c55e',
    },
    medium: {
      bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20',
      bgHex: '#fef3c7', textHex: '#92400e', borderHex: '#f59e0b',
    },
    high: {
      bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20',
      bgHex: '#fee2e2', textHex: '#991b1b', borderHex: '#ef4444',
    },
    'very high': {
      bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30',
      bgHex: '#ffe4e6', textHex: '#9f1239', borderHex: '#f43f5e',
    },
  };
  return styleMap[riskLevel?.toLowerCase()] || {
    bg: 'bg-glass-500/10', text: 'text-glass-400', border: 'border-glass-500/20',
    bgHex: '#f3f4f6', textHex: '#374151', borderHex: '#d1d5db',
  };
};

export const getRiskLevelLabel = (riskLevel) => {
  const labelMap = {
    low: '✓ Nguy cơ thấp - Tiếp tục duy trì lối sống lành mạnh',
    medium: '⚠️ Nguy cơ trung bình - Cần thực hiện biện pháp phòng ngừa',
    high: '🚨 Nguy cơ cao - Nên tham khảo ý kiến bác sĩ',
    'very high': '🆘 Nguy cơ rất cao - Cần khám và điều trị y tế ngay lập tức',
  };
  return labelMap[riskLevel?.toLowerCase()] || 'Chưa xác định';
};

export const getProbabilityColor = (probability) => {
  if (probability < 0.3) return 'success';
  if (probability < 0.6) return 'warning';
  return 'danger';
};

export const getProbabilityLabel = (probability) => {
  if (probability < 0.3) return 'Thấp';
  if (probability < 0.6) return 'Trung bình';
  return 'Cao';
};

export default {
  getRiskLevelColor,
  getRiskLevelStyle,
  getRiskLevelLabel,
  getProbabilityColor,
  getProbabilityLabel,
};
