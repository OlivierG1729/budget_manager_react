import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'

// ============================================================
// === Button Component =======================================
// ============================================================
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-white border border-white/10 hover:border-white/20',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25',
    danger: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-500/25',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-medium
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
}

// ============================================================
// === Input Component ========================================
// ============================================================
export function Input({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  ...props 
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs md:text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        )}
        <input
          className={`
            w-full bg-dark-700/50 border border-white/10 rounded-xl
            px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base text-white placeholder-gray-500
            focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
            transition-all duration-300
            ${Icon ? 'pl-10 md:pl-12' : ''}
            ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
    </div>
  )
}

// ============================================================
// === Select Component =======================================
// ============================================================
export function Select({ 
  label, 
  options = [], 
  className = '',
  ...props 
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs md:text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-dark-700/50 border border-white/10 rounded-xl
          px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base text-white
          focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
          transition-all duration-300
          cursor-pointer
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-dark-800">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ============================================================
// === Toggle Component =======================================
// ============================================================
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          w-11 h-6 rounded-full p-0.5
          transition-colors duration-300
          ${checked ? 'bg-violet-600' : 'bg-dark-600'}
        `}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
      {label && <span className="text-xs md:text-sm text-gray-300">{label}</span>}
    </label>
  )
}

// ============================================================
// === Card Component =========================================
// ============================================================
export function Card({ 
  children, 
  className = '',
  hover = false,
  glow = false,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        glass rounded-xl md:rounded-2xl p-4 md:p-6
        ${hover ? 'glass-hover cursor-pointer' : ''}
        ${glow ? 'shadow-glow-violet' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ============================================================
// === Modal Component ========================================
// ============================================================
export function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] md:inset-0 z-50 md:flex md:items-center md:justify-center md:p-4"
          >
            <div className="glass rounded-2xl w-full md:max-w-lg max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 sticky top-0 bg-dark-800/90 backdrop-blur-sm">
                <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 md:p-6">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// === Badge Component ========================================
// ============================================================
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-dark-600 text-gray-300',
    violet: 'bg-violet-500/20 text-violet-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    rose: 'bg-rose-500/20 text-rose-300',
    amber: 'bg-amber-500/20 text-amber-300',
    blue: 'bg-blue-500/20 text-blue-300',
    cyan: 'bg-cyan-500/20 text-cyan-300',
  }

  return (
    <span className={`
      px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  )
}

// ============================================================
// === Stat Card Component (Mobile Optimized) =================
// ============================================================
export function StatCard({ icon, label, value, subvalue, trend, color = 'violet', compact = false, className = '' }) {
  const colors = {
    violet: 'from-violet-600 to-indigo-600',
    emerald: 'from-emerald-600 to-teal-600',
    rose: 'from-rose-600 to-pink-600',
    amber: 'from-amber-600 to-orange-600',
    cyan: 'from-cyan-600 to-blue-600',
  }

  const glows = {
    violet: 'shadow-violet-500/20',
    emerald: 'shadow-emerald-500/20',
    rose: 'shadow-rose-500/20',
    amber: 'shadow-amber-500/20',
    cyan: 'shadow-cyan-500/20',
  }

  return (
    <Card className={`relative overflow-hidden group ${className}`}>
      {/* Background gradient on hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-0 
        group-hover:opacity-5 transition-opacity duration-500
      `} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <span className="text-lg md:text-2xl">{icon}</span>
          {subvalue && (
            <span className={`
              px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium
              bg-gradient-to-r ${colors[color]} text-white
              shadow-lg ${glows[color]}
            `}>
              {subvalue}
            </span>
          )}
        </div>
        
        <p className="text-gray-400 text-xs md:text-sm mb-0.5 md:mb-1">{label}</p>
        <p className={`${compact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold text-white`}>{value}</p>
        
        {trend && (
          <p className={`text-xs mt-1 md:mt-2 ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </Card>
  )
}

// ============================================================
// === Loading Spinner ========================================
// ============================================================
export function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`
        ${sizes[size]}
        border-2 border-violet-600/20 border-t-violet-600
        rounded-full animate-spin
      `} />
    </div>
  )
}

// ============================================================
// === Empty State ============================================
// ============================================================
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4">
      <span className="text-4xl md:text-6xl mb-3 md:mb-4">{icon}</span>
      <h3 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm mb-4 md:mb-6">{description}</p>
      {action}
    </div>
  )
}
