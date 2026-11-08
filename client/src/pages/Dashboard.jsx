
import { Link } from 'react-router-dom'

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-400">FinTrack</h1>
        <Link
          to="/login"
          className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
        >
          Logout
        </Link>
      </header>

      <main className="mx-auto mt-12 max-w-5xl">
        <h2 className="text-3xl font-semibold">Welcome to FinTrack!</h2>
        <p className="mt-2 text-slate-400">
          Your personal finance dashboard
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">Total Balance</p>
            <p className="mt-3 text-2xl font-bold">₹0.00</p>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">Income</p>
            <p className="mt-3 text-2xl font-bold text-emerald-400">₹0.00</p>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">Expenses</p>
            <p className="mt-3 text-2xl font-bold text-red-400">₹0.00</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
