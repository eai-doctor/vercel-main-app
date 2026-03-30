import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import config from './config';
import ProfileDropdown from './components/ProfileDropdown';
import LanguageSwitcher from './components/LanguageSwitcher';
import { SettingsIcon } from './components/icons';

const ROLE_OPTIONS = ['clinician', 'patient', 'admin'];

const AdminSettings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['admin', 'common']);
  const [users, setUsers] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchClinicians();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${config.authServiceUrl}/api/admin/users`);
      setUsers(res.data.users || []);
    } catch (err) {
      const msg = err.response?.status === 403
        ? t('admin:accessDenied')
        : err.response?.data?.error || t('admin:failedToLoad');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicians = async () => {
    try {
      const res = await axios.get(`${config.authServiceUrl}/api/admin/clinicians`);
      setClinicians(res.data.clinicians || []);
    } catch {
      // non-fatal
    }
  };

  const handleRoleChange = (user, newRole) => {
    if (newRole === user.role) return;
    setConfirmModal({ user, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirmModal) return;
    const { user, newRole } = confirmModal;
    setUpdating(true);
    try {
      await axios.put(`${config.authServiceUrl}/api/admin/users/${user.id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      setConfirmModal(null);
    } catch (err) {
      setError(err.response?.data?.error || t('admin:failedToUpdate'));
      setConfirmModal(null);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignClinician = async (patientId, clinicianId) => {
    setAssigningId(patientId);
    try {
      await axios.put(
        `${config.authServiceUrl}/api/admin/users/${patientId}/assign-clinician`,
        { clinician_id: clinicianId || null }
      );
      setUsers(prev => prev.map(u =>
        u.id === patientId ? { ...u, assigned_clinician_id: clinicianId || null } : u
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update clinician assignment');
    } finally {
      setAssigningId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) ||
           u.email?.toLowerCase().includes(q) ||
           u.role?.toLowerCase().includes(q);
  });

  const formatDate = (iso) => {
    if (!iso) return '-';
    const locale = i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(iso).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const roleBadgeColor = (role) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'clinician') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] z-50" />

      {/* Header */}
      <header className="mt-[3px] bg-white/95 backdrop-blur-[20px] border-b border-[rgba(15,23,42,0.1)] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1e293b]">
                <SettingsIcon className="w-8 h-8 inline text-[#3b82f6] mr-2" />
                {t('admin:title')}
              </h1>
              <p className="text-sm text-[#475569] mt-1">{t('admin:subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/clinics')}
                className="flex items-center space-x-2 px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">{t('common:header.home')}</span>
              </button>
              <LanguageSwitcher />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t('admin:searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg shadow-sm focus:outline-none focus:border-[#3b82f6]"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-sm underline">{t('common:buttons.dismiss')}</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto"></div>
            <p className="mt-4 text-[#475569]">{t('admin:loadingUsers')}</p>
          </div>
        )}

        {/* User Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(15,23,42,0.1)] bg-[rgba(59,130,246,0.03)]">
              <p className="text-sm text-[#475569] font-medium">{t('admin:userCount', { count: filteredUsers.length })}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(15,23,42,0.1)]">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">{t('admin:tableHeaders.name')}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">{t('admin:tableHeaders.email')}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">{t('admin:tableHeaders.role')}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Assigned Clinician</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">{t('admin:tableHeaders.status')}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">{t('admin:tableHeaders.created')}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">{t('admin:tableHeaders.lastLogin')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-[rgba(15,23,42,0.05)] hover:bg-[rgba(59,130,246,0.02)] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#1e293b]">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-[#475569]">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3b82f6] ${roleBadgeColor(user.role)}`}
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'patient' ? (
                          <select
                            value={user.assigned_clinician_id || ''}
                            onChange={(e) => handleAssignClinician(user.id, e.target.value)}
                            disabled={assigningId === user.id}
                            className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(15,23,42,0.15)] bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 min-w-[160px]"
                          >
                            <option value="">— Unassigned —</option>
                            {clinicians.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name || c.email}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-[#94a3b8]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.is_active ? (
                          <span className="inline-flex items-center text-xs font-medium text-green-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                            {t('common:labels.active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-red-700">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                            {t('common:labels.inactive')}
                          </span>
                        )}
                        {!user.email_verified && (
                          <span className="ml-2 text-xs text-amber-600">({t('common:labels.unverified')})</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#475569]">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-[#475569]">{formatDate(user.last_login)}</td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-[#475569]">
                        {searchQuery ? t('admin:noUsersMatch') : t('admin:noUsers')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-[#1e293b] mb-3">{t('admin:confirmRoleChange')}</h3>
            <p className="text-sm text-[#475569] mb-1">
              Change <strong>{confirmModal.user.name}</strong>'s role from{' '}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColor(confirmModal.user.role)}`}>
                {confirmModal.user.role}
              </span>{' '}
              to{' '}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColor(confirmModal.newRole)}`}>
                {confirmModal.newRole}
              </span>?
            </p>
            <p className="text-xs text-[#64748b] mb-6">({confirmModal.user.email})</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModal(null)}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-[#475569] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('common:buttons.cancel')}
              </button>
              <button
                onClick={confirmRoleChange}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {updating ? t('admin:updating') : t('common:buttons.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
