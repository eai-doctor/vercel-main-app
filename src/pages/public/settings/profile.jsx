import React, { useState } from 'react';
import { Card, CardHeader } from './components/card';
import { Button, StatusBanner } from '@/components/ui';
import { authUpdateProfile } from '@/api/authApi';

const inputCls =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3B8D] focus:border-transparent';

export default function Profile({ user, t }) {
  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true); setStatus(null);
    try {
      await authUpdateProfile({ name: name.trim() });
      setStatus({ type: 'success', message: t('account:profile.saved') });
    } catch {
      setStatus({ type: 'error', message: t('account:profile.error') });
    } finally {
      setSaving(false);
    }
  };

  const unchanged = !name.trim() || name.trim() === user?.name;

  return (
    <Card>
      <CardHeader>{t('account:profile.heading')}</CardHeader>
      <div className="px-6 py-5 space-y-4">
        <StatusBanner status={status} />
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1.5">
            {t('account:profile.nameLabel')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('account:profile.namePlaceholder')}
            className={inputCls}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving || unchanged}>
            {saving ? t('account:profile.saving') : t('account:profile.saveButton')}
          </Button>
        </div>
      </div>
    </Card>
  );
}