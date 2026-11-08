
import { Link } from 'react-router-dom'

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-emerald-400">
          FinTrack
        </h1>

        <h2 className="mt-6 text-2xl font-semibold">Create account</h2>
        <p className="mt-2 text-slate-400">Start tracking your finances</p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm">Full name</label>
            <input
              type="text"
              placeholder="Your name"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
