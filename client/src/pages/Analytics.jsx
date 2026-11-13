import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

function Analytics() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/transactions',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          navigate('/login')
          return
        }

        if (!response.ok) throw new Error('Failed to load transactions')

        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  const barData = [
    { name: 'Income', amount: income },
    { name: 'Expenses', amount: expenses },
  ]

  const categoryTotals = {}

  transactions
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + item.amount
    })

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }))

  const COLORS = ['#10b981', '#f87171', '#38bdf8', '#fbbf24', '#a78bfa', '#fb923c']

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">
              FinTrack
            </h1>
            <p className="mt-2 text-slate-400">Financial Analytics</p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </header>

        {loading ? (
          <p className="mt-10 text-slate-400">Loading analytics...</p>
        ) : (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-xl bg-slate-900 p-6">
                <p className="text-slate-400">Total Income</p>
                <p className="mt-3 text-2xl font-bold text-emerald-400">
                  ₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-6">
                <p className="text-slate-400">Total Expenses</p>
                <p className="mt-3 text-2xl font-bold text-red-400">
                  ₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-6">
                <p className="text-slate-400">Total Transactions</p>
                <p className="mt-3 text-2xl font-bold text-white">
                  {transactions.length}
                </p>
              </div>
            </div>

            <section className="mt-8 rounded-xl bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">
                Income vs Expenses
              </h2>

              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      formatter={(value) => `₹${Number(value).toFixed(2)}`}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="mt-8 rounded-xl bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">
                Expense Category Breakdown
              </h2>

              {pieData.length === 0 ? (
                <p className="mt-6 text-slate-400">
                  No expense data available yet.
                </p>
              ) : (
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `₹${Number(value).toFixed(2)}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Analytics