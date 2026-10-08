import { useEffect, useState } from 'react';
import { Activity, ArrowRight, Check, Heart, Ruler, Scale, UserRound } from 'lucide-react';
import { updateProfile } from '../../api/authApi';
import { apiErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import GoalAdvice from '../../components/GoalAdvice';

const fields = ['full_name', 'age', 'gender', 'height_cm', 'weight_kg', 'activity_level', 'goal'];
const activityNames = { sedentary: 'Ít vận động', lightly_active: 'Vận động nhẹ', moderately_active: 'Vận động vừa', very_active: 'Rất năng động' };
const goalNames = { lose: 'Giảm cân từ từ', maintain: 'Duy trì cân nặng', gain: 'Tăng cân từ từ' };

export default function ProfilePage() {
  const { profile, setProfile, refreshProfile, user } = useAuth();
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (profile) setForm(Object.fromEntries(fields.map((field) => [field, profile[field] ?? ''])));
  }, [profile]);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setFeedback('');
    const payload = { ...form, age: Number(form.age), height_cm: Number(form.height_cm), weight_kg: Number(form.weight_kg) };
    try {
      const result = await updateProfile(payload);
      setProfile(result); setFeedback('Hồ sơ của bạn đã được cập nhật.');
      await refreshProfile();
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  const bmi = profile?.weight_kg && profile?.height_cm ? Number(profile.weight_kg) / ((Number(profile.height_cm) / 100) ** 2) : null;

  return <div className="profile-page">
    <section className="page-heading-row"><div><div className="page-eyebrow"><span className="status-dot" /> HỒ SƠ CỦA BẠN</div><h1>Hồ sơ & mục tiêu</h1><p>Thông tin phù hợp giúp gợi ý dinh dưỡng sát với bạn hơn.</p></div></section>
    <div className="profile-grid">
      <form className="card profile-form" onSubmit={submit}>
        <div className="card-heading"><div><span className="section-kicker">THÔNG TIN CÁ NHÂN</span><h2>Thông tin cơ thể</h2></div><span className="round-icon mint"><UserRound size={19} /></span></div>
        {error && <div className="form-alert">{error}</div>}{feedback && <div className="inline-success"><Check size={16} />{feedback}</div>}
        <label className="field-label">Họ và tên<input className="plain-input" value={form.full_name || ''} onChange={(e) => change('full_name', e.target.value)} required /></label>
        <label className="field-label">Email đăng nhập<input className="plain-input readonly-input" value={user?.email || ''} readOnly /></label>
        <div className="form-two"><label className="field-label">Tuổi<input className="plain-input" type="number" min="1" max="120" value={form.age || ''} onChange={(e) => change('age', e.target.value)} required /></label><label className="field-label">Giới tính<select className="plain-input" value={form.gender || 'female'} onChange={(e) => change('gender', e.target.value)}><option value="female">Nữ</option><option value="male">Nam</option></select></label></div>
        <div className="form-two"><label className="field-label">Chiều cao (cm)<input className="plain-input" type="number" min="50" max="260" value={form.height_cm || ''} onChange={(e) => change('height_cm', e.target.value)} required /></label><label className="field-label">Cân nặng (kg)<input className="plain-input" type="number" min="20" max="350" step="0.1" value={form.weight_kg || ''} onChange={(e) => change('weight_kg', e.target.value)} required /></label></div>
        <label className="field-label">Mức độ vận động<select className="plain-input" value={form.activity_level || 'sedentary'} onChange={(e) => change('activity_level', e.target.value)}>{Object.entries(activityNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
        <label className="field-label">Mục tiêu của bạn<select className="plain-input" value={form.goal || 'maintain'} onChange={(e) => change('goal', e.target.value)}>{Object.entries(goalNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
        <GoalAdvice weight={form.weight_kg} height={form.height_cm} goal={form.goal || 'maintain'} onChange={(value) => change('goal', value)} />
        <p className="form-hint">Mục tiêu calo được tính tự động từ TDEE và mục tiêu của bạn. Mức giảm/tăng chỉ là gợi ý tham khảo, không thay thế tư vấn chuyên gia.</p>
        <button className="btn btn-primary profile-save" disabled={busy}>{busy ? 'Đang lưu...' : <>Lưu thay đổi <ArrowRight size={16} /></>}</button>
      </form>
      <aside className="profile-aside">
        <div className="profile-person-card"><span className="profile-person-avatar">{(profile?.full_name || 'N').slice(0, 1).toUpperCase()}</span><h2>{profile?.full_name || 'Người dùng'}</h2><p>{user?.email}</p><span className="member-pill"><Heart size={13} /> Thành viên NutriNote</span></div>
        <div className="card metrics-card"><span className="section-kicker">CHỈ SỐ THAM KHẢO</span><h3>Cơ thể bạn</h3><div className="metric-line"><span><Scale size={16} /> BMI</span><b>{bmi ? bmi.toFixed(1) : '--'}</b></div><div className="metric-line"><span><Activity size={16} /> BMR</span><b>{profile?.bmr ? `${Math.round(profile.bmr)} kcal` : '--'}</b></div><div className="metric-line"><span><Ruler size={16} /> TDEE ước tính</span><b>{profile?.tdee ? `${Math.round(profile.tdee)} kcal` : '--'}</b></div><div className="metric-line"><span><Heart size={16} /> Mục tiêu calo</span><b>{profile?.target_calories ? `${Math.round(profile.target_calories)} kcal` : '--'}</b></div><div className="metric-line"><span><Activity size={16} /> Mục tiêu</span><b>{goalNames[profile?.goal] || goalNames.maintain}</b></div><p>Mục tiêu giảm cân dùng mức tham khảo tối đa 300 kcal dưới TDEE; mục tiêu tăng cân thêm khoảng 300 kcal, có áp dụng ngưỡng calo tối thiểu an toàn.</p></div>
        <div className="profile-tip"><span>🌱</span><div><b>Cập nhật định kỳ</b><p>Cân nặng thay đổi? Cập nhật hồ sơ để mục tiêu năng lượng luôn phù hợp.</p></div></div>
      </aside>
    </div>
  </div>;
}