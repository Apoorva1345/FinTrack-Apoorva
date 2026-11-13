import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  })

  const [transactions, setTransactions] = useState([])

  // Add transaction form
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')

  // Edit transaction form
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: '',
    note: '',
  })

  // Search and filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')

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

  // Add transaction
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
      setType('expense')
      setCategory('Food')
      setMessage('Transaction added successfully!')

      await fetchData()
    } catch (error) {
      setMessage('Unable to connect to server')
    }
  }

  // Open edit form
  const handleEdit = (transaction) => {
    setEditingId(transaction._id)

    setEditForm({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().slice(0, 10),
      note: transaction.note || '',
    })

    setMessage('')
  }

  // Update transaction
  const handleUpdateTransaction = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/transactions/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...editForm,
            amount: Number(editForm.amount),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Could not update transaction')
        return
      }

      setEditingId(null)
      setMessage('Transaction updated successfully!')

      await fetchData()
    } catch (error) {
      setMessage('Unable to update transaction')
    }
  }

  // Delete transaction
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this transaction?'
    )

    if (!confirmed) return

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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Format currency
  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  // Available categories
  const categories = [
    ...new Set([
      'Food',
      'Salary',
      'Shopping',
      'Travel',
      'Education',
      'Health',
      'Entertainment',
      'Other',
      ...transactions.map((transaction) => transaction.category),
    ]),
  ]

  // Search, filter and sort
  const filteredTransactions = useMemo(() => {
    let result = [...transactions]

    if (search.trim()) {
      const searchText = search.toLowerCase()

      result = result.filter(
        (transaction) =>
          transaction.title?.toLowerCase().includes(searchText) ||
          transaction.category?.toLowerCase().includes(searchText) ||
          transaction.note?.toLowerCase().includes(searchText)
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter(
        (transaction) => transaction.type === typeFilter
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter(
        (transaction) => transaction.category === categoryFilter
      )
    }

    if (dateFrom) {
      result = result.filter(
        (transaction) =>
          new Date(transaction.date) >= new Date(`${dateFrom}T00:00:00`)
      )
    }

    if (dateTo) {
      result = result.filter(
        (transaction) =>
          new Date(transaction.date) <= new Date(`${dateTo}T23:59:59.999`)
      )
    }

    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.date) - new Date(a.date)
      }

      if (sortOrder === 'oldest') {
        return new Date(a.date) - new Date(b.date)
      }

      if (sortOrder === 'highest') {
        return Number(b.amount) - Number(a.amount)
      }

      if (sortOrder === 'lowest') {
        return Number(a.amount) - Number(b.amount)
      }

      return 0
    })

    return result
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
    dateFrom,
    dateTo,
    sortOrder,
  ])

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setDateFrom('')
    setDateTo('')
    setSortOrder('newest')
  }

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

        {/* Summary Cards */}
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

        {/* Add Transaction */}
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

        {/* Transaction History */}
        <section className="mt-10 rounded-xl bg-slate-900 p-6">
          <h3 className="text-2xl font-semibold">
            Transaction History
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Search, filter and manage your transactions.
          </p>

          <div className="mt-6">
            <input
              type="text"
              placeholder="Search by title, category or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
              <option value="all">All Categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
              />
            </div>

            <button
              onClick={clearFilters}
              className="self-end rounded-lg border border-emerald-500 p-3 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold">Your Transactions</h4>
            <span className="text-sm text-slate-400">
              Showing {filteredTransactions.length} of {transactions.length}
            </span>
          </div>

          {loading ? (
            <p className="mt-5 text-slate-400">
              Loading transactions...
            </p>
          ) : filteredTransactions.length === 0 ? (
            <p className="mt-5 rounded-lg bg-slate-800 p-5 text-center text-slate-400">
              No matching transactions found.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="rounded-lg bg-slate-800 p-4"
                >
                  {editingId === transaction._id ? (
                    <form
                      onSubmit={handleUpdateTransaction}
                      className="grid gap-3 md:grid-cols-2"
                    >
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="Title"
                        required
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3"
                      />

                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            amount: e.target.value,
                          })
                        }
                        min="0.01"
                        step="0.01"
                        required
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3"
                      />

                      <select
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            type: e.target.value,
                          })
                        }
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3"
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>

                      <select
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            category: e.target.value,
                          })
                        }
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3"
                      >
                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            date: e.target.value,
                          })
                        }
                        required
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3"
                      />

                      <input
                        type="text"
                        value={editForm.note}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            note: e.target.value,
                          })
                        }
                        placeholder="Note (optional)"
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3"
                      />

                      <div className="flex gap-3 md:col-span-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-slate-600 px-5 py-2 hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {transaction.title}
                        </p>

                        <p className="text-sm text-slate-400">
                          {transaction.category} ·{' '}
                          {new Date(transaction.date).toLocaleDateString('en-IN')}
                        </p>

                        {transaction.note && (
                          <p className="mt-1 text-sm text-slate-500">
                            {transaction.note}
                          </p>
                        )}
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
                          onClick={() => handleEdit(transaction)}
                          className="text-sm text-emerald-400 hover:text-emerald-300"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
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