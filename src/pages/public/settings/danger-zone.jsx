import React, { useState } from 'react';
import { Card, CardHeader } from './components/card';
import { Button ,StatusBanner } from '@/components/ui';

const DangerZoneSection = ({ onRequestDelete, t }) => {
  return (
    <Card tone="danger">
      <CardHeader tone="danger">{t('account:delete.title')}</CardHeader>
      <div className="px-6 py-5 space-y-4">
        <p className="text-sm text-[#475569]">{t('account:delete.description')}</p>
        <Button variant="destructive" onClick={onRequestDelete}>
          {t('account:delete.button')}
        </Button>
      </div>
    </Card>
  );
}

const DeleteAccountModal = ({ open, onClose, deleteAccount, onSuccess, t }) => {
  const confirmPhrase = t('account:delete.confirmPhrase');
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const close = () => {
    if (busy) return;
    setInput(''); setError(null);
    onClose();
  };

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      await deleteAccount(confirmPhrase);
      onSuccess();
    } catch (err) {
      setError(getErrMsg(err, 'Failed to delete account.'));
      setBusy(false);
    }
  };

  const dataList = t('account:delete.dataList', { returnObjects: true });

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-lg w-full border border-[rgba(15,23,42,0.1)]">
        {/* Header */}
        <div className="bg-red-600 p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-bold text-white">{t('account:delete.button')}</h2>
          </div>
          <button
            onClick={close}
            className="text-white hover:text-gray-200 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#475569]">{t('account:delete.warning')}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-700 mb-2">{t('account:delete.cannotUndo')}</p>
            <ul className="text-sm text-red-600 space-y-1">
              {dataList.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-1.5">
              {t('account:delete.confirmLabel')}
              <code className="ml-1 bg-gray-100 px-2 py-0.5 rounded text-red-600 font-mono text-xs">
                {confirmPhrase}
              </code>
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('account:delete.confirmPlaceholder')}
              disabled={busy}
              className={`${inputCls} focus:ring-red-400`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(15,23,42,0.1)] px-6 py-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={close} disabled={busy}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            disabled={busy || input !== confirmPhrase}
          >
            {busy ? t('account:delete.deleting') : t('account:delete.button')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { DangerZoneSection, DeleteAccountModal };