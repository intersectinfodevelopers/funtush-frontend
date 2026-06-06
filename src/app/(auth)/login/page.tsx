'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    document.cookie = 'authToken=1; path=/; max-age=86400';
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Sign in to Funtush</h1>
          <p className="text-sm text-slate-600">Use any email and password for this demo.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error ? <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p> : null}

          <label className="block text-sm font-medium text-slate-900">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-medium text-slate-900">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Enter password"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
