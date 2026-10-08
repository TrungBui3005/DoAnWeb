const GOAL_NAMES = { lose: 'Giảm cân', maintain: 'Duy trì cân nặng', gain: 'Tăng cân' };

// Phân loại BMI theo ngưỡng WHO
export const bmiInfo = (weightKg, heightCm) => {
  const w = Number(weightKg);
  const h = Number(heightCm) / 100;
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  const bmi = w / (h * h);
  if (bmi < 18.5) return { bmi, label: 'gầy', recommended: 'gain' };
  if (bmi < 25) return { bmi, label: 'bình thường', recommended: 'maintain' };
  if (bmi < 30) return { bmi, label: 'thừa cân', recommended: 'lose' };
  return { bmi, label: 'béo phì', recommended: 'lose' };
};

// Gợi ý mục tiêu theo BMI. Chỉ cảnh báo, không chặn (BMI không phản ánh cơ bắp).
export default function GoalAdvice({ weight, height, goal, onChange }) {
  const info = bmiInfo(weight, height);
  if (!info) return null;

  const { bmi, label, recommended } = info;
  const bmiText = `BMI của bạn là ${bmi.toFixed(1)} (${label})`;
  const switchButton = <button type="button" className="text-link" onClick={() => onChange(recommended)}>Chuyển sang “{GOAL_NAMES[recommended]}”</button>;

  if (goal === recommended) {
    return <div className="inline-success">{bmiText}. Mục tiêu “{GOAL_NAMES[goal]}” phù hợp với thể trạng của bạn.</div>;
  }

  const risky = (goal === 'lose' && bmi < 18.5) || (goal === 'gain' && bmi >= 25);
  if (risky) {
    const reason = goal === 'lose'
      ? 'Giảm cân khi đang gầy có thể ảnh hưởng đến sức khỏe.'
      : 'Tăng cân khi đang thừa cân có thể không phù hợp, trừ khi bạn đang tập để tăng cơ.';
    return <div className="form-alert">{bmiText}. {reason} Gợi ý: “{GOAL_NAMES[recommended]}”. {switchButton}</div>;
  }

  return <p className="form-hint">{bmiText}. Gợi ý theo BMI: “{GOAL_NAMES[recommended]}”. Bạn vẫn có thể giữ mục tiêu hiện tại nếu muốn. {switchButton}</p>;
}