import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import * as authApi from '../../api/authApi';
import { apiErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import GoalAdvice from '../../components/GoalAdvice';

const initial = { full_name: '', email: '', password: '', age: '', gender: 'female', height_cm: '', weight_kg: '', activity_level: 'sedentary', goal: 'maintain' };
const levels = [
  ['sedentary', 'Ít vận động'],
  ['lightly_active', 'Vận động nhẹ'],
  ['moderately_active', 'Vận động vừa'],
  ['very_active', 'Rất năng động'],
];
const goals = [
  ['lose', 'Giảm cân'],
  ['maintain', 'Duy trì cân nặng'],
  ['gain', 'Tăng cân'],
];

export default function RegisterPage() {
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (step === 1) { setStep(2); return; }
    setBusy(true);
    try {
      await authApi.register({ ...form, age: Number(form.age), height_cm: Number(form.height_cm), weight_kg: Number(form.weight_kg) });
      const session = await authApi.login({ email: form.email, password: form.password });
      login(session); navigate('/app');
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  return <div className="auth-form-wrap register-form">
    <div className="mobile-brand brand"><span className="brand-mark">🍃</span><span>nutrinote<span className="brand-period">.</span></span></div>
    <div className="auth-heading"><span className="auth-kicker">BƯỚC {step} / 2</span><div className="step-track"><i className={step === 1 ? 'selected' : 'complete'} /><i className={step === 2 ? 'selected' : ''} /></div><h2>{step === 1 ? 'Tạo tài khoản' : 'Hiểu cơ thể bạn'}</h2><p>{step === 1 ? 'Bắt đầu hành trình sống khỏe theo cách của riêng bạn.' : 'Một vài thông tin giúp chúng mình tính mục tiêu phù hợp.'}</p></div>
    <form className="form-stack" onSubmit={submit}>
      {error && <div className="form-alert">{error}</div>}
      {step === 1 ? <>
        <label className="field-label">Tên của bạn<input className="plain-input" value={form.full_name} onChange={(e) => change('full_name', e.target.value)} placeholder="Ví dụ: Minh Anh" required /></label>
        <label className="field-label">Email<input className="plain-input" type="email" value={form.email} onChange={(e) => change('email', e.target.value)} placeholder="ten@email.com" required /></label>
        <label className="field-label">Mật khẩu<input className="plain-input" type="password" minLength="6" value={form.password} onChange={(e) => change('password', e.target.value)} placeholder="Tối thiểu 6 ký tự" required /></label>
      </> : <>
        <div className="form-two"><label className="field-label">Tuổi<input className="plain-input" type="number" min="1" max="120" value={form.age} onChange={(e) => change('age', e.target.value)} required /></label><label className="field-label">Giới tính<select className="plain-input" value={form.gender} onChange={(e) => change('gender', e.target.value)}><option value="female">Nữ</option><option value="male">Nam</option></select></label></div>
        <div className="form-two"><label className="field-label">Chiều cao (cm)<input className="plain-input" type="number" min="50" max="260" value={form.height_cm} onChange={(e) => change('height_cm', e.target.value)} required /></label><label className="field-label">Cân nặng (kg)<input className="plain-input" type="number" min="20" max="350" step="0.1" value={form.weight_kg} onChange={(e) => change('weight_kg', e.target.value)} required /></label></div>
        <label className="field-label">Mức độ vận động<select className="plain-input" value={form.activity_level} onChange={(e) => change('activity_level', e.target.value)}>{levels.map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label>
        <label className="field-label">Mục tiêu của bạn<select className="plain-input" value={form.goal} onChange={(e) => change('goal', e.target.value)}>{goals.map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label>
        <GoalAdvice weight={form.weight_kg} height={form.height_cm} goal={form.goal} onChange={(value) => change('goal', value)} />
        <p className="form-hint">Bạn có thể cập nhật những thông tin này bất cứ lúc nào.</p>
      </>}
      <div className="register-actions">{step === 2 && <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}><ChevronLeft size={16} /> Quay lại</button>}<button className="btn btn-primary register-next" disabled={busy}>{busy ? 'Đang tạo...' : step === 1 ? <>Tiếp tục <ChevronRight size={17} /></> : <>Hoàn tất <ArrowRight size={17} /></>}</button></div>
    </form>
    <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập <span>↗</span></Link></p>
  </div>;
}