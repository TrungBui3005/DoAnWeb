import { useCallback, useEffect, useState } from 'react';
import { Search, Shield, UserRound, ChevronLeft, ChevronRight, LockKeyhole, LockKeyholeOpen, Plus, Eye } from 'lucide-react';
import client, { apiData, apiErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import AdminUserCreateModal from './AdminUserCreateModal';
import AdminUserProfileModal from './AdminUserProfileModal';

export default function UserManagePage() {
  const pageSize = 10;
  const { user: currentUser } = useAuth();
  const [result, setResult] = useState({ items: [], pagination: { page: 1, total_pages: 1, total: 0 } });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [creating, setCreating] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setResult(await apiData(await client.get('/admin/users', { params: { page, limit: 10, search: search.trim() || undefined } }))); }
    catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setLoading(false); }
  }, [page, search]);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  const changeRole = async (target) => {
    const role = target.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Thay đổi vai trò của ${target.full_name || target.email} thành ${role === 'admin' ? 'Quản trị viên' : 'Người dùng'}?`)) return;
    setUpdating(target.id); setError(''); setNotice('');
    try { await client.patch(`/admin/users/${target.id}/role`, { role }); setNotice('Vai trò người dùng đã được cập nhật.'); await load(); }
    catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setUpdating(null); }
  };
  const toggleStatus = async (target) => {
    const isActive = Number(target.is_active) !== 1;
    const action = isActive ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${target.full_name || target.email}?`)) return;
    setUpdating(target.id); setError(''); setNotice('');
    try {
      await client.patch(`/admin/users/${target.id}/status`, { is_active: isActive });
      setNotice(`Đã ${action} tài khoản ${target.email}.`);
      await load();
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setUpdating(null); }
  };
  const pagination = result.pagination || {};
  return <div className="admin-users-page">
    <div className="admin-page-heading"><div><span className="section-kicker">QUẢN LÝ TÀI KHOẢN</span><h1>Người dùng</h1><p>Xem, tạo và quản lý tài khoản trong hệ thống.</p></div><button className="btn btn-primary" onClick={() => setCreating(true)} disabled={loading}><Plus size={16} /> Tạo tài khoản</button></div>
    {error && <div className="inline-alert">{error}</div>}{notice && <div className="inline-success">{notice}</div>}
    <section className="card admin-table-card">
      <div className="table-toolbar"><div><h2>Danh sách tài khoản</h2><span>{pagination.total ?? 0} người dùng</span></div><label className="table-search"><Search size={16} /><input placeholder="Tìm theo tên hoặc email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label></div>
      <div className="table-scroll"><table><thead><tr><th>NGƯỜI DÙNG</th><th>VAI TRÒ</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th>THAO TÁC</th></tr></thead><tbody>{result.items?.map((item) => {
        const isSelf = Number(item.id) === Number(currentUser?.id);
        const isActive = Number(item.is_active) === 1;
        return <tr key={item.id}>
          <td><div className="table-person"><span className="table-avatar">{(item.full_name || item.email || 'U').slice(0, 1).toUpperCase()}</span><span><b>{item.full_name || 'Người dùng'}</b><small>{item.email}</small></span></div></td>
          <td><span className={`role-badge ${item.role}`}><i />{item.role_name || (item.role === 'admin' ? 'Quản trị viên' : 'Người dùng')}</span></td>
          <td><span className={`account-status ${isActive ? 'active' : 'blocked'}`}><i />{isActive ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
          <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '—'}</td>
          <td><div className="account-actions">
            <button className="table-action" onClick={() => setProfileUser(item)}><Eye size={14} /> Hồ sơ</button>
            {isSelf ? <span className="self-label">Tài khoản của bạn</span> : <>
              <button className="table-action" disabled={updating === item.id || !isActive} onClick={() => changeRole(item)} title={isActive ? undefined : 'Mở khóa tài khoản trước khi đổi quyền'}>
                {item.role === 'admin' ? <><UserRound size={14} /> Hạ quyền</> : <><Shield size={14} /> Cấp admin</>}
              </button>
              <button className={`table-action ${isActive ? 'danger' : ''}`} disabled={updating === item.id} onClick={() => toggleStatus(item)}>
                {isActive ? <><LockKeyhole size={14} /> Khóa</> : <><LockKeyholeOpen size={14} /> Mở khóa</>}
              </button>
            </>}
          </div></td>
        </tr>;
      })}
        {!loading && !result.items?.length && <tr><td colSpan="5" className="table-empty">Không tìm thấy tài khoản nào.</td></tr>}</tbody></table></div>
      {loading && <div className="table-loading">Đang tải dữ liệu...</div>}
      <div className="table-pagination"><span>Trang {pagination.page || page} / {pagination.total_pages || 1}</span><div><button className="icon-button" disabled={page <= 1 || loading} onClick={() => setPage((n) => n - 1)} aria-label="Trang trước"><ChevronLeft size={17} /></button><button className="icon-button" disabled={page >= (pagination.total_pages || 1) || loading} onClick={() => setPage((n) => n + 1)} aria-label="Trang sau"><ChevronRight size={17} /></button></div></div>
    </section>
    {creating && <AdminUserCreateModal onClose={() => setCreating(false)} onCreated={() => { setNotice('Tài khoản mới đã được tạo.'); load(); }} />}
    {profileUser && <AdminUserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />}
  </div>;
}