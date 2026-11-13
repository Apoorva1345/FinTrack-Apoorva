import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  })

  const [transactions, setTransactions] = useState([])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchData = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [summaryResponse, transactionResponse] = await Promise.all([
        fetch('http://localhost:5000/api/transactions/summary', { headers }),
        fetch('http://localhost:5000/api/transactions', { headers }),
      ])

      if (
        summaryResponse.status === 401 ||
        transactionResponse.status === 401
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }

      if (!summaryResponse.ok || !transactionResponse.ok) {
        throw new Error('Could not load dashboard data')
      }

      const summaryData = await summaryResponse.json()
      const transactionData = await transactionResponse.json()

      setSummary(summaryData)
      setTransactions(transactionData)
    } catch (error) {
      setMessage(error.message || 'Unable to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          type,
          category,
          note,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Could not add transaction')
        return
      }

      setTitle('')
      setAmount('')
      setNote('')
      setMessage('Transaction added successfully!')

      await fetchData()
    } catch (error) {
      setMessage('Unable to connect to server')
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/transactions/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Could not delete transaction')
      }

      setMessage('Transaction deleted successfully!')
      await fetchData()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-emerald-400">
          FinTrack
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/analytics')}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Analytics
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto mt-12 max-w-5xl">
        <h2 className="text-3xl font-semibold">
          Welcome, {user.name || 'User'}!
        </h2>

        <p className="mt-2 text-slate-400">
          Your personal finance dashboard
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">Total Balance</p>
            <p className="mt-3 text-2xl font-bold">
              {formatMoney(summary.balance)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">Income</p>
            <p className="mt-3 text-2xl font-bold text-emerald-400">
              {formatMoney(summary.income)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">Expenses</p>
            <p className="mt-3 text-2xl font-bold text-red-400">
              {formatMoney(summary.expenses)}
            </p>
          </div>
        </div>

        <section className="mt-10 rounded-xl bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Add Transaction</h3>

          <form
            onSubmit={handleAddTransaction}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            <input
              type="text"
              placeholder="Transaction title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />

            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
              <option>Food</option>
              <option>Salary</option>
              <option>Shopping</option>
              <option>Travel</option>
              <option>Education</option>
              <option>Health</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400 md:col-span-2"
            />

            <button
              type="submit"
              className="rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 hover:bg-emerald-400 md:col-span-2"
            >
              Add Transaction
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-emerald-400">
              {message}
            </p>
          )}
        </section>

        <section className="mt-10 rounded-xl bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Recent Transactions</h3>

          {loading ? (
            <p className="mt-5 text-slate-400">
              Loading transactions...
            </p>
          ) : transactions.length === 0 ? (
            <p className="mt-5 text-slate-400">
              No transactions yet. Add your first transaction above!
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-800 p-4"
                >
                  <div>
                    <p className="font-semibold">{transaction.title}</p>
                    <p className="text-sm text-slate-400">
                      {transaction.category} ·{' '}
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={
                        transaction.type === 'income'
                          ? 'font-semibold text-emerald-400'
                          : 'font-semibold text-red-400'
                      }
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatMoney(transaction.amount)}
                    </span>

                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard
