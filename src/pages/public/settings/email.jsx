import React, { useState } from 'react';
import { Card, CardHeader } from './components/card';
import { Button, StatusBanner } from '@/components/ui';

export default function Email({ user, changeEmail, verifyEmailChange, t, inputCls }) {
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('request');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const requestChange = async () => {
    if (!newEmail.trim()) return;
    setBusy(true); setStatus(null);
    try {
      await changeEmail(newEmail.trim());
      setStep('verify');
      setStatus({ type: 'success', message: t('account:email.verificationSent') });
    } catch (err) {
      setStatus({ type: 'error', message: getErrMsg(err, t('account:email.error')) });
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (code.length !== 6) return;
    setBusy(true); setStatus(null);
    try {
      await verifyEmailChange(code.trim());
      setStatus({ type: 'success', message: t('account:email.changed') });
      setStep('request');
      setNewEmail(''); setCode('');
    } catch (err) {
      setStatus({ type: 'error', message: getErrMsg(err, t('account:email.error')) });
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => { setStep('request'); setCode(''); setStatus(null); };

  return (
    <Card>
      <CardHeader>{t('account:email.heading')}</CardHeader>
      <div className="px-6 py-5 space-y-4">
        <StatusBanner status={status} />
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1.5">
            {t('account:email.currentLabel')}
          </label>
          <p className="text-sm text-[#1e293b] bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
            {user?.email}
          </p>
        </div>

        {step === 'request' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5">
                {t('account:email.newLabel')}
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t('account:email.newPlaceholder')}
                className={inputCls}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={requestChange} disabled={busy || !newEmail.trim()}>
                {busy ? t('account:email.changing') : t('account:email.changeButton')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-[#475569]">{t('account:email.verificationPrompt')}</p>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('account:email.codePlaceholder')}
              maxLength={6}
              className={`${inputCls} text-center tracking-[0.3em] font-mono`}
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={cancel}>
                {t('common:buttons.cancel')}
              </Button>
              <Button onClick={verify} disabled={busy || code.length !== 6}>
                {busy ? t('account:email.verifying') : t('account:email.verifyButton')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}