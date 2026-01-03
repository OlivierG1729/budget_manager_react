import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Play, Square, Save, TrendingUp, TrendingDown, Calendar, Wallet } from 'lucide-react'
import { Card, Button, Input, Badge } from './ui'

export default function BudgetTracker({ settings, calculations, onUpdateSettings }) {
  const [newPlafond, setNewPlafond] = useState(settings.plafond_quotidien)
  const [saving, setSaving] = useState(false)

  const { dailyBalance, cumulativeBalance, todayExpenses } = calculations

  const handleSavePlafond = async () => {
    setSaving(true)
    await onUpdateSettings({ plafond_quotidien: newPlafond })
    setSaving(false)
  }

  const handleToggleTracking = async () => {
    const newTracking = !settings.tracking_actif
    await onUpdateSettings({
      tracking_actif: newTracking,
      tracking_start_date: newTracking 
        ? new Date().toISOString().split('T')[0] 
        : null
    })
  }

  const getDaysSinceStart = () => {
    if (!settings.tracking_start_date) return 0
    const start = new Date(settings.tracking_start_date)
    const today = new Date()
    return Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          Budget Cible
        </h2>
        <p className="text-gray-400 mt-1">
          Contrôlez vos dépenses quotidiennes
        </p>
      </div>

      {/* Daily Limit Config */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Plafond quotidien</h3>
            <p className="text-gray-500 text-sm">Votre budget journalier pour les dépenses variables</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                value={newPlafond}
                onChange={(e) => setNewPlafond(parseFloat(e.target.value) || 0)}
                className="w-full bg-dark-700/50 border border-white/10 rounded-xl px-4 py-4 text-white text-3xl font-bold focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-2xl font-bold">
                €/jour
              </span>
            </div>
          </div>
          <Button 
            onClick={handleSavePlafond} 
            loading={saving}
            size="lg"
            className="sm:w-auto"
          >
            <Save className="w-5 h-5" />
            Sauvegarder
          </Button>
        </div>
      </Card>

      {/* Tracking Control */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Suivi du budget</h3>
            <p className="text-gray-500 text-sm">Activez le suivi pour calculer votre solde cumulé</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {settings.tracking_actif ? (
              <div className="space-y-1">
                <Badge variant="emerald" className="text-sm">
                  ✓ Suivi actif
                </Badge>
                <p className="text-gray-400 text-sm">
                  📅 Depuis le {new Date(settings.tracking_start_date).toLocaleDateString('fr-FR')} 
                  <span className="text-violet-400 ml-2">
                    ({getDaysSinceStart()} jour{getDaysSinceStart() > 1 ? 's' : ''})
                  </span>
                </p>
              </div>
            ) : (
              <Badge variant="default" className="text-sm">
                Suivi inactif
              </Badge>
            )}
          </div>

          <Button
            variant={settings.tracking_actif ? 'danger' : 'success'}
            onClick={handleToggleTracking}
            size="lg"
          >
            {settings.tracking_actif ? (
              <>
                <Square className="w-5 h-5" />
                Arrêter le suivi
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Démarrer le suivi
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            rounded-2xl p-6 border-2 relative overflow-hidden
            ${dailyBalance >= 0 
              ? 'bg-emerald-900/20 border-emerald-500/30' 
              : 'bg-rose-900/20 border-rose-500/30'
            }
          `}
        >
          {/* Background glow */}
          <div className={`
            absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20
            ${dailyBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}
          `} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              {dailyBalance >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-400" />
              )}
              <span className="text-gray-400">Solde du jour</span>
            </div>

            <p className={`
              text-5xl font-bold font-mono
              ${dailyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}
            `}>
              {dailyBalance >= 0 ? '+' : ''}{dailyBalance.toFixed(2)} €
            </p>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget</span>
                <span className="text-gray-300">{settings.plafond_quotidien.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Dépensé</span>
                <span className="text-gray-300">{todayExpenses.toFixed(2)} €</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min((todayExpenses / settings.plafond_quotidien) * 100, 100)}%` 
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  dailyBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Cumulative Balance */}
        {settings.tracking_actif && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`
              rounded-2xl p-6 border-2 relative overflow-hidden
              ${cumulativeBalance >= 0 
                ? 'bg-emerald-900/20 border-emerald-500/30' 
                : 'bg-rose-900/20 border-rose-500/30'
              }
            `}
          >
            {/* Background glow */}
            <div className={`
              absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20
              ${cumulativeBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}
            `} />

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                {cumulativeBalance >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                )}
                <span className="text-gray-400">Solde cumulé</span>
              </div>

              <p className={`
                text-5xl font-bold font-mono
                ${cumulativeBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}
              `}>
                {cumulativeBalance >= 0 ? '+' : ''}{cumulativeBalance.toFixed(2)} €
              </p>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Période</span>
                  <span className="text-gray-300">{getDaysSinceStart()} jours</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Budget total</span>
                  <span className="text-gray-300">
                    {(settings.plafond_quotidien * getDaysSinceStart()).toFixed(2)} €
                  </span>
                </div>
              </div>

              {cumulativeBalance >= 0 ? (
                <p className="mt-4 text-emerald-400/80 text-sm">
                  🎉 Vous êtes en avance sur votre objectif !
                </p>
              ) : (
                <p className="mt-4 text-rose-400/80 text-sm">
                  ⚠️ Attention, vous avez dépassé votre budget
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Placeholder when tracking is off */}
        {!settings.tracking_actif && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 border-2 border-dashed border-white/10 flex items-center justify-center"
          >
            <div className="text-center">
              <span className="text-4xl mb-4 block">📊</span>
              <p className="text-gray-400">
                Activez le suivi pour voir votre solde cumulé
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info Box */}
      <Card className="bg-violet-900/20 border-violet-500/20">
        <h4 className="text-violet-300 font-semibold mb-3 flex items-center gap-2">
          💡 Comment ça marche ?
        </h4>
        <ul className="text-gray-400 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-violet-400">•</span>
            <span>Définissez votre "argent de poche" quotidien pour les dépenses variables</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400">•</span>
            <span>Les dépenses fixes (🔒 loyer, abonnements) ne comptent pas dans ce budget</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400">•</span>
            <span>Le solde cumulé vous montre si vous êtes en avance ou en retard sur votre objectif global</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400">•</span>
            <span>Réinitialisez le suivi à tout moment pour repartir de zéro</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
