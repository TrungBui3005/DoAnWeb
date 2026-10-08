/**
 * Tính BMR (Mifflin-St Jeor Equation)
 */
const calculateBMR = (gender, weightKg, heightCm, age) => {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
};

/**
 * Tính TDEE dựa trên mức độ vận động
 */
const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,          // Ít vận động / Văn phòng
    lightly_active: 1.375,   // Vận động nhẹ (1-3 buổi/tuần)
    moderately_active: 1.55, // Vận động vừa (3-5 buổi/tuần)
    very_active: 1.725       // Vận động nhiều (6-7 buổi/tuần)
  };

  const multiplier = multipliers[activityLevel] || 1.2;
  return bmr * multiplier;
};

const calculateTargetCalories = (tdee, goal, gender) => {
  const adjustment = goal === 'lose' ? -300 : goal === 'gain' ? 300 : 0;
  const minimum = gender === 'female' ? 1200 : 1500;
  return Math.round(Math.max(Number(tdee) + adjustment, minimum));
};

// Tỷ lệ % calo cho Protein / Carb / Fat theo mục tiêu (giá trị giữa khoảng tham khảo trong báo cáo, mục 2.1.1.4)
const MACRO_RATIOS = {
  lose: { protein: 35, carbs: 35, fat: 30 },
  maintain: { protein: 22, carbs: 48, fat: 30 },
  gain: { protein: 28, carbs: 50, fat: 22 }
};

const getMacroRatios = (goal) => MACRO_RATIOS[goal] || MACRO_RATIOS.maintain;

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  MACRO_RATIOS,
  getMacroRatios
};