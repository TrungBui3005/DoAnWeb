import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Apple, BarChart3, BookOpen, Camera, ChevronDown, CircleHelp, LayoutDashboard, LogOut, Menu, MessageCircle, Settings2, ShieldCheck, Utensils, X, Footprints, ChartNoAxesCombined } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import FeatureTour from '../components/FeatureTour';

const navItems = [
  {
    to: '/app',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    kicker: 'BẮT ĐẦU TẠI ĐÂY',
    title: 'Bức tranh sức khỏe mỗi ngày',
    description: 'Xem nhanh lượng calo đã nạp, mục tiêu trong ngày và những gì bạn đã ghi lại.',
    highlights: ['Theo dõi tiến độ calo so với mục tiêu', 'Xem nhanh bữa ăn và dưỡng chất hôm nay', 'Đi nhanh đến những việc bạn làm thường xuyên'],
  },
  {
    to: '/diary',
    label: 'Nhật ký ăn uống',
    icon: BookOpen,
    kicker: 'GHI LẠI MỖI BỮA ĂN',
    title: 'Biết mình đã ăn những gì',
    description: 'Lưu món ăn theo từng bữa để theo dõi năng lượng và dưỡng chất trong ngày.',
    highlights: ['Tìm món ăn và chọn khẩu phần', 'Ghi bữa sáng, trưa, tối hoặc ăn nhẹ', 'Xem lại và chỉnh sửa nhật ký theo ngày'],
  },
  {
    to: '/activity',
    label: 'Nhật ký vận động',
    icon: Footprints,
    kicker: 'GHI NHẬN VẬN ĐỘNG',
    title: 'Theo dõi năng lượng tiêu hao',
    description: 'Ghi lại hoạt động và thời lượng để có cái nhìn đầy đủ hơn về một ngày của bạn.',
    highlights: ['Thêm hoạt động và thời lượng tập', 'Theo dõi calo vận động ước tính', 'Xem lại các hoạt động theo ngày'],
  },
  {
    to: '/reports',
    label: 'Báo cáo dinh dưỡng',
    icon: ChartNoAxesCombined,
    kicker: 'NHÌN LẠI TIẾN ĐỘ',
    title: 'Nhận ra xu hướng theo thời gian',
    description: 'Báo cáo giúp bạn so sánh lượng calo nạp vào, vận động và thói quen ghi chép.',
    highlights: ['Xem thống kê và biểu đồ 7 ngày', 'So sánh calo nạp vào với calo vận động', 'Chọn mốc ngày để xem lại tuần trước'],
  },
  {
    to: '/foods',
    label: 'Tra cứu thực phẩm',
    icon: Utensils,
    kicker: 'TÌM HIỂU MÓN ĂN',
    title: 'Tra cứu thông tin dinh dưỡng',
    description: 'Tìm thực phẩm trong danh mục để tham khảo năng lượng và các chất dinh dưỡng.',
    highlights: ['Tìm món ăn trong danh mục', 'Tham khảo calo và thành phần dinh dưỡng', 'Chọn thực phẩm khi ghi nhật ký'],
  },
  {
    to: '/scan',
    label: 'Quét món ăn',
    icon: Camera,
    kicker: 'NHẬN DIỆN BẰNG HÌNH ẢNH',
    title: 'Để AI hỗ trợ nhận diện món ăn',
    description: 'Tải ảnh món ăn lên để nhận gợi ý món và khẩu phần, sau đó kiểm tra trước khi lưu.',
    highlights: ['Chọn ảnh món ăn từ thiết bị', 'Xem và chỉnh sửa kết quả nhận diện', 'Xác nhận để lưu vào nhật ký ăn uống'],
  },
  {
    to: '/assistant',
    label: 'Trợ lý AI',
    icon: MessageCircle,
    kicker: 'HỎI ĐÁP CÙNG AI',
    title: 'Một người bạn đồng hành dinh dưỡng',
    description: 'Đặt câu hỏi, xin gợi ý thực đơn hoặc nhờ phân tích nhật ký để có thêm góc nhìn.',
    highlights: ['Nhận tư vấn về dinh dưỡng', 'Tham khảo gợi ý thực đơn', 'Phân tích dựa trên mục tiêu và nhật ký'],
  },
];

export default function UserLayout() {
  const { user, profile, profileError, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const tourStorageKey = user?.email ? `nutrinote-tour:${user.email.toLowerCase()}` : '';
  const tourFeatures = [
    ...navItems,
    {
      to: '/profile',
      label: 'Hồ sơ & mục tiêu',
      icon: Settings2,
      kicker: 'CÁ NHÂN HÓA TRẢI NGHIỆM',
      title: 'Thiết lập mục tiêu phù hợp với bạn',
      description: 'Cập nhật thông tin cơ thể và mức độ vận động để tham khảo mục tiêu năng lượng cá nhân.',
      highlights: ['Cập nhật thông tin cá nhân', 'Chọn mục tiêu và mức độ vận động', 'Xem các chỉ số tham khảo như BMI và TDEE'],
    },
    ...(user?.role === 'admin' ? [{
      to: '/admin',
      label: 'Quản trị hệ thống',
      icon: ShieldCheck,
      kicker: 'DÀNH CHO QUẢN TRỊ VIÊN',
      title: 'Quản lý hoạt động của hệ thống',
      description: 'Khu vực quản trị dành cho việc theo dõi người dùng và quản lý danh mục thực phẩm.',
      highlights: ['Xem tổng quan hệ thống', 'Quản lý tài khoản người dùng', 'Quản lý danh mục thực phẩm'],
    }] : []),
  ];
  const title = navItems.find((item) => item.to === location.pathname)?.label || 'Hồ sơ cá nhân';
  const exit = () => { logout(); navigate('/login'); };
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setAccountMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [accountMenuOpen]);

  const closeTour = useCallback(() => {
    if (tourStorageKey) localStorage.setItem(tourStorageKey, 'done');
    setTourOpen(false);
  }, [tourStorageKey]);

  useEffect(() => {
    if (tourStorageKey) setTourOpen(localStorage.getItem(tourStorageKey) !== 'done');
  }, [tourStorageKey]);

  return (
    <div className="app-shell">
      {tourOpen && <FeatureTour features={tourFeatures} onClose={closeTour} />}
      {open && <button className="mobile-scrim" aria-label="Đóng menu" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <NavLink to="/app" className="brand"><span className="brand-mark"><Apple size={19} /></span><span>nutrinote<span className="brand-period">.</span></span></NavLink>
          <button className="icon-button mobile-close" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={19} /></button>
          <div className="workspace-switch"><div className="workspace-icon"><BarChart3 size={17} /></div><div><b>Không gian của bạn</b><small>Gói cá nhân</small></div><ChevronDown size={15} /></div>
        </div>
        <nav className="side-nav">
          <div className="nav-caption">MENU CHÍNH</div>
          {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span>{to === '/assistant' && <span className="nav-new">AI</span>}</NavLink>)}
          <div className="nav-caption nav-caption-space">CÁ NHÂN</div>
          <NavLink to="/profile" onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Settings2 size={18} /><span>Hồ sơ & mục tiêu</span></NavLink>
          {user?.role === 'admin' && <><div className="nav-caption nav-caption-space">QUẢN TRỊ</div><NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><ShieldCheck size={18} /><span>Quản trị hệ thống</span></NavLink></>}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><b>Cần một chút trợ giúp?</b><p>Trợ lý AI luôn sẵn sàng đồng hành cùng bạn.</p><NavLink to="/assistant">Trò chuyện ngay <span>↗</span></NavLink></div>
          <div className="account-menu" ref={accountMenuRef}>
            <button
              className={`user-menu ${accountMenuOpen ? 'account-menu-open' : ''}`}
              type="button"
              aria-expanded={accountMenuOpen}
              aria-haspopup="true"
              aria-controls="account-menu-options"
              onClick={() => setAccountMenuOpen((current) => !current)}
            >
              <span className="avatar">{(profile?.full_name || user?.email || 'N').slice(0, 1).toUpperCase()}</span>
              <span className="user-meta"><b>{profile?.full_name || 'Bạn'}</b><small>{user?.email}</small></span>
              <ChevronDown size={16} className="account-menu-chevron" />
            </button>
            {accountMenuOpen && (
              <div className="account-menu-options" id="account-menu-options">
                <NavLink to="/profile" className="account-menu-item" onClick={() => setAccountMenuOpen(false)}>
                  <Settings2 size={16} /><span>Hồ sơ & mục tiêu</span>
                </NavLink>
                <button className="account-menu-item account-menu-logout" type="button" onClick={exit}>
                  <LogOut size={16} /><span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Mở menu"><Menu size={20} /></button><span className="breadcrumb">Không gian của bạn <span>/</span> <b>{title}</b></span></div>
          <div className="topbar-right"><button className="tour-trigger" type="button" onClick={() => setTourOpen(true)} aria-label="Khám phá các tính năng"><CircleHelp size={16} /><span>Khám phá</span></button><span className="today-chip">{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span><NavLink to="/profile" className="topbar-avatar" aria-label="Mở hồ sơ & mục tiêu" title="Hồ sơ & mục tiêu">{(profile?.full_name || 'N').slice(0, 1).toUpperCase()}</NavLink></div>
        </header>
        <div className="page-content">{profileError && <div className="inline-alert">{profileError}</div>}<Outlet /></div>
      </main>
    </div>
  );
}