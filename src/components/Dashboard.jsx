import React from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Calendar } from 'lucide-react'
import { Card, StatCard, Badge } from './ui'

// Fonction pour générer une couleur unique basée sur le nom de la catégorie
const stringToColor = (str) => {
  // Liste de couleurs vibrantes prédéfinies
  const colors = [
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#f43f5e', // rose
    '#f59e0b', // amber
    '#3b82f6', // blue
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#a855f7', // purple
    '#eab308', // yellow
    '#ef4444', // red
    '#22c55e', // green
  ]
  
  // Génère un hash simple à partir du string
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Utilise le hash pour sélectionner une couleur
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

// Fonction pour obtenir la couleur d'une catégorie
const getCategoryColor = (categoryName) => {
  return stringToColor(categoryName)
}

export default function Dashboard({ 
  depenses, 
  calculations, 
  periodStart, 
  periodEnd, 
  onPeriodChange,
  budgetSettings 
}) {
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

  // Prepare chart data with auto-colors
  const chartData = expensesByCategory.map(cat => ({
    name: cat.name,
    value: cat.value,
    color: getCategoryColor(cat.name)
  }))

  return (
    <div className="flex gap-6">
      {/* Sidebar - Period Selector */}
      <div className="w-72 flex-shrink-0">
        <Card className="sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Période</h3>
              <p className="text-gray-500 text-xs">Filtrer les données</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => onPeriodChange(e.target.value, periodEnd)}
                className="w-full bg-dark-700/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => onPeriodChange(periodStart, e.target.value)}
                className="w-full bg-dark-700/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* Quick period buttons */}
            <div className="pt-2 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Raccourcis</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const now = new Date()
                    const start = new Date(now.getFullYear(), now.getMonth(), 1)
                    onPeriodChange(
                      start.toISOString().split('T')[0],
                      now.toISOString().split('T')[0]
                    )
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
                    onPeriodChange(
                      start.toISOString().split('T')[0],
                      end.toISOString().split('T')[0]
                    )
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
                    onPeriodChange(
                      start.toISOString().split('T')[0],
                      now.toISOString().split('T')[0]
                    )
                  }}
                  className="px-3 py-2 text-xs rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white transition-colors"
                >
                  7 derniers jours
                </button>
                <button
                  onClick={() => {
                    const now = new Date()
                    const start = new Date(now)
                    start.setDate(now.getDate() - 30)
                    onPeriodChange(
                      start.toISOString().split('T')[0],
                      now.toISOString().split('T')[0]
                    )
                  }}
                  className="px-3 py-2 text-xs rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white transition-colors"
                >
                  30 derniers jours
                </button>
              </div>
            </div>

            {/* Period summary */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-gray-500 mb-2">Résumé de la période</p>
              <p className="text-white font-medium">
                {new Date(periodStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' → '}
                {new Date(periodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {transactionCount} transaction{transactionCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Stats Grid - Reordered */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-stagger">
          <StatCard
            icon="💰"
            label="Total dépenses"
            value={`${totalExpenses.toFixed(2)} €`}
            subvalue={`${transactionCount} trans.`}
            color="violet"
          />
          <StatCard
            icon="🔒"
            label="Dépenses fixes"
            value={`${fixedExpenses.toFixed(2)} €`}
            subvalue={`${fixedCount} trans.`}
            color="rose"
          />
          <StatCard
            icon="💸"
            label="Dépenses variables"
            value={`${variableExpenses.toFixed(2)} €`}
            subvalue={`${variableCount} trans.`}
            color="emerald"
          />
          <StatCard
            icon="📅"
            label="Solde du jour"
            value={`${dailyBalance.toFixed(2)} €`}
            subvalue={dailyBalance >= 0 ? '✓ OK' : '⚠️ Dépassé'}
            color={dailyBalance >= 0 ? 'emerald' : 'rose'}
          />
          <StatCard
            icon="🎯"
            label="Solde cumulé"
            value={`${cumulativeBalance.toFixed(2)} €`}
            subvalue={cumulativeBalance >= 0 ? '✓ En avance' : '⚠️ En retard'}
            color={cumulativeBalance >= 0 ? 'cyan' : 'rose'}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-6">
              Répartition par catégorie
            </h3>
            
            {chartData.length > 0 ? (
              <div className="flex items-center gap-6">
                {/* Pie Chart */}
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                              <div className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                                <p className="text-white font-medium">{data.name}</p>
                                <p className="text-gray-400">{data.value.toFixed(2)} €</p>
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
                <div className="flex-1 space-y-2">
                  {chartData.slice(0, 6).map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-gray-300 text-sm truncate max-w-[120px]">{cat.name}</span>
                      </div>
                      <span className="text-white font-medium text-sm">
                        {((cat.value / totalExpenses) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Aucune dépense à afficher
              </div>
            )}
          </Card>

          {/* Progress Bars with auto-colors */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-6">
              Détail par catégorie
            </h3>
            
            <div className="space-y-4">
              {expensesByCategory.slice(0, 6).map((cat) => {
                const percent = totalExpenses > 0 
                  ? (cat.value / totalExpenses * 100).toFixed(0) 
                  : 0
                const color = getCategoryColor(cat.name)
                
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{cat.name}</span>
                      <span className="text-white font-medium">
                        {cat.value.toFixed(2)} € ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
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
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Dernières transactions
            </h3>
            <Badge variant="violet">{transactionCount} sur la période</Badge>
          </div>

          <div className="space-y-3">
            {depenses.slice(0, 5).map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ 
                      backgroundColor: `${getCategoryColor(expense.categorie)}20`,
                      color: getCategoryColor(expense.categorie)
                    }}
                  >
                    {expense.est_fixe ? '🔒' : '💸'}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {expense.commentaire || expense.categorie}
                    </p>
                    <p className="text-gray-500 text-sm">
                      <span 
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: getCategoryColor(expense.categorie) }}
                      />
                      {expense.categorie} • {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {parseFloat(expense.montant).toFixed(2)} €
                  </p>
                  <Badge variant={expense.type_depense === 'Pro' ? 'blue' : 'emerald'}>
                    {expense.type_depense}
                  </Badge>
                </div>
              </motion.div>
            ))}

            {depenses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune transaction sur cette période
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

// Export the color function for use in other components
export { getCategoryColor, stringToColor }
