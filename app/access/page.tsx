'use client';

import { useState } from 'react';

export default function AccessPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const r = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j?.error || 'Invalid code');
        setLoading(false);
        return;
      }
      // Cookie posé par le serveur -> on peut entrer
      window.location.href = '/';
    } catch {
      setErr('Network error');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <form onSubmit={submit} style={{ width: 320, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Enter access code</h1>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 10 }}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          style={{
            width: '100%', padding: 10, borderRadius: 8, border: '1px solid #111827',
            background: '#111827', color: 'white', opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Checking…' : 'Continue'}
        </button>
        {err && <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 8 }}>{err}</div>}
      </form>
    </div>
  );
}
