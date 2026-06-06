import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
        <h1 className="text-4xl font-bold">Funtush Frontend</h1>
        <p className="mt-4 text-lg text-slate-600">
          The app is running. Use the links below to navigate to available pages.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-xl bg-primary-600 px-6 py-4 text-center text-white transition hover:bg-primary-700"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-slate-900 px-6 py-4 text-center text-white transition hover:bg-slate-800"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
