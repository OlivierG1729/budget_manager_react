import { createClient } from '@supabase/supabase-js'

// Configuration Supabase - À remplacer par tes vraies valeurs
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rjwmpufueodmnbvnllst.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================
// === API Functions ==========================================
// ============================================================

// --- Categories ---
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('nom', { ascending: true })
  
  if (error) throw error
  return data
}

export async function addCategory(nom) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ nom }])
    .select()
  
  if (error) throw error
  return data[0]
}

// --- Dépenses ---
export async function getDepenses() {
  const { data, error } = await supabase
    .from('depenses')
    .select(`
      *,
      categories (
        id,
        nom
      )
    `)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data.map(d => ({
    ...d,
    categorie: d.categories?.nom || 'Non catégorisé',
    categorie_id: d.categorie_id
  }))
}

export async function addDepense(depense) {
  const { data, error } = await supabase
    .from('depenses')
    .insert([{
      montant: depense.montant,
      date: depense.date,
      categorie_id: depense.categorie_id,
      type_depense: depense.type_depense,
      commentaire: depense.commentaire,
      est_fixe: depense.est_fixe || false
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateDepense(id, updates) {
  const { data, error } = await supabase
    .from('depenses')
    .update({
      montant: updates.montant,
      date: updates.date,
      categorie_id: updates.categorie_id,
      type_depense: updates.type_depense,
      commentaire: updates.commentaire,
      est_fixe: updates.est_fixe
    })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteDepense(id) {
  const { error } = await supabase
    .from('depenses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// --- Budget Settings ---
export async function getBudgetSettings() {
  const { data, error } = await supabase
    .from('budget_settings')
    .select('*')
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  
  return data || {
    plafond_quotidien: 50,
    tracking_actif: false,
    tracking_start_date: null
  }
}

export async function updateBudgetSettings(settings) {
  // Check if settings exist
  const { data: existing } = await supabase
    .from('budget_settings')
    .select('id')
    .limit(1)
    .single()
  
  if (existing) {
    const { data, error } = await supabase
      .from('budget_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
    
    if (error) throw error
    return data[0]
  } else {
    const { data, error } = await supabase
      .from('budget_settings')
      .insert([settings])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// --- Stats helpers ---
export async function getDailyVariableExpenses(date) {
  const { data, error } = await supabase
    .from('depenses')
    .select('montant')
    .eq('date', date)
    .or('est_fixe.eq.false,est_fixe.is.null')
  
  if (error) throw error
  return data.reduce((sum, d) => sum + parseFloat(d.montant), 0)
}

export async function getCumulativeExpenses(startDate, endDate) {
  const { data, error } = await supabase
    .from('depenses')
    .select('montant')
    .gte('date', startDate)
    .lte('date', endDate)
    .or('est_fixe.eq.false,est_fixe.is.null')
  
  if (error) throw error
  return data.reduce((sum, d) => sum + parseFloat(d.montant), 0)
}
