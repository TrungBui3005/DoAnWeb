import { X, UserRound, Activity, Scale, Ruler, Flame, Target } from 'lucide-react';

const formatNumber = (value) => Number(value ?? 0).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
const activityLabel = {
  sedentary: 'Ít vận động',
  lightly_active: 'Vận động nhẹ',
  moderately_active: 'Vận động vừa',
  very_active: 'Vận động nhiều'
};
const goalLabel = { lose: 'Giảm cân', maintain: 'Duy trì cân', gain: 'Tăng cân' };
const genderLabel = { male: 'Nam', female: 'Nữ' };

export default function AdminUserProfileModal({ user, onClose }) {
  if (!user) return null;
  const profile = user;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-card admin-profile-modal" role="dialog" aria-modal="true" aria-labelledby="user-profile-title">
        <div className="modal-header">
          <div><span className="section-kicker">THÔNG TIN TÀI KHOẢN</span><h2 id="user-profile-title">Hồ sơ {profile.full_name || 'người dùng'}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={19} /></button>
        </div>
        <div className="profile-summary-card">
          <span className="table-avatar">{(profile.full_name || profile.email || 'U').slice(0, 1).toUpperCase()}</span>
          <div><b>{profile.full_name || 'Người dùng'}</b><small>{profile.email}</small></div>
          <span className={`role-badge ${profile.role}`}>{profile.role_name || (profile.role === 'admin' ? 'Quản trị viên' : 'Người dùng')}</span>
        </div>
        <div className="profile-detail-grid">
          <div><UserRound size={17} /><span>Tuổi</span><b>{profile.age || '—'} năm</b></div>
          <div><UserRound size={17} /><span>Giới</span><b>{genderLabel[profile.gender] || '—'}</b></div>
          <div><Ruler size={17} /><span>Chiều cao</span><b>{formatNumber(profile.height_cm)} cm</b></div>
          <div><Scale size={17} /><span>Cân nặng</span><b>{formatNumber(profile.weight_kg)} kg</b></div>
          <div><Activity size={17} /><span>Vận động</span><b>{activityLabel[profile.activity_level] || '—'}</b></div>
          <div><Target size={17} /><span>Mục tiêu</span><b>{goalLabel[profile.goal] || '—'}</b></div>
        </div>
        <div className="nutrition-profile-grid">
          <div><Flame size={18} /><span>BMR</span><b>{formatNumber(profile.bmr)} kcal</b><small>Năng lượng cơ bản</small></div>
          <div><Flame size={18} /><span>TDEE</span><b>{formatNumber(profile.tdee)} kcal</b><small>Năng lượng tổng cộng</small></div>
          <div><Target size={18} /><span>Target calories</span><b>{formatNumber(profile.target_calories)} kcal</b><small>Mục tiêu hàng ngày</small></div>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={onClose}>Đóng</button></div>
      </div>
    </div>
  );
}
