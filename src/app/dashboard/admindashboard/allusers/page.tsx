"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search, Trash2, RefreshCw, Filter,
  CheckCircle, AlertTriangle, X, Shield,
  User, Store, ChevronDown, ChevronUp,
  Eye, Ban, BadgeCheck, Clock,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SellerProfile {
  businessName: string; businessType: string;
  businessCategory: string; country: string;
  address: string; tradeLicense: string;
}

interface UserDoc {
  _id: string; uid: string;
  email: string; firstName: string; lastName: string;
  phone: string; role: string;
  sellerStatus: string; isSellerVerified: boolean;
  isEmailVerified: boolean; isActive: boolean;
  authProvider: string; sellerProfile?: SellerProfile;
  lastLoginAt?: string; createdAt: string;
}

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin:  "bg-purple-100 text-purple-700",
    seller: "bg-blue-100 text-blue-700",
    user:   "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${map[role] || map.user}`}>
      {role}
    </span>
  );
}

function SellerBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending:  "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-600",
    none:     "bg-gray-100 text-gray-400",
  };
  const icon: Record<string, React.ReactNode> = {
    approved: <BadgeCheck className="w-3 h-3" />,
    pending:  <Clock className="w-3 h-3" />,
    rejected: <X className="w-3 h-3" />,
    none:     null,
  };
  if (status === "none") return null;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${map[status]}`}>
      {icon[status]} {status}
    </span>
  );
}

// ── User detail expanded row ───────────────────────────────────────────────
function UserDetail({ user }: { user: UserDoc }) {
  return (
    <tr>
      <td colSpan={8} className="bg-slate-50 px-6 py-4 border-b border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-widest mb-2">Account Info</p>
            <div className="space-y-1 text-gray-700">
              <p>UID: <span className="font-mono text-gray-500 text-[10px]">{user.uid}</span></p>
              <p>Provider: <b>{user.authProvider}</b></p>
              <p>Email verified: <b>{user.isEmailVerified ? "Yes ✅" : "No ❌"}</b></p>
              <p>Phone: <b>{user.phone || "—"}</b></p>
              <p>Last login: <b>{formatDate(user.lastLoginAt)}</b></p>
              <p>Joined: <b>{formatDate(user.createdAt)}</b></p>
            </div>
          </div>

          {user.sellerProfile && (
            <div>
              <p className="font-bold text-gray-400 uppercase tracking-widest mb-2">Seller Profile</p>
              <div className="space-y-1 text-gray-700">
                <p>Business: <b>{user.sellerProfile.businessName || "—"}</b></p>
                <p>Type: <b>{user.sellerProfile.businessType || "—"}</b></p>
                <p>Category: <b>{user.sellerProfile.businessCategory || "—"}</b></p>
                <p>Country: <b>{user.sellerProfile.country || "—"}</b></p>
                <p>License: <b>{user.sellerProfile.tradeLicense || "—"}</b></p>
                <p>Address: <b>{user.sellerProfile.address || "—"}</b></p>
              </div>
            </div>
          )}

          <div>
            <p className="font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
            <div className="space-y-1 text-gray-700">
              <p>Account: <b>{user.isActive ? "Active ✅" : "Suspended 🚫"}</b></p>
              <p>Seller verified: <b>{user.isSellerVerified ? "Yes ✅" : "No"}</b></p>
              <p>Seller status: <b>{user.sellerStatus}</b></p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users,        setUsers]        = useState<UserDoc[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState("");
  const [filterRole,   setFilterRole]   = useState("");
  const [filterSeller, setFilterSeller] = useState("");
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [stats,        setStats]        = useState<{_id: string; count: number}[]>([]);
  const [expandedUid,  setExpandedUid]  = useState<string | null>(null);
  const [actionLoading,setActionLoading]= useState<string | null>(null);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const limit = 15;

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(limit),
        ...(search       && { search }),
        ...(filterRole   && { role: filterRole }),
        ...(filterSeller && { sellerStatus: filterSeller }),
      });
      const res  = await fetch(`${API}/users?${params}`, { credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setUsers(json.data);
      setTotal(json.total);
      setStats(json.stats || []);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }, [page, search, filterRole, filterSeller]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Toggle active ─────────────────────────────────────────────────────────
  const toggleActive = async (user: UserDoc) => {
    setActionLoading(user.uid);
    try {
      const res  = await fetch(`${API}/users/${user.uid}/status`, {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast(json.message, "success");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally { setActionLoading(null); }
  };

  // ── Seller status ──────────────────────────────────────────────────────────
  const updateSellerStatus = async (user: UserDoc, status: "approved" | "rejected") => {
    setActionLoading(user.uid + status);
    try {
      const res  = await fetch(`${API}/users/${user.uid}/seller-status`, {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast(json.message, "success");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally { setActionLoading(null); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteUser = async (user: UserDoc) => {
    if (!confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) return;
    setActionLoading(user.uid + "del");
    try {
      const res  = await fetch(`${API}/users/${user.uid}`, {
        method: "DELETE", credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("User deleted", "success");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally { setActionLoading(null); }
  };

  const totalPages = Math.ceil(total / limit);

  const statMap = Object.fromEntries(stats.map((s) => [s._id, s.count]));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total users</p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users",    value: total,                icon: <User className="w-5 h-5 text-blue-600" />,   color: "bg-blue-50" },
          { label: "Sellers",        value: statMap.seller || 0,  icon: <Store className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
          { label: "Admins",         value: statMap.admin  || 0,  icon: <Shield className="w-5 h-5 text-red-600" />,  color: "bg-red-50" },
          { label: "Regular Users",  value: statMap.user   || 0,  icon: <User className="w-5 h-5 text-green-600" />,  color: "bg-green-50" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-300 outline-none"
          />
        </div>
        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white min-w-[130px]">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <select value={filterSeller} onChange={(e) => { setFilterSeller(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white min-w-[160px]">
          <option value="">All Seller Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" /> {error}
          <button onClick={fetchUsers} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">Seller</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200" /><div className="h-4 w-28 bg-gray-200 rounded" /></div></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded-full" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-16 bg-gray-200 rounded-full" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-16 bg-gray-200 rounded-full" /></td>
                    <td className="px-4 py-3"><div className="h-8 w-24 bg-gray-200 rounded-xl mx-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No users found</p>
                  </td>
                </tr>
              ) : users.map((user) => {
                const isExpanded = expandedUid === user.uid;
                const fullName = `${user.firstName} ${user.lastName}`.trim();
                const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

                return (
                  <>
                    <tr key={user.uid}
                      className={`hover:bg-gray-50 transition ${!user.isActive ? "opacity-50" : ""}`}>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                            user.role === "admin"  ? "bg-purple-500" :
                            user.role === "seller" ? "bg-blue-500"   : "bg-gray-400"
                          }`}>
                            {initials || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-xs truncate">{fullName || "—"}</p>
                            <button
                              onClick={() => setExpandedUid(isExpanded ? null : user.uid)}
                              className="text-[10px] text-purple-500 hover:text-purple-700 flex items-center gap-0.5">
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {isExpanded ? "Less" : "More"}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-gray-600 truncate max-w-[200px]">{user.email}</p>
                        <p className="text-[10px] text-gray-400">{user.authProvider}</p>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Seller status */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <SellerBadge status={user.sellerStatus} />
                        {user.sellerStatus === "pending" && (
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => updateSellerStatus(user, "approved")}
                              disabled={!!actionLoading}
                              className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold hover:bg-green-200 transition">
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => updateSellerStatus(user, "rejected")}
                              disabled={!!actionLoading}
                              className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold hover:bg-red-200 transition">
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                      </td>

                      {/* Active status */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                          user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {user.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Suspend/Activate */}
                          <button
                            onClick={() => toggleActive(user)}
                            disabled={actionLoading === user.uid}
                            title={user.isActive ? "Suspend" : "Activate"}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                              user.isActive
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-600"
                                : "bg-green-50 hover:bg-green-100 text-green-600"
                            }`}>
                            {actionLoading === user.uid
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : user.isActive ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />
                            }
                          </button>

                          {/* View */}
                          <button
                            onClick={() => setExpandedUid(isExpanded ? null : user.uid)}
                            title="View details"
                            className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition">
                            <Eye className="w-3 h-3" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteUser(user)}
                            disabled={actionLoading === user.uid + "del"}
                            title="Delete user"
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                            {actionLoading === user.uid + "del"
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : <Trash2 className="w-3 h-3" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail */}
                    {isExpanded && <UserDetail key={`exp-${user.uid}`} user={user} />}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              Showing <b>{(page - 1) * limit + 1}</b>–<b>{Math.min(page * limit, total)}</b> of <b>{total}</b>
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50">
                ← Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pg = i + 1;
                if (pg === 1 || pg === totalPages || (pg >= page - 1 && pg <= page + 1)) {
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold ${pg === page ? "bg-purple-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>
                      {pg}
                    </button>
                  );
                }
                if (pg === page - 2 || pg === page + 2) return <span key={pg} className="text-gray-400">…</span>;
                return null;
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}