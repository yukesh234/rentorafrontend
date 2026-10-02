/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Users, ListChecks, Loader2, LogOut, Eye } from 'lucide-react';
import { getPendingListings, approveListing, rejectListing, getAllUsers } from '../../services/adminService';
import { useAdminAuthStore } from '../../stores/AdminAuthstore.js';
import AdminListingModal from '../../components/admin/AdminListingModal.jsx';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const admin = useAdminAuthStore((s) => s.admin);
  const logout = useAdminAuthStore((s) => s.logout);

  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [viewing, setViewing] = useState(null); // { listing, rejecting } | null

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setIsLoading(true);
    try {
      const [pendingData, usersData] = await Promise.all([getPendingListings(), getAllUsers()]);
      setPending(pendingData);
      setUsers(usersData);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id) {
    setActingId(id);
    try {
      await approveListing(id);
      setPending((prev) => prev.filter((l) => l.id !== id));
      setUsers((prev) => prev); // counts refresh on next full load; fine for now
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id, reason) {
    setActingId(id);
    try {
      await rejectListing(id, reason);
      setPending((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setActingId(null);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout(); // clears the refresh cookie on the server and the local session
    navigate('/admin/login', { replace: true });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1C1917]">
        <Loader2 size={28} className="animate-spin text-[#D4A574]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Outfit'] text-xl font-semibold text-[#F5F0EB]">Admin dashboard</h1>
            {admin && (
              <p className="text-xs text-[#8A7F76]">
                {admin.name} · {admin.email}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 rounded-lg border border-[#2A2622] px-3 py-1.5 text-xs font-medium text-[#F5F0EB] hover:bg-[#211D1A] disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
            Log out
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[#8A7F76]">
            <ListChecks size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">
              Pending listings ({pending.length})
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {pending.length === 0 ? (
              <p className="text-sm text-[#6B615A]">Nothing waiting for review.</p>
            ) : (
              pending.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-xl border border-[#2A2622] bg-[#211D1A] p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[#F5F0EB]">{l.title}</p>
                    <p className="text-xs text-[#8A7F76]">
                      {l.category} · by {l.ownerName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewing({ listing: l, rejecting: false })}
                      className="flex items-center gap-1 rounded-lg border border-[#2A2622] px-3 py-1.5 text-xs font-medium text-[#D4A574] hover:bg-[#2A2622]"
                    >
                      <Eye size={13} />
                      View
                    </button>
                    <button
                      onClick={() => handleApprove(l.id)}
                      disabled={actingId === l.id}
                      className="flex items-center gap-1 rounded-lg border border-green-500/30 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/10 disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      Approve
                    </button>
                    <button
                      onClick={() => setViewing({ listing: l, rejecting: true })}
                      disabled={actingId === l.id}
                      className="flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-[#E07856] hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[#8A7F76]">
            <Users size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">
              All users ({users.length})
            </span>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#2A2622]">
            <table className="w-full text-sm">
              <thead className="bg-[#181512] text-xs uppercase text-[#8A7F76]">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-center">Active listings</th>
                </tr>
              </thead>
              <tbody className="bg-[#211D1A]">
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[#2A2622]">
                    <td className="px-4 py-2.5 text-[#F5F0EB]">{u.name}</td>
                    <td className="px-4 py-2.5 text-[#8A7F76]">{u.email}</td>
                    <td className="px-4 py-2.5 text-center text-[#D4A574]">{u.activeListingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewing && (
        <AdminListingModal
          listing={viewing.listing}
          startRejecting={viewing.rejecting}
          isActing={actingId === viewing.listing.id}
          onClose={() => setViewing(null)}
          onApprove={async (id) => {
            await handleApprove(id);
            setViewing(null);
          }}
          onReject={async (id, reason) => {
            await handleReject(id, reason);
            setViewing(null);
          }}
        />
      )}
    </div>
  );
}