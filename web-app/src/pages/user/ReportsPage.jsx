import { useCallback, useEffect, useState } from 'react';
import { Activity, CalendarDays, ChevronLeft, ChevronRight, Flame, Footprints, Utensils } from 'lucide-react';
import { apiErrorMessage } from '../../api/axiosClient';
import { getWeeklyReport } from '../../api/reportApi';
import { formatCalories, getLocalDate } from '../../utils/nutrition';

export default function ReportsPage() {
  const [endDate, setEndDate] = useState(() => getLocalDate());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReport(await getWeeklyReport(endDate));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [endDate]);
  useEffect(() => { load(); }, [load]);

  const shiftWeek = (weeks) => {
    const next = new Date(`${endDate}T12:00:00`);
    next.setDate(next.getDate() + weeks * 7);
    const nextDate = getLocalDate(next);
    setEndDate(nextDate > getLocalDate() ? getLocalDate() : nextDate);
  };
  const totals = report?.totals || {};
  const days = report?.days || [];
  const maxCalories = Math.max(
    ...days.flatMap((day) => [Number(day.calories_consumed), Number(day.calories_burned)]),
    1
  );
  const dateRange = report
    ? `${new Date(`${report.start_date}T12:00:00`).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })} – ${new Date(`${report.end_date}T12:00:00`).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : '7 ngày';

  return <div className="reports-page">
    <section className="page-heading-row">
      <div><div className="page-eyebrow"><span className="status-dot" /> HIỂU RÕ HÀNH TRÌNH CỦA BẠN</div><h1>Báo cáo dinh dưỡng</h1><p>Theo dõi lượng nạp vào và năng lượng tiêu hao theo từng ngày.</p></div>
      <div className="report-date-controls">
        <button type="button" className="icon-button" aria-label="7 ngày trước" onClick={() => shiftWeek(-1)}><ChevronLeft size={17} /></button>
        <label className="date-picker"><CalendarDays size={17} /><input aria-label="Ngày kết thúc báo cáo" type="date" value={endDate} max={getLocalDate()} onChange={(event) => setEndDate(event.target.value)} /></label>
        <button type="button" className="icon-button" aria-label="7 ngày sau" disabled={endDate >= getLocalDate()} onClick={() => shiftWeek(1)}><ChevronRight size={17} /></button>
        {endDate !== getLocalDate() && <button type="button" className="today-button" onClick={() => setEndDate(getLocalDate())}>Tuần này</button>}
      </div>
    </section>
    {error && <div className="inline-alert">{error}<button className="text-link" onClick={load}>Thử lại</button></div>}
    <div className="report-range-label"><CalendarDays size={14} /> {dateRange}</div>
    <section className="report-stat-grid">
      <ReportStat icon={Flame} tone="orange" label="Calo đã nạp" value={totals.calories_consumed} unit="kcal" loading={loading} />
      <ReportStat icon={Activity} tone="green" label="Calo tiêu hao vận động" value={totals.calories_burned} unit="kcal" loading={loading} />
      <ReportStat icon={Utensils} tone="purple" label="Bữa ăn đã ghi" value={totals.meal_count} unit="bữa" loading={loading} />
      <ReportStat icon={Footprints} tone="blue" label="Hoạt động vận động" value={totals.activity_count} unit="lần" loading={loading} />
    </section>
    <section className="card report-chart-card">
      <div className="report-card-heading"><div><span className="section-kicker">7 NGÀY GẦN ĐÂY</span><h2>Calo nạp vào và tiêu hao</h2></div><div className="report-legend"><span><i className="consumed" /> Đã nạp</span><span><i className="burned" /> Vận động</span></div></div>
      {loading ? <div className="loading-card"><span className="loader" />Đang tổng hợp dữ liệu...</div> : <div className="weekly-chart" role="img" aria-label="Biểu đồ so sánh calo nạp vào và tiêu hao vận động trong 7 ngày">
        {days.map((day) => {
          const consumed = Number(day.calories_consumed) || 0;
          const burned = Number(day.calories_burned) || 0;
          const date = new Date(`${day.date}T12:00:00`);
          return <div className="weekly-chart-day" key={day.date} title={`${date.toLocaleDateString('vi-VN')}: nạp ${formatCalories(consumed)} kcal, vận động ${formatCalories(burned)} kcal`}>
            <div className="weekly-chart-bars"><i className="consumed" style={{ height: `${consumed ? Math.max(consumed / maxCalories * 100, 3) : 0}%` }} /><i className="burned" style={{ height: `${burned ? Math.max(burned / maxCalories * 100, 3) : 0}%` }} /></div>
            <span>{date.toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
            <small>{date.getDate()}/{date.getMonth() + 1}</small>
          </div>;
        })}
      </div>}
      {!loading && days.length > 0 && days.every((day) => !Number(day.calories_consumed) && !Number(day.calories_burned)) && <div className="report-empty-note">Chưa có dữ liệu ăn uống hoặc vận động trong khoảng thời gian này.</div>}
      <p className="report-disclaimer">Calo tiêu hao là ước tính dựa trên loại hoạt động, thời lượng và cân nặng trong hồ sơ.</p>
    </section>
    <section className="card report-macros-card">
      <div className="report-card-heading"><div><span className="section-kicker">DINH DƯỠNG ĐÃ GHI NHẬN</span><h2>Tổng dưỡng chất trong kỳ</h2></div></div>
      <div className="report-macros-grid">
        <MacroSummary label="Protein" value={totals.protein} color="green" loading={loading} />
        <MacroSummary label="Tinh bột" value={totals.carbs} color="orange" loading={loading} />
        <MacroSummary label="Chất béo" value={totals.fat} color="purple" loading={loading} />
      </div>
    </section>
  </div>;
}

function ReportStat({ icon: Icon, tone, label, value, unit, loading }) {
  return <article className="card report-stat"><span className={`report-stat-icon ${tone}`}><Icon size={17} /></span><div><small>{label}</small><b>{loading ? '—' : formatCalories(value)} <i>{unit}</i></b></div></article>;
}

function MacroSummary({ label, value, color, loading }) {
  return <div className="macro-summary"><span className={`macro-summary-dot ${color}`} /><div><small>{label}</small><b>{loading ? '—' : formatCalories(value)} <i>g</i></b></div></div>;
}
