import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'https://fintrack-apoorva.onrender.com/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Registration failed')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setMessage('Account created successfully!')

      setTimeout(() => {
        navigate('/login')
      }, 1000)

    } catch (error) {
      setMessage('Unable to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">

        <h1 className="text-center text-3xl font-bold text-emerald-400">
          FinTrack
        </h1>

        <h2 className="mt-6 text-2xl font-semibold">Create account</h2>

        <p className="mt-2 text-slate-400">
          Start tracking your finances
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">

          <div>
            <label className="mb-2 block text-sm">Full name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />
          </div>

          {message && (
            <p className="text-sm text-emerald-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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
