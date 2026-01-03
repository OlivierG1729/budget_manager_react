import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  BarChart3,
  Loader2
} from 'lucide-react'

// Components
import Dashboard from './components/Dashboard'
import Expenses from './components/Expenses'
import BudgetTracker from './components/BudgetTracker'
import Statistics from './components/Statistics'

// Hooks
import { useCategories, useDepenses, useBudgetSettings, useBudgetCalculations } from './hooks/useData'

// ============================================================
// === Main App Component =====================================
// ============================================================
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Period state - default to first day of current month to today
  const [periodStart, setPeriodStart] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  })
  const [periodEnd, setPeriodEnd] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Data hooks
  const { categories, loading: loadingCategories } = useCategories()
  const { 
    depenses: allDepenses, 
    loading: loadingDepenses, 
    addDepense, 
    updateDepense, 
    deleteDepense 
  } = useDepenses()
  const { 
    settings, 
    loading: loadingSettings, 
    updateSettings 
  } = useBudgetSettings()

  // Filter depenses by period
  const depenses = useMemo(() => {
    return allDepenses.filter(d => {
      return d.date >= periodStart && d.date <= periodEnd
    })
  }, [allDepenses, periodStart, periodEnd])

  // Calculations with filtered depenses and period info
  const calculations = useBudgetCalculations(depenses, settings, periodStart, periodEnd)

  const isLoading = loadingCategories || loadingDepenses || loadingSettings

  // Handle period change
  const handlePeriodChange = (start, end) => {
    setPeriodStart(start)
    setPeriodEnd(end)
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Dépenses', shortLabel: 'Dépenses', icon: Receipt },
    { id: 'budget', label: 'Budget', shortLabel: 'Budget', icon: Target },
    { id: 'stats', label: 'Stats', shortLabel: 'Stats', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header - Desktop only */}
      <header className="hidden md:block glass sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.span 
                className="text-3xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                💰
              </motion.span>
              <h1 className="text-xl font-bold gradient-text">
                Budget Manager
              </h1>
            </div>

            {/* Desktop Nav */}
            <nav className="flex items-center gap-2">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                      transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Date */}
            <div className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden glass sticky top-0 z-40 border-b border-white/5">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <h1 className="text-lg font-bold gradient-text">Budget</h1>
            </div>
            <div className="text-gray-400 text-xs">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-violet-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm md:text-base">Chargement...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  depenses={depenses} 
                  calculations={calculations}
                  periodStart={periodStart}
                  periodEnd={periodEnd}
                  onPeriodChange={handlePeriodChange}
                  budgetSettings={settings}
                />
              )}
              
              {activeTab === 'expenses' && (
                <Expenses
                  depenses={depenses}
                  categories={categories}
                  onAdd={addDepense}
                  onUpdate={updateDepense}
                  onDelete={deleteDepense}
                  periodStart={periodStart}
                  periodEnd={periodEnd}
                />
              )}
              
              {activeTab === 'budget' && (
                <BudgetTracker
                  settings={settings}
                  calculations={calculations}
                  onUpdateSettings={updateSettings}
                />
              )}
              
              {activeTab === 'stats' && (
                <Statistics
                  depenses={depenses}
                  calculations={calculations}
                  periodStart={periodStart}
                  periodEnd={periodEnd}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 z-50">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                  transition-all duration-300 min-w-[60px]
                  ${isActive
                    ? 'text-violet-400'
                    : 'text-gray-500'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : ''}`} />
                <span className="text-[10px] font-medium">{item.shortLabel}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0 w-12 h-0.5 bg-violet-500 rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer - Desktop only */}
      <footer className="hidden md:block border-t border-white/5 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Budget Manager © 2025 — Fait avec 💜 et React</p>
        </div>
      </footer>
    </div>
  )
}
