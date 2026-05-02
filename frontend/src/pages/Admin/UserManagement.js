import React, { useState, useEffect, useCallback, useMemo } from 'react';
import adminService from '../../services/admin';
import authService from '../../services/auth';

const ROLE_TABS = [
  { value: '',         label: 'All' },
  { value: 'student',  label: 'Students' },
  { value: 'tutor',    label: 'Tutors' },
  { value: 'admin',    label: 'Admins' }
];

function StatusPill({ active }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap border ${
      active ? 'bg-green-500/20 text-green-400 border-green-500/40'
             : 'bg-red-500/20 text-red-400 border-red-500/40'
    }`}>
      {active ? 'Active' : 'Suspended'}
    </span>
  );
}

function RolePill({ role }) {
  const cls = role === 'admin'
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    : role === 'tutor'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  return <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap border ${cls}`}>{role}</span>;
}

function TutorApprovalPill({ status }) {
  if (!status) return null;
  const cls = status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/40'
            : status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/40'
            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
  return <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap border ${cls}`}>tutor: {status}</span>;
}

function UserManagement() {
  const me = authService.getCurrentUser();
  const myUserId = me?.id;

  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await adminService.listUsers(role || undefined);
      setUsers(res.users || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load users');
    } finally { setLoading(false); }
  }, [role]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(term) ||
      (u.display_name || '').toLowerCase().includes(term) ||
      (u.phone_number || '').toLowerCase().includes(term)
    );
  }, [users, search]);

  const toggleActive = async (u) => {
    if (u.id === myUserId) return alert('You cannot suspend your own account.');
    const willSuspend = u.is_active;
    const verb = willSuspend ? 'Suspend' : 'Reactivate';
    if (!window.confirm(`${verb} ${u.email}?`)) return;
    setActionLoading(true);
    try {
      await adminService.setUserActive(u.id, !u.is_active);
      refresh();
    } catch (e) { alert(e.response?.data?.error || `Failed to ${verb.toLowerCase()}`); }
    finally { setActionLoading(false); }
  };

  const remove = async (u) => {
    if (u.id === myUserId) return alert('You cannot delete your own account.');
    if (!window.confirm(`Permanently delete ${u.email}? This will also remove their profile, bookings, and uploads. This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await adminService.deleteUser(u.id);
      refresh();
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete'); }
    finally { setActionLoading(false); }
  };

  // Counts per role for the summary chips. Defined before any early return
  // so React's hook ordering stays consistent across renders.
  const roleCounts = useMemo(() => {
    const c = { student: 0, tutor: 0, admin: 0 };
    users.forEach((u) => { if (c[u.role] !== undefined) c[u.role]++; });
    return c;
  }, [users]);

  if (me?.role !== 'admin') {
    return (<div className="px-6 pt-24 pb-12 text-center"><p className="text-gray-400">Admins only.</p></div>);
  }

  return (
    <div className="container mx-auto px-6 pt-24 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-2 text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-gray-400">View, suspend, or remove accounts on the platform.</p>
      </div>

      {/* Role tabs */}
      <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10">
        <div className="flex flex-wrap gap-2 mb-4">
          {ROLE_TABS.map((t) => (
            <button
              key={t.value || 'all'}
              onClick={() => setRole(t.value)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                role === t.value
                  ? 'bg-[#00CC99] text-[#0f172a] font-bold border-[#00CC99]'
                  : 'bg-[#0f172a]/40 text-white border-white/10 hover:border-white/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, name, or phone…"
          className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white placeholder-gray-500"
        />
      </div>

      {/* Summary chips */}
      {!loading && (
        <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-400">
          <span className="px-3 py-1 rounded-full border border-white/10">{filtered.length} shown</span>
          <span className="px-3 py-1 rounded-full border border-blue-500/30 text-blue-300">{roleCounts.student} students</span>
          <span className="px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-300">{roleCounts.tutor} tutors</span>
          <span className="px-3 py-1 rounded-full border border-purple-500/30 text-purple-300">{roleCounts.admin} admins</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-gray-400 border border-white/10">
          No users match your filters.
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          {/* Header — desktop only */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-[#0f172a]/40 text-xs uppercase tracking-wider text-gray-400 border-b border-white/10">
            <div className="col-span-4">Account</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/5">
            {filtered.map((u) => (
              <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-[#0f172a]/30 transition items-start md:items-center">
                <div className="md:col-span-4 min-w-0">
                  <p className="font-semibold truncate">{u.display_name || u.email}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  {u.id === myUserId && <p className="text-[10px] text-yellow-400 mt-0.5">This is your account</p>}
                </div>
                <div className="md:col-span-2 flex items-center gap-2 flex-wrap">
                  <RolePill role={u.role} />
                  <StatusPill active={u.is_active} />
                  <TutorApprovalPill status={u.tutor_approval_status} />
                </div>
                <div className="md:col-span-2 text-sm text-gray-300 truncate">{u.phone_number || '—'}</div>
                <div className="md:col-span-2 text-xs text-gray-400">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('en-ZA') : '—'}
                </div>
                <div className="md:col-span-2 flex md:justify-end gap-2 flex-wrap">
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={actionLoading || u.id === myUserId}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      u.is_active
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {u.is_active ? 'Suspend' : 'Reactivate'}
                  </button>
                  <button
                    onClick={() => remove(u)}
                    disabled={actionLoading || u.id === myUserId}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6 max-w-2xl">
        🔒 Suspending a user blocks them from logging in but keeps their data. Deleting removes the account
        and (via cascade) their profile, bookings, reviews, and uploads. Both actions are written to the
        admin audit log.
      </p>
    </div>
  );
}

export default UserManagement;
