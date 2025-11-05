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
      window.location.href = '/';
    } catch {
      setErr('Network error');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Bloc principal */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '40px 32px',
          width: 360,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
        }}
      >
        {/* Logo optionnel */}
        {/* <img src="/logo.png" alt="WWHC" style={{ width: 60, marginBottom: 16 }} /> */}

        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, color: '#111827' }}>
          Deal Evaluation Matrix
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
          Enter the access code to continue
        </p>

        <form onSubmit={submit}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
              marginBottom: 14,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: '#111827',
              color: 'white',
              fontWeight: 500,
              fontSize: 14,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </form>

        {err && (
          <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 12 }}>{err}</div>
        )}
      </div>

      {/* Footer */}
      <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 24 }}>
        © White Wolf Capital — Internal Tool
      </p>
    </div>
  );
}
