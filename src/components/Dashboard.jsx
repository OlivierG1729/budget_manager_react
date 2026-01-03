import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, StatCard, Badge } from './ui'

// Fonction pour générer une couleur unique basée sur le nom de la catégorie
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

const getCategoryColor = (categoryName) => stringToColor(categoryName)

export default function Dashboard({ 
  depenses, 
  calculations, 
  periodStart, 
  periodEnd, 
  onPeriodChange,
  budgetSettings 
}) {
  const [showPeriodSelector, setShowPeriodSelector] = useState(false)
  
  const {
    totalExpenses,
    variableExpenses,
    fixedExpenses,
    dailyBalance,
    cumulativeBalance,
    expensesByCategory
  } = calculations

  const variableCount = depenses.filter(d => !d.est_fixe).length
  const fixedCount = depenses.filter(d => d.est_fixe).length
  const transactionCount = depenses.length

  const chartData = expensesByCategory.map(cat => ({
    name: cat.name,
    value: cat.value,
    color: getCategoryColor(cat.name)
  }))

  // Period selector component (collapsible on mobile)
  const PeriodSelector = () => (
    <Card className="mb-6">
      {/* Mobile: Collapsible header */}
      <button 
        onClick={() => setShowPeriodSelector(!showPeriodSelector)}
        className="w-full flex items-center justify-between md:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">Période</h3>
            <p className="text-xs text-gray-400">
              {new Date(periodStart).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} → {new Date(periodEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>
        {showPeriodSelector ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {/* Desktop: Always visible header */}
      <div className="hidden md:flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Période</h3>
          <p className="text-gray-500 text-xs">Filtrer les données</p>
        </div>
      </div>

      {/* Content - collapsible on mobile, always visible on desktop */}
      <div className={`${showPeriodSelector ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Début</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => onPeriodChange(e.target.value, periodEnd)}
              className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Fin</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => onPeriodChange(periodStart, e.target.value)}
              className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        {/* Quick period buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => {
              const now = new Date()
              const start = new Date(now.getFullYear(), now.getMonth(), 1)
              onPeriodChange(start.toISOString().split('T')[0], now.toISOString().split('T')[0])
            }}
            className="px-3 py-2 text-xs rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white transition-colors"
          >
            Ce mois
          </button>
          <button
            onClick={() => {
              const now = new Date()
              const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
              const end = new Date(now.getFullYear(), now.getMonth(), 0)
              onPeriodChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
            }}
            className="px-3 py-2 text-xs rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white transition-colors"
          >
            Mois dernier
          </button>
          <button
            onClick={() => {
              const now = new Date()
              const start = new Date(now)
              start.setDate(now.getDate() - 7)
              onPeriodChange(start.toISOString().split('T')[0], now.toISOString().split('T')[0])
            }}
            className="px-3 py-2 text-xs rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white transition-colors"
          >
            7 jours
          </button>
          <button
            onClick={() => {
              const now = new Date()
              const start = new Date(now)
              start.setDate(now.getDate() - 30)
              onPeriodChange(start.toISOString().split('T')[0], now.toISOString().split('T')[0])
            }}
            className="px-3 py-2 text-xs rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white transition-colors"
          >
            30 jours
          </button>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Period Selector - Now at top and collapsible on mobile */}
      <PeriodSelector />

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard
          icon="💰"
          label="Total"
          value={`${totalExpenses.toFixed(0)} €`}
          subvalue={`${transactionCount} trans.`}
          color="violet"
          compact
        />
        <StatCard
          icon="🔒"
          label="Fixes"
          value={`${fixedExpenses.toFixed(0)} €`}
          subvalue={`${fixedCount} trans.`}
          color="rose"
          compact
        />
        <StatCard
          icon="💸"
          label="Variables"
          value={`${variableExpenses.toFixed(0)} €`}
          subvalue={`${variableCount} trans.`}
          color="emerald"
          compact
        />
        <StatCard
          icon="📅"
          label="Solde jour"
          value={`${dailyBalance.toFixed(0)} €`}
          subvalue={dailyBalance >= 0 ? '✓ OK' : '⚠️'}
          color={dailyBalance >= 0 ? 'emerald' : 'rose'}
          compact
        />
        <StatCard
          icon="🎯"
          label="Solde cumulé"
          value={`${cumulativeBalance.toFixed(0)} €`}
          subvalue={cumulativeBalance >= 0 ? '✓' : '⚠️'}
          color={cumulativeBalance >= 0 ? 'cyan' : 'rose'}
          compact
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Charts - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Category Distribution */}
        <Card>
          <h3 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">
            Répartition par catégorie
          </h3>
          
          {chartData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              {/* Pie Chart */}
              <div className="w-36 h-36 md:w-48 md:h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-dark-800 border border-white/10 rounded-lg px-2 py-1 shadow-xl">
                              <p className="text-white text-xs font-medium">{data.name}</p>
                              <p className="text-gray-400 text-xs">{data.value.toFixed(2)} €</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full space-y-1.5 md:space-y-2">
                {chartData.slice(0, 5).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-gray-300 text-xs md:text-sm truncate">{cat.name}</span>
                    </div>
                    <span className="text-white font-medium text-xs md:text-sm ml-2">
                      {((cat.value / totalExpenses) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-36 text-gray-500 text-sm">
              Aucune dépense
            </div>
          )}
        </Card>

        {/* Progress Bars */}
        <Card>
          <h3 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">
            Détail par catégorie
          </h3>
          
          <div className="space-y-3 md:space-y-4">
            {expensesByCategory.slice(0, 5).map((cat) => {
              const percent = totalExpenses > 0 
                ? (cat.value / totalExpenses * 100).toFixed(0) 
                : 0
              const color = getCategoryColor(cat.name)
              
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-300 truncate pr-2">{cat.name}</span>
                    <span className="text-white font-medium whitespace-nowrap">
                      {cat.value.toFixed(0)} € ({percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
            
            {expensesByCategory.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Aucune donnée
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-white">
            Dernières transactions
          </h3>
          <Badge variant="violet" className="text-xs">{transactionCount}</Badge>
        </div>

        <div className="space-y-2 md:space-y-3">
          {depenses.slice(0, 5).map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 md:p-4 bg-dark-700/30 rounded-xl hover:bg-dark-700/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-sm md:text-lg flex-shrink-0"
                  style={{ 
                    backgroundColor: `${getCategoryColor(expense.categorie)}20`,
                  }}
                >
                  {expense.est_fixe ? '🔒' : '💸'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm md:text-base font-medium truncate">
                    {expense.commentaire || expense.categorie}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {expense.categorie} • {new Date(expense.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-white font-semibold text-sm md:text-base">
                  {parseFloat(expense.montant).toFixed(0)} €
                </p>
              </div>
            </motion.div>
          ))}

          {depenses.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              Aucune transaction
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export { getCategoryColor, stringToColor }
