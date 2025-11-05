"use client";

import { useState } from "react";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      // access cookie set by API → send user to the app
      window.location.href = "/";
    } else {
      setError("Invalid access code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-gray-200 p-6 shadow-sm"
      >
        <h1 className="mb-3 text-xl font-semibold">Enter access code</h1>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900"
        />

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-black"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
