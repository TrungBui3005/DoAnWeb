import { useCallback, useEffect, useState } from 'react';
import { Activity, CalendarDays, ChevronLeft, ChevronRight, Clock3, Flame, Footprints, Trash2 } from 'lucide-react';
import { apiErrorMessage } from '../../api/axiosClient';
import { createActivity, deleteActivity, getDailyActivities } from '../../api/activityApi';
import { formatCalories, getLocalDate } from '../../utils/nutrition';
import useAuth from '../../hooks/useAuth';

const activityOptions = [
  { value: 'walking', label: 'Đi bộ' },
  { value: 'running', label: 'Chạy bộ' },
  { value: 'cycling', label: 'Đạp xe' },
  { value: 'swimming', label: 'Bơi lội' },
  { value: 'strength_training', label: 'Tập thể lực' },
  { value: 'yoga', label: 'Yoga' }
];
const activityNames = Object.fromEntries(activityOptions.map(({ value, label }) => [value, label]));

export default function ActivityPage() {
  const { profile } = useAuth();
  const [date, setDate] = useState(() => getLocalDate());
  const [summary, setSummary] = useState({ activities: [], total_calories_burned: 0 });
  const [form, setForm] = useState({ activity_type: 'walking', duration_minutes: '30' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSummary(await getDailyActivities(date));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [date]);
  useEffect(() => { load(); }, [load]);

  const shiftDate = (days) => {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + days);
    setDate(getLocalDate(next));
    setNotice('');
  };
  const saveActivity = async (event) => {
    event.preventDefault();
    const duration = Number(form.duration_minutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
      setError('Thời lượng cần từ 1 đến 1.440 phút.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await createActivity({
        ...form,
        duration_minutes: duration,
        activity_date: date
      });
      setNotice('Đã ghi nhận hoạt động.');
      await load();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  const removeActivity = async (id) => {
    if (!window.confirm('Xóa hoạt động này khỏi nhật ký?')) return;
    setError('');
    setNotice('');
    try {
      await deleteActivity(id);
      setNotice('Đã xóa hoạt động khỏi nhật ký.');
      await load();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  };

  return <div className="activity-page">
    <section className="page-heading-row">
      <div><div className="page-eyebrow"><span className="status-dot" /> VẬN ĐỘNG VÌ SỨC KHỎE</div><h1>Nhật ký vận động</h1><p>Ghi nhận hoạt động để theo dõi lượng năng lượng tiêu hao ước tính.</p></div>
      <div className="diary-date-controls"><button type="button" className="icon-button" aria-label="Ngày trước" onClick={() => shiftDate(-1)}><ChevronLeft size={17} /></button><label className="date-picker"><CalendarDays size={17} /><input aria-label="Chọn ngày" type="date" value={date} max={getLocalDate()} onChange={(event) => setDate(event.target.value)} /></label><button type="button" className="icon-button" aria-label="Ngày sau" onClick={() => shiftDate(1)} disabled={date >= getLocalDate()}><ChevronRight size={17} /></button>{date !== getLocalDate() && <button type="button" className="today-button" onClick={() => setDate(getLocalDate())}>Hôm nay</button>}</div>
    </section>
    {(error || notice) && <div className={error ? 'inline-alert' : 'inline-success'}>{error || notice}</div>}
    <div className="activity-page-grid">
      <section className="card activity-form-card">
        <div className="card-heading"><div><span className="section-kicker">GHI NHẬN HOẠT ĐỘNG</span><h2>Hôm nay bạn đã vận động gì?</h2></div><span className="round-icon mint"><Footprints size={19} /></span></div>
        <form className="form-stack" onSubmit={saveActivity}>
          <label className="field-label">Loại hoạt động<select className="plain-input" value={form.activity_type} onChange={(event) => setForm((current) => ({ ...current, activity_type: event.target.value }))}>{activityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="field-label">Thời lượng (phút)<input className="plain-input" type="number" min="1" max="1440" step="1" required value={form.duration_minutes} onChange={(event) => setForm((current) => ({ ...current, duration_minutes: event.target.value }))} /></label>
          <div className="activity-weight-note"><Activity size={15} /> Ước tính dựa trên cân nặng hiện tại{profile?.weight_kg ? ` (${formatCalories(profile.weight_kg)} kg)` : ''} và cường độ trung bình của hoạt động.</div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu hoạt động'}</button>
        </form>
      </section>
      <section className="card activity-summary-card">
        <div className="activity-burned-total"><span className="snapshot-icon calories"><Flame size={18} /></span><div><small>NĂNG LƯỢNG TIÊU HAO ƯỚC TÍNH</small><b>{loading ? '—' : formatCalories(summary.total_calories_burned)} <i>kcal</i></b></div></div>
        <div className="activity-summary-foot">Lượng calo thực tế có thể khác tùy cường độ và cơ địa. Công thức MET dùng cân nặng trong hồ sơ tại thời điểm ghi.</div>
      </section>
      <section className="card activity-list-card">
        <div className="activity-list-heading"><div><span className="section-kicker">NHẬT KÝ TRONG NGÀY</span><h2>Hoạt động đã ghi</h2></div><span>{loading ? '…' : `${summary.activities.length} hoạt động`}</span></div>
        {loading ? <div className="loading-card"><span className="loader" />Đang tải...</div> : summary.activities.length ? <div className="activity-list">{summary.activities.map((item) => <article className="activity-entry" key={item.id}><span className="activity-entry-icon"><Activity size={17} /></span><div className="activity-entry-main"><b>{activityNames[item.activity_type] || item.activity_type}</b><span><Clock3 size={13} /> {item.duration_minutes} phút</span></div><strong>{formatCalories(item.calories_burned)} <small>kcal</small></strong><button className="icon-button activity-delete" aria-label={`Xóa ${activityNames[item.activity_type] || 'hoạt động'}`} onClick={() => removeActivity(item.id)}><Trash2 size={15} /></button></article>)}</div> : <div className="activity-empty"><span>🚶</span><b>Chưa có hoạt động nào</b><p>Ghi lại một hoạt động để xem lượng calo tiêu hao ước tính.</p></div>}
      </section>
    </div>
  </div>;
}
