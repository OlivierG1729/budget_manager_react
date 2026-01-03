import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { TrendingUp, Calendar, Award, Zap } from 'lucide-react'

// Fonction pour générer une couleur unique basée sur le nom
const stringToColor = (str) => {
  const colors = [
    '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', 
    '#14b8a6', '#a855f7', '#eab308', '#ef4444', '#22c55e',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return colors[Math.abs(hash) % colors.length]
}

// Card component
const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 ${className}`}>
    {children}
  </div>
)

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    violet: 'bg-violet-500/20 text-violet-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    rose: 'bg-rose-500/20 text-rose-300',
    amber: 'bg-amber-500/20 text-amber-300',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default function Statistics({ depenses, calculations, periodStart, periodEnd }) {
  const {
    totalExpenses,
    variableExpenses,
    fixedExpenses,
    expensesByCategory,
  } = calculations

  // Stats calculations
  const stats = useMemo(() => {
    if (depenses.length === 0) {
      return { avgPerDay: 0, maxExpense: 0, minExpense: 0, transactionCount: 0 }
    }
    const amounts = depenses.map(d => parseFloat(d.montant))
    const dates = [...new Set(depenses.map(d => d.date))]
    return {
      avgPerDay: totalExpenses / Math.max(dates.length, 1),
      maxExpense: Math.max(...amounts),
      minExpense: Math.min(...amounts),
      transactionCount: depenses.length
    }
  }, [depenses, totalExpenses])

  // Expenses by day of week
  const expensesByDayOfWeek = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const totals = Array(7).fill(0)
    depenses.forEach(d => {
      const dayIndex = new Date(d.date).getDay()
      totals[dayIndex] += parseFloat(d.montant)
    })
    return days.map((name, i) => ({ name, value: totals[i] }))
  }, [depenses])

  // Recent trend based on period
  const recentTrend = useMemo(() => {
    const days = []
    const start = new Date(periodStart)
    const end = new Date(periodEnd)
    const diffDays = Math.min(Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1, 14)
    
    for (let i = diffDays - 1; i >= 0; i--) {
      const date = new Date(end)
      date.setDate(end.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayTotal = depenses
        .filter(d => d.date === dateStr)
        .reduce((sum, d) => sum + parseFloat(d.montant), 0)
      days.push({
        name: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        value: dayTotal
      })
    }
    return days
  }, [depenses, periodStart, periodEnd])

  const topCategories = expensesByCategory.slice(0, 5)
  const expensesByType = [
    { name: 'Fixe', value: fixedExpenses },
    { name: 'Variable', value: variableExpenses }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-gray-800 rounded-lg px-3 py-2 shadow-xl border border-gray-700">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white font-semibold">{payload[0].value.toFixed(2)} €</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📈</span>
          Statistiques
        </h2>
        <p className="text-gray-400 mt-1">
          Période : {new Date(periodStart).toLocaleDateString('fr-FR')} → {new Date(periodEnd).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-gray-400 text-sm mb-1">Moyenne / jour</p>
          <p className="text-2xl font-bold text-white">{stats.avgPerDay.toFixed(2)} €</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-400 text-sm mb-1">Transactions</p>
          <p className="text-2xl font-bold text-white">{stats.transactionCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-400 text-sm mb-1">Plus grosse</p>
          <p className="text-2xl font-bold text-white">{stats.maxExpense.toFixed(2)} €</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-400 text-sm mb-1">Plus petite</p>
          <p className="text-2xl font-bold text-white">{stats.minExpense.toFixed(2)} €</p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Évolution sur la période</h3>
            <Badge variant="violet"><TrendingUp className="w-3 h-3 mr-1" />Tendance</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recentTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v}€`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Par jour de la semaine</h3>
            <Badge variant="emerald"><Calendar className="w-3 h-3 mr-1" />Habitudes</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByDayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v}€`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Fixe vs Variable</h3>
            <Badge variant="rose"><Zap className="w-3 h-3 mr-1" />Répartition</Badge>
          </div>
          <div className="flex items-center gap-8">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesByType} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-500" />
                    <span className="text-gray-300">🔒 Fixes</span>
                  </div>
                  <span className="text-white font-semibold">{fixedExpenses.toFixed(2)} €</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${totalExpenses > 0 ? (fixedExpenses / totalExpenses * 100) : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-300">💸 Variables</span>
                  </div>
                  <span className="text-white font-semibold">{variableExpenses.toFixed(2)} €</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalExpenses > 0 ? (variableExpenses / totalExpenses * 100) : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top catégories</h3>
            <Badge variant="amber"><Award className="w-3 h-3 mr-1" />Classement</Badge>
          </div>
          <div className="space-y-4">
            {topCategories.map((cat, index) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
              const percent = totalExpenses > 0 ? (cat.value / totalExpenses * 100).toFixed(1) : 0
              const color = stringToColor(cat.name)
              
              return (
                <motion.div key={cat.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-4">
                  <span className="text-2xl w-8">{medals[index]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium">{cat.name}</p>
                      <p className="text-white font-bold">{cat.value.toFixed(2)} €</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${percent}%` }} 
                          transition={{ duration: 0.8, delay: index * 0.1 }} 
                          className="h-full rounded-full" 
                          style={{ backgroundColor: color }} 
                        />
                      </div>
                      <span className="text-gray-500 text-sm w-12 text-right">{percent}%</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            {topCategories.length === 0 && (
              <div className="text-center py-8 text-gray-500">Aucune donnée à afficher</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
