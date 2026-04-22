import React, { useState } from 'react';
import { Card, CardHeader } from './components/card';
import { Button ,StatusBanner } from '@/components/ui';
import { authUpdateProfile } from '@/api/authApi';

function PasswordSection({ changePassword, t, inputCls  }) {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const MIN_LEN = 8;
  const isTooShort = pw.next.length > 0 && pw.next.length < MIN_LEN;
  const isMismatch = pw.confirm.length > 0 && pw.next !== pw.confirm;
  const canSubmit =
    pw.current && pw.next.length >= MIN_LEN && pw.next === pw.confirm && !busy;

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true); setStatus(null);
    try {
      await authUpdateProfile({ currentPassword: pw.current, newPassword: pw.next });
      setStatus({ type: 'success', message: t('account:password.changed', 'Password changed successfully.') });
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setStatus({ type: 'error', message: t('account:password.error', 'Failed to change password.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>{t('account:password.heading', 'Change password')}</CardHeader>
      <div className="px-6 py-5 space-y-4">
        <StatusBanner status={status} />

        <PasswordField
          label={t('account:password.currentLabel', 'Current password')}
          value={pw.current}
          onChange={(v) => setPw((p) => ({ ...p, current: v }))}
          show={show.current}
          onToggle={() => toggle('current')}
          autoComplete="current-password"
          inputCls={inputCls }
        />

        <PasswordField
          label={t('account:password.newLabel', 'New password')}
          value={pw.next}
          onChange={(v) => setPw((p) => ({ ...p, next: v }))}
          show={show.next}
          onToggle={() => toggle('next')}
          autoComplete="new-password"
          hint={t("auth:passwordPlaceholderNew")}
          inputCls={inputCls }
          error={isTooShort ? t('account:password.tooShort', `Password must be at least ${MIN_LEN} characters.`) : null}
        />

        <PasswordField
          label={t('account:password.confirmLabel', 'Confirm new password')}
          value={pw.confirm}
          onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
          show={show.confirm}
          onToggle={() => toggle('confirm')}
          autoComplete="new-password"
          error={isMismatch ? t('account:password.mismatch', 'Passwords do not match.') : null}
          inputCls={inputCls }
        />

        <div className="flex justify-end">
          <Button onClick={submit} disabled={!canSubmit}>
            {busy ? t('account:password.saving', 'Saving…') : t('account:password.saveButton', 'Update password')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, autoComplete, hint, error, inputCls  }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#475569] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`${inputCls} pr-11 ${error ? 'border-red-300 focus:ring-red-400' : ''}`}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 px-3 text-[#94a3b8] hover:text-[#475569] transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            // eye-off
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            // eye
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-[#94a3b8]">{hint}</p>
      ) : null}
    </div>
  );
}

export {
    PasswordSection,
    PasswordField
}