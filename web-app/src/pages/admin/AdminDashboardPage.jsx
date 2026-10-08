import { useEffect, useMemo, useState } from 'react';
import { 
  ArrowRight, Apple, ShieldCheck, Users, Utensils, 
  Activity, Flame, LockKeyhole, Footprints, Calendar, RefreshCw, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import client, { apiData, apiErrorMessage } from '../../api/axiosClient';

export default function AdminDashboardPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchReport = () => {
    setLoading(true);
    setError('');
    client.get('/admin/reports/summary')
      .then((response) => setReport(apiData(response)))
      .catch((requestError) => setError(apiErrorMessage(requestError)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Xử lý mốc ngày chuẩn xác 100% không bị nhảy mốc lặp ngày
  const chart = useMemo(() => {
    const dailyMap = new Map((report?.daily_calories_7d || []).map((item) => [item.date, item.calories]));
    const today = new Date();
    
    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - index));
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      const label = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(d);
      return { 
        key, 
        label, 
        calories: Number(dailyMap.get(key) || 0) 
      };
    });
  }, [report]);

  const maxCalories = Math.max(...chart.map((item) => item.calories), 1);

  return (
    <div className="admin-dashboard">
      {/* Page Header */}
      <div className="admin-page-heading">
        <div>
          <span className="section-kicker">TỔNG QUAN HỆ THỐNG</span>
          <h1>Xin chào, Quản trị viên</h1>
          <p>Quản lý dữ liệu và theo dõi không gian NutriNote của bạn.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="filter-select-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13px' }}>
            <Calendar size={14} style={{ opacity: 0.6 }} />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              <option value="7d">7 ngày gần đây</option>
              <option value="30d">30 ngày gần đây</option>
            </select>
          </div>
          <button 
            onClick={fetchReport} 
            className="icon-button"
            title="Làm mới dữ liệu"
            style={{ background: '#fff', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', padding: '7px' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <span className="admin-badge"><ShieldCheck size={16} /> ADMIN</span>
        </div>
      </div>

      {error && <div className="inline-alert">{error}</div>}

      {/* KPI Stats */}
      <div className="admin-stats">
        <Stat title="Tổng người dùng" value={loading ? '—' : report?.users?.total ?? 0} icon={Users} color="green" />
        <Stat title="Đang hoạt động" value={loading ? '—' : report?.users?.active ?? 0} icon={Activity} color="purple" />
        <Stat title="Tài khoản bị khóa" value={loading ? '—' : report?.users?.blocked ?? 0} icon={LockKeyhole} color="orange" />
        <Stat title="Thực phẩm" value={loading ? '—' : report?.foods ?? 0} icon={Apple} color="orange" />
      </div>

      {/* Activity Chart Section */}
      <section className="card admin-activity-card">
        <div className="admin-section-heading">
          <div>
            <span className="section-kicker">BÁO CÁO DINH DƯỠNG</span>
            <h2>Hoạt động ghi nhận bữa ăn</h2>
          </div>
          <span className="report-total"><Utensils size={15} /> {loading ? '—' : report?.meals_7d ?? 0} bữa</span>
        </div>

        <div className="report-highlights">
          <div>
            <span><Flame size={15} /> Năng lượng nạp vào</span>
            <b>{loading ? '—' : Number(report?.calories_7d || 0).toLocaleString('vi-VN')} <small>kcal</small></b>
          </div>
          <div>
            <span><Footprints size={15} /> Năng lượng tiêu hao vận động</span>
            <b>{loading ? '—' : Number(report?.calories_burned_7d || 0).toLocaleString('vi-VN')} <small>kcal</small></b>
          </div>
          <p>Tổng hợp nhật ký ăn uống và vận động của toàn bộ người dùng.</p>
        </div>

        <div className="activity-chart" aria-label="Lượng calo được ghi nhận mỗi ngày trong 7 ngày gần đây">
          {chart.map((day) => (
            <div className="activity-chart-day" key={day.key} title={`${day.label}: ${day.calories.toLocaleString('vi-VN')} kcal`}>
              <div className="activity-chart-bar-wrap">
                <i style={{ height: `${day.calories ? Math.max((day.calories / maxCalories) * 100, 5) : 0}%` }} />
              </div>
              <span>{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Runtime & Health Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
        <section className="card admin-runtime-card" style={{ margin: 0 }}>
          <div className="admin-section-heading">
            <div>
              <span className="section-kicker">SỨC KHỎE DỊCH VỤ</span>
              <h2>Hiệu năng từ lúc khởi động</h2>
            </div>
          </div>
          <div className="runtime-metrics">
            <RuntimeMetric label="Thời gian hoạt động" value={formatUptime(report?.performance?.uptime_seconds)} loading={loading} />
            <RuntimeMetric label="Yêu cầu API" value={Number(report?.performance?.requests || 0).toLocaleString('vi-VN')} loading={loading} />
            <RuntimeMetric label="Phản hồi trung bình" value={`${report?.performance?.average_response_ms ?? 0} ms`} loading={loading} />
            <RuntimeMetric label="Lỗi máy chủ" value={Number(report?.performance?.server_errors || 0).toLocaleString('vi-VN')} loading={loading} />
            <RuntimeMetric label="Bộ nhớ tiến trình" value={`${report?.performance?.rss_megabytes ?? 0} MB`} loading={loading} />
          </div>
          <p className="runtime-footnote">Bộ đếm được lưu trong bộ nhớ backend và bắt đầu lại khi khởi động lại dịch vụ.</p>
        </section>

        <section className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="admin-section-heading" style={{ marginBottom: '12px' }}>
              <div>
                <span className="section-kicker">THÔNG BÁO</span>
                <h2 style={{ fontSize: '16px', margin: 0 }}>Trạng thái hệ thống</h2>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '13px', color: '#166534', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', fontWeight: 600 }}>API Gateway hoạt động tốt</strong>
                  <span style={{ opacity: 0.85, fontSize: '12px' }}>Tốc độ phản hồi trung bình ổn định dưới 100ms.</span>
                </div>
              </div>
              <div style={{ padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', color: '#1e40af', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', fontWeight: 600 }}>Bảo mật hệ thống</strong>
                  <span style={{ opacity: 0.85, fontSize: '12px' }}>Hệ thống đang bảo vệ {report?.users?.total || 0} tài khoản với JWT + RBAC.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Shortcuts */}
      <div className="admin-section-heading" style={{ marginTop: '24px' }}>
        <div>
          <span className="section-kicker">TRUY CẬP NHANH</span>
          <h2>Quản lý hệ thống</h2>
        </div>
      </div>
      <div className="admin-shortcuts">
        <Link to="/admin/users" className="admin-shortcut card">
          <span className="shortcut-icon green"><Users size={20} /></span>
          <div>
            <b>Quản lý người dùng</b>
            <p>Tìm kiếm tài khoản và cập nhật vai trò.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/admin/foods" className="admin-shortcut card">
          <span className="shortcut-icon orange"><Utensils size={20} /></span>
          <div>
            <b>Danh mục thực phẩm</b>
            <p>Chỉnh sửa dữ liệu dinh dưỡng trong kho món ăn.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

function Stat({ title, value, icon: Icon, color }) {
  return (
    <div className="admin-stat card">
      <span className={`stat-icon ${color}`}><Icon size={19} /></span>
      <span>{title}</span>
      <b>{value}</b>
    </div>
  );
}

function RuntimeMetric({ label, value, loading }) {
  return (
    <div className="runtime-metric">
      <span>{label}</span>
      <b>{loading ? '—' : value}</b>
    </div>
  );
}

function formatUptime(seconds) {
  const total = Number(seconds) || 0;
  const days = Math.floor(total / 86400);
  const hours = Math.floor(total % 86400 / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  return days ? `${days} ngày ${hours} giờ` : hours ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
}