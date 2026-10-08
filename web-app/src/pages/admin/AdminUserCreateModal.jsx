import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import client, { apiErrorMessage } from '../../api/axiosClient';

const initialForm = {
  email: '',
  password: '',
  full_name: '',
  age: '',
  gender: 'male',
  height_cm: '',
  weight_kg: '',
  activity_level: 'moderately_active',
  role: 'user'
};

export default function AdminUserCreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await client.post('/admin/users', form);
      onCreated();
      onClose();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-card admin-create-modal" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
        <div className="modal-header">
          <div><span className="section-kicker">TÀI KHOẢN MỚI</span><h2 id="create-user-title">Tạo người dùng</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={19} /></button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          {error && <div className="form-alert">{error}</div>}
          <div className="form-grid">
            <label className="field-label">Email<input className="plain-input" type="email" autoComplete="email" required value={form.email} onChange={update('email')} placeholder="user@example.com" /></label>
            <label className="field-label">Mật khẩu<input className="plain-input" type="password" autoComplete="new-password" required minLength="8" value={form.password} onChange={update('password')} placeholder="8+ ký tự" /></label>
            <label className="field-label form-grid-wide">Tên đầy đủ<input className="plain-input" required minLength="2" value={form.full_name} onChange={update('full_name')} placeholder="Tên người dùng" /></label>
            <label className="field-label">Tuổi<input className="plain-input" type="number" min="13" max="100" required value={form.age} onChange={update('age')} /></label>
            <label className="field-label">Giới<select className="plain-input" value={form.gender} onChange={update('gender')}><option value="male">Nam</option><option value="female">Nữ</option></select></label>
            <label className="field-label">Chiều cao (cm)<input className="plain-input" type="number" min="40" max="300" required value={form.height_cm} onChange={update('height_cm')} /></label>
            <label className="field-label">Cân nặng (kg)<input className="plain-input" type="number" min="1" max="300" step="0.1" required value={form.weight_kg} onChange={update('weight_kg')} /></label>
            <label className="field-label">Mức độ vận động<select className="plain-input" value={form.activity_level} onChange={update('activity_level')}><option value="sedentary">Ít vận động</option><option value="lightly_active">Vận động nhẹ</option><option value="moderately_active">Vận động vừa</option><option value="very_active">Vận động nhiều</option></select></label>
            <label className="field-label">Vai trò<select className="plain-input" value={form.role} onChange={update('role')}><option value="user">Người dùng</option><option value="admin">Quản trị viên</option></select></label>
          </div>
          <p className="form-hint">Hồ sơ dinh dưỡng sẽ được tính tự động từ các thông tin trên.</p>
          <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button><button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? <span className="loader" /> : <UserPlus size={16} />} Tạo tài khoản</button></div>
        </form>
      </div>
    </div>
  );
}
