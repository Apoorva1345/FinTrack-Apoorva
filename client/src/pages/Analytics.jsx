import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Analytics() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(
          'https://fintrack-apoorva.onrender.com/api/transactions',
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

        if (!response.ok) {
          throw new Error('Unable to load transactions')
        }

        const data = await response.json()
        setTransactions(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [token, navigate])

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + Number(item.amount), 0)

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + Number(item.amount), 0)

  const monthlyData = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - i)

    const month = date.getMonth()
    const year = date.getFullYear()

    const monthTransactions = transactions.filter((item) => {
      const transactionDate = new Date(
        item.date || item.createdAt
      )

      return (
        !isNaN(transactionDate.getTime()) &&
        transactionDate.getMonth() === month &&
        transactionDate.getFullYear() === year
      )
    })

    monthlyData.push({
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      income: monthTransactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount), 0),
      expenses: monthTransactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount), 0),
    })
  }

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyData.flatMap((item) => [item.income, item.expenses])
  )

  const categories = {}

  transactions
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      const category = item.category || 'Other'
      categories[category] =
        (categories[category] || 0) + Number(item.amount)
    })

  const categoryData = Object.entries(categories).sort(
    (a, b) => b[1] - a[1]
  )

  const colors = [
    '#10b981',
    '#f97316',
    '#3b82f6',
    '#eab308',
    '#a855f7',
    '#ec4899',
    '#06b6d4',
  ]

  const categoryTotal = categoryData.reduce(
    (sum, item) => sum + item[1],
    0
  )

  let currentAngle = 0

  const pieGradient =
    categoryData.length > 0
      ? `conic-gradient(${categoryData
          .map(([category, amount], index) => {
            const start = currentAngle
            const percentage = (amount / categoryTotal) * 360
            currentAngle += percentage

            return `${colors[index % colors.length]} ${start}deg ${currentAngle}deg`
          })
          .join(', ')})`
      : '#334155'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-center text-white">
        Loading analytics...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">
            FinTrack
          </h1>
          <p className="mt-2 text-slate-400">
            Financial Analytics
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg border border-slate-700 px-5 py-3 hover:bg-slate-800"
        >
          Back to Dashboard
        </button>
      </header>

      <main className="mx-auto mt-12 max-w-6xl">
        {error && (
          <p className="mb-6 rounded-lg bg-red-950 p-4 text-red-300">
            {error}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-8">
            <p className="text-slate-400">Total Income</p>
            <h2 className="mt-4 text-3xl font-bold text-emerald-400">
              {formatMoney(income)}
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-900 p-8">
            <p className="text-slate-400">Total Expenses</p>
            <h2 className="mt-4 text-3xl font-bold text-red-400">
              {formatMoney(expenses)}
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-900 p-8">
            <p className="text-slate-400">Total Transactions</p>
            <h2 className="mt-4 text-3xl font-bold">
              {transactions.length}
            </h2>
          </div>
        </div>

        {/* Monthly Analytics */}
        <section className="mt-10 rounded-2xl bg-slate-900 p-6 md:p-8">
          <h2 className="text-2xl font-bold">
            Monthly Income vs Expenses
          </h2>

          <p className="mt-2 text-slate-400">
            Your financial activity over the last six months
          </p>

          <div className="mt-8 space-y-7">
            {monthlyData.map((item) => (
              <div key={`${item.label}-${monthlyData.indexOf(item)}`}>
                <div className="mb-3 flex justify-between">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-sm text-slate-400">
                    {formatMoney(item.income - item.expenses)} net
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs text-slate-400">
                      Income
                    </span>
                    <div className="h-4 flex-1 rounded-full bg-slate-800">
                      <div
                        className="h-4 rounded-full bg-emerald-500"
                        style={{
                          width: `${(item.income / maxMonthlyValue) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-28 text-right text-xs">
                      {formatMoney(item.income)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs text-slate-400">
                      Expense
                    </span>
                    <div className="h-4 flex-1 rounded-full bg-slate-800">
                      <div
                        className="h-4 rounded-full bg-red-400"
                        style={{
                          width: `${(item.expenses / maxMonthlyValue) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-28 text-right text-xs">
                      {formatMoney(item.expenses)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              Income
            </span>
            <span className="flex items-center gap-2 text-red-400">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              Expenses
            </span>
          </div>
        </section>

        {/* Expense Categories */}
        <section className="mt-10 rounded-2xl bg-slate-900 p-6 md:p-8">
          <h2 className="text-2xl font-bold">
            Expense Categories
          </h2>

          {categoryData.length === 0 ? (
            <p className="mt-8 text-slate-400">
              No expense data available yet.
            </p>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-10 md:flex-row">
              <div
                className="h-64 w-64 shrink-0 rounded-full"
                style={{ background: pieGradient }}
              />

              <div className="w-full space-y-4">
                {categoryData.map(([category, amount], index) => (
                  <div
                    key={category}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            colors[index % colors.length],
                        }}
                      />
                      {category}
                    </span>

                    <span className="font-semibold">
                      {formatMoney(amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Analytics