// pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authResetPassword } from '@/api/authApi';
import { Input } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token') || '';
  const email           = searchParams.get('email') || '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const isMismatch = confirm.length > 0 && password !== confirm;
  const canSubmit  = password.length >= 8 && password === confirm && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true); setError('');
    try {
      await authResetPassword({ email, token, password });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500">Invalid reset link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full">
        <div className="bg-[#2C3B8D] p-5 rounded-t-2xl">
          <h2 className="text-white text-xl font-bold">E-AI Doctor</h2>
          <p className="text-white/80 text-sm">Set a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error   && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">Password reset! Redirecting…</div>}

          {/* New password */}
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="New password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12 h-12 border-gray-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2C3B8D]"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm password */}
          <div>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`h-12 border-gray-300 ${isMismatch ? 'border-red-300' : ''}`}
              required
            />
            {isMismatch && <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>}
          </div>

          <button
            disabled={!canSubmit}
            className="w-full bg-[#2C3B8D] hover:bg-[#1f2a63] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}