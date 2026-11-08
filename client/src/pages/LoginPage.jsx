
import { Link } from 'react-router-dom'

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-emerald-400">
          FinTrack
        </h1>

        <h2 className="mt-6 text-2xl font-semibold">Welcome back</h2>
        <p className="mt-2 text-slate-400">Login to your account</p>

        <form className="mt-6 space-y-4">
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
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
