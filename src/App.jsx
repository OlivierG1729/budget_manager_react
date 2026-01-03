import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  BarChart3,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Dépenses', icon: Receipt },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ]

  // Tab button component
  const TabButton = ({ item, mobile = false }) => {
    const Icon = item.icon
    const isActive = activeTab === item.id

    return (
      <button
        onClick={() => {
          setActiveTab(item.id)
          if (mobile) setMobileMenuOpen(false)
        }}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl font-medium
          transition-all duration-300
          ${isActive
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
          }
          ${mobile ? 'w-full' : ''}
        `}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/5">
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
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(item => (
                <TabButton key={item.id} item={item} />
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Date */}
            <div className="hidden md:block text-gray-400 text-sm">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {navItems.map(item => (
                  <TabButton key={item.id} item={item} mobile />
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Budget Manager © 2025 — Fait avec 💜 et React</p>
        </div>
      </footer>
    </div>
  )
}
