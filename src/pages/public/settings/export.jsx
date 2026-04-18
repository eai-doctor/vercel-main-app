import React, { useState } from 'react';
import { Card, CardHeader } from './components/card';
import { Button, StatusBanner } from '@/components/ui';

export default function Export({ exportUserData, t }) {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true); setStatus(null);
    try {
      await exportUserData();
      setStatus({ type: 'success', message: t('account:export.success') });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: 'error', message: t('account:export.error') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card tone="info">
      <CardHeader tone="info">{t('account:export.heading')}</CardHeader>
      <div className="px-6 py-5 space-y-4">
        <p className="text-sm text-[#475569]">{t('account:export.description')}</p>
        <StatusBanner status={status} />
        <Button onClick={run} disabled={busy} className="inline-flex items-center gap-2">
          {busy ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('account:export.downloading')}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('account:export.button')}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}