import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity as ActivityIcon, ArrowRight, CalendarDays, Flame, Heart, Plus, RefreshCw, Sparkles, TrendingUp, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDailySummary } from '../../api/mealApi';
import { getDailyActivities } from '../../api/activityApi';
import { apiErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import { formatCalories, getLocalDate, getProgress, getRemainingCalories, toNumber } from '../../utils/nutrition';

// Tỷ lệ % calo (Protein / Carb / Fat) theo mục tiêu, khớp backend (nutritionCalc.js)
const MACRO_RATIOS = {
  lose: { protein: 35, carbs: 35, fat: 30 },
  maintain: { protein: 22, carbs: 48, fat: 30 },
  gain: { protein: 28, carbs: 50, fat: 22 }
};

export default function HomePage() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState(null);
  const [activitySummary, setActivitySummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const today = useMemo(() => getLocalDate(), []);
  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mealResult, activityResult] = await Promise.all([
        getDailySummary(today),
        getDailyActivities(today)
      ]);
      setSummary(mealResult);
      setActivitySummary(activityResult);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [today]);
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const consumed = toNumber(summary?.totals?.calories);
  const burned = toNumber(activitySummary?.total_calories_burned);
  const target = toNumber(profile?.target_calories || profile?.tdee || 2000);
  const ratios = MACRO_RATIOS[profile?.goal] || MACRO_RATIOS.maintain;
  const remaining = getRemainingCalories(consumed, target);
  const percentage = getProgress(consumed, target);
  const meals = summary?.meals || [];
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Chào buổi sáng' : hour < 17 ? 'Chào buổi chiều' : 'Chào buổi tối';
  return <div className="dashboard-page">
    <section className="dashboard-hero">
      <div className="hero-copy">
        <div className="page-eyebrow"><span className="status-dot" /> CHĂM SÓC MÌNH TỪ NHỮNG ĐIỀU NHỎ</div>
        <h1>{greeting}, {profile?.full_name?.split(' ')[0] || 'bạn'} <span className="wave">✳</span></h1>
        <p>Mỗi lựa chọn nhỏ hôm nay là một món quà cho cơ thể ngày mai.</p>
        <div className="hero-actions">
          <Link to="/diary" className="btn btn-light"><Plus size={16} /> Ghi bữa ăn</Link>
          <Link to="/activity" className="hero-text-link"><ActivityIcon size={15} /> Ghi vận động <ArrowRight size={14} /></Link>
          <Link to="/assistant" className="hero-text-link"><Sparkles size={15} /> Hỏi trợ lý AI <ArrowRight size={14} /></Link>
        </div>
      </div>
      <div className="hero-side">
        <div className="hero-date"><CalendarDays size={15} /><span>HÔM NAY</span><b>{new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long' }).format(new Date())}</b></div>
        <div className="hero-decoration" aria-hidden="true"><span>🌿</span><i /><i /><i /></div>
        <button className="hero-refresh" onClick={loadSummary} disabled={loading} aria-label="Làm mới số liệu" title="Làm mới số liệu"><RefreshCw size={15} className={loading ? 'spin' : ''} /></button>
      </div>
    </section>
    <section className="daily-snapshot">
      <div className="snapshot-item"><span className="snapshot-icon calories"><Flame size={16} /></span><div><small>NĂNG LƯỢNG ĐÃ NẠP</small><b>{loading ? '—' : formatCalories(consumed)} <i>kcal</i></b></div></div>
      <div className="snapshot-divider" />
      <div className="snapshot-item"><span className="snapshot-icon meals"><Utensils size={16} /></span><div><small>BỮA ĂN ĐÃ GHI</small><b>{loading ? '—' : meals.length} <i>bữa</i></b></div></div>
      <div className="snapshot-divider" />
      <div className="snapshot-item"><span className="snapshot-icon goal"><TrendingUp size={16} /></span><div><small>MỤC TIÊU HÔM NAY</small><b>{formatCalories(target)} <i>kcal</i></b></div></div>
      <div className="snapshot-divider" />
      <div className="snapshot-item"><span className="snapshot-icon activity"><ActivityIcon size={16} /></span><div><small>TIÊU HAO VẬN ĐỘNG</small><b>{loading ? '—' : formatCalories(burned)} <i>kcal</i></b></div></div>
      <div className="snapshot-completion"><span>{Math.round(percentage)}%</span><small>hoàn thành</small></div>
    </section>
    {error && <div className="inline-alert dashboard-alert">{error}<button className="text-link" onClick={loadSummary}><RefreshCw size={14} /> Thử lại</button></div>}
    <section className="dashboard-grid">
      <article className="card calorie-card">
        <div className="card-heading"><div><span className="section-kicker">NĂNG LƯỢNG HÔM NAY</span><h2>Một ngày cân bằng</h2></div><span className="round-icon mint"><Flame size={19} /></span></div>
        <div className="calorie-content"><div className="calorie-ring" style={{ '--progress': `${percentage * 3.6}deg` }}><div className="ring-inner"><span>ĐÃ NẠP</span><b>{formatCalories(consumed)}</b><small>kcal</small></div></div><div className="calorie-details"><span className="detail-label">Còn lại hôm nay</span><strong>{formatCalories(remaining)} <small>kcal</small></strong><p>Mục tiêu ngày: {formatCalories(target)} kcal</p><div className="target-track"><i style={{ width: `${percentage}%` }} /></div><div className="target-note"><span>{Math.round(percentage)}% hoàn thành</span><span>{formatCalories(target)} kcal</span></div></div></div>
        <div className="calorie-foot"><span><Heart size={16} /> Cứ lắng nghe cơ thể mình nhé.</span><Link to="/diary">Xem nhật ký <ArrowRight size={15} /></Link></div>
      </article>
      <article className="card macro-card">
        <div className="card-heading"><div><span className="section-kicker">DINH DƯỠNG</span><h2>Nhìn nhanh dưỡng chất</h2></div><span className="round-icon lilac"><TrendingUp size={19} /></span></div>
        <MacroLine label="Protein" value={summary?.totals?.protein} target={Math.round(target * ratios.protein / 100 / 4)} color="green" />
        <MacroLine label="Tinh bột" value={summary?.totals?.carbs} target={Math.round(target * ratios.carbs / 100 / 4)} color="orange" />
        <MacroLine label="Chất béo" value={summary?.totals?.fat} target={Math.round(target * ratios.fat / 100 / 9)} color="purple" />
        <div className="macro-foot">Số liệu được tính từ nhật ký hôm nay.</div>
      </article>
    </section>
    <section className="section-row">
      <div className="section-title"><div><span className="section-kicker">HÀNH TRÌNH HÔM NAY</span><h2>Bữa ăn của bạn <span className="count-pill">{meals.length}</span></h2></div><Link className="text-link" to="/diary">Mở nhật ký <ArrowRight size={15} /></Link></div>
      {loading ? <div className="card loading-card"><span className="loader" />Đang tải dữ liệu hôm nay...</div> : meals.length ? <div className="meal-overview">{meals.map((meal) => <div className="meal-mini card" key={meal.id}><div className={`meal-icon ${meal.meal_type}`}><Utensils size={17} /></div><div className="meal-mini-copy"><b>{mealTitle(meal.meal_type)}</b><span>{meal.items?.length || 0} món · {meal.items?.map((item) => item.food_name).join(', ')}</span></div><strong>{formatCalories(meal.totals?.calories)} <small>kcal</small></strong></div>)}</div> : <div className="empty-state card"><span className="empty-illustration">🥗</span><div><b>Ngày mới, bắt đầu thật nhẹ nhàng</b><p>Chưa có bữa ăn nào được ghi lại. Thêm món đầu tiên nhé.</p></div><Link to="/diary" className="btn btn-primary btn-small"><Plus size={16} /> Ghi bữa ăn</Link></div>}
    </section>
    <section className="bottom-promo">
      <div className="promo-sparkle"><Sparkles size={20} /></div><div><span className="section-kicker">GỢI Ý NHỎ</span><b>Một câu hỏi về dinh dưỡng?</b><p>Trợ lý AI sẽ gợi ý dựa trên mục tiêu và bữa ăn của bạn.</p></div><Link to="/assistant" className="btn btn-dark">Hỏi trợ lý AI <ArrowRight size={16} /></Link>
    </section>
  </div>;
}

function MacroLine({ label, value, target, color }) {
  const amount = Number(value) || 0;
  const goal = Number(target) || 1;
  return <div className="macro-line"><div className="macro-line-head"><span>{label}</span><b>{Math.round(amount)}<small> / {goal} g</small></b></div><div className="macro-track"><i className={color} style={{ width: `${Math.min(amount / goal * 100, 100)}%` }} /></div></div>;
}
export const mealTitle = (type) => ({ breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối', snack: 'Ăn nhẹ' }[type] || 'Bữa ăn');