'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AccessPage() {
  const sp = useSearchParams();
  const [code, setCode] = useState('');
  const error = sp.get('error');
  const next = sp.get('next') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        method="POST"
        action="/api/access"
        className="w-full max-w-sm rounded-xl border bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-lg font-semibold">Enter access code</h1>

        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Wrong code. Please try again.
          </div>
        )}

        <input
          type="password"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        />

        {/* Pour revenir à la page demandée après succès */}
        <input type="hidden" name="next" value={next} />

        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Access
        </button>
      </form>
    </div>
  );
}
