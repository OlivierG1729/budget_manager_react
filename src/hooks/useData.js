import { useState, useEffect, useCallback } from 'react'
import {
  getCategories,
  getDepenses,
  addDepense as apiAddDepense,
  updateDepense as apiUpdateDepense,
  deleteDepense as apiDeleteDepense,
  getBudgetSettings,
  updateBudgetSettings as apiUpdateBudgetSettings
} from '../lib/supabase'

// Hook pour les catégories
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { categories, loading, error }
}

// Hook pour les dépenses
export function useDepenses() {
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDepenses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDepenses()
      setDepenses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepenses()
  }, [fetchDepenses])

  const addDepense = async (depense) => {
    try {
      await apiAddDepense(depense)
      await fetchDepenses()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const updateDepense = async (id, updates) => {
    try {
      await apiUpdateDepense(id, updates)
      await fetchDepenses()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const deleteDepense = async (id) => {
    try {
      await apiDeleteDepense(id)
      await fetchDepenses()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return {
    depenses,
    loading,
    error,
    addDepense,
    updateDepense,
    deleteDepense,
    refresh: fetchDepenses
  }
}

// Hook pour les paramètres de budget
export function useBudgetSettings() {
  const [settings, setSettings] = useState({
    plafond_quotidien: 50,
    tracking_actif: false,
    tracking_start_date: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getBudgetSettings()
        setSettings(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const updateSettings = async (updates) => {
    try {
      const newSettings = { ...settings, ...updates }
      await apiUpdateBudgetSettings(newSettings)
      setSettings(newSettings)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return { settings, loading, error, updateSettings }
}

// Hook pour les calculs de budget - updated with period support
export function useBudgetCalculations(depenses, settings, periodStart, periodEnd) {
  const today = new Date().toISOString().split('T')[0]

  // Total des dépenses sur la période (déjà filtrées)
  const totalExpenses = depenses.reduce((sum, d) => sum + parseFloat(d.montant), 0)
  
  // Dépenses variables sur la période
  const variableExpenses = depenses
    .filter(d => !d.est_fixe)
    .reduce((sum, d) => sum + parseFloat(d.montant), 0)
  
  // Dépenses fixes sur la période
  const fixedExpenses = depenses
    .filter(d => d.est_fixe)
    .reduce((sum, d) => sum + parseFloat(d.montant), 0)
  
  // Dépenses du jour (toujours sur aujourd'hui, pas la période)
  const todayExpenses = depenses
    .filter(d => d.date === today && !d.est_fixe)
    .reduce((sum, d) => sum + parseFloat(d.montant), 0)
  
  // Solde du jour
  const dailyBalance = settings.plafond_quotidien - todayExpenses

  // Solde cumulé sur la période sélectionnée
  const cumulativeBalance = (() => {
    if (!periodStart || !periodEnd) return 0
    
    const start = new Date(periodStart)
    const end = new Date(periodEnd)
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
    const totalBudget = days * settings.plafond_quotidien
    
    // Total des dépenses variables sur la période
    const periodVariableExpenses = depenses
      .filter(d => !d.est_fixe)
      .reduce((sum, d) => sum + parseFloat(d.montant), 0)
    
    return totalBudget - periodVariableExpenses
  })()

  // Dépenses par catégorie
  const expensesByCategory = (() => {
    const result = {}
    depenses.forEach(d => {
      const cat = d.categorie || 'Autres'
      result[cat] = (result[cat] || 0) + parseFloat(d.montant)
    })
    return Object.entries(result)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  })()

  // Dépenses par type (fixe/variable)
  const expensesByType = [
    { name: 'Fixe', value: fixedExpenses },
    { name: 'Variable', value: variableExpenses }
  ]

  return {
    totalExpenses,
    variableExpenses,
    fixedExpenses,
    todayExpenses,
    dailyBalance,
    cumulativeBalance,
    expensesByCategory,
    expensesByType
  }
}
