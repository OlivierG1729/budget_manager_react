import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Modal, Toggle, EmptyState } from './ui'

// Color function
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

export default function Expenses({ 
  depenses, 
  categories, 
  onAdd, 
  onUpdate, 
  onDelete,
  periodStart,
  periodEnd 
}) {
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter expenses
  const filteredExpenses = depenses.filter(d => {
    const matchesSearch = !searchTerm || 
      d.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleOpenModal = (expense = null) => {
    setEditingExpense(expense)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingExpense(null)
  }

  const handleSubmit = async (data) => {
    if (editingExpense) {
      await onUpdate(editingExpense.id, data)
    } else {
      await onAdd(data)
    }
    handleCloseModal()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette dépense ?')) {
      await onDelete(id)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Mes dépenses</h2>
          <p className="text-gray-400 text-sm">{filteredExpenses.length} transaction(s)</p>
        </div>
        <Button onClick={() => handleOpenModal()} size="md">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle dépense</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </div>

      {/* Search */}
      <Card className="p-3 md:p-4">
        <Input
          icon={Search}
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Expenses List - Mobile optimized */}
      <div className="space-y-2 md:space-y-3">
        {filteredExpenses.length > 0 ? (
          <AnimatePresence>
            {filteredExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-base md:text-lg flex-shrink-0"
                      style={{ 
                        backgroundColor: `${stringToColor(expense.categorie)}20`,
                      }}
                    >
                      {expense.est_fixe ? '🔒' : '💸'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm md:text-base truncate">
                            {expense.commentaire || expense.categorie}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <Badge 
                              variant="violet" 
                              className="text-[10px] md:text-xs"
                              style={{ 
                                backgroundColor: `${stringToColor(expense.categorie)}20`,
                                color: stringToColor(expense.categorie)
                              }}
                            >
                              {expense.categorie}
                            </Badge>
                            <span className="text-gray-500 text-xs">
                              {new Date(expense.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                            </span>
                            {expense.type_depense === 'Pro' && (
                              <Badge variant="blue" className="text-[10px]">Pro</Badge>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-white font-bold text-base md:text-lg">
                            {parseFloat(expense.montant).toFixed(0)} €
                          </p>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => handleOpenModal(expense)}
                              className="p-1.5 rounded-lg hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card>
            <EmptyState
              icon="📝"
              title="Aucune dépense"
              description="Ajoutez votre première transaction"
              action={
                <Button onClick={() => handleOpenModal()} size="sm">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              }
            />
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingExpense ? '✏️ Modifier' : '➕ Nouvelle dépense'}
      >
        <ExpenseForm
          expense={editingExpense}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

// ============================================================
// === Expense Form Component =================================
// ============================================================
function ExpenseForm({ expense, categories, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    montant: expense?.montant || '',
    categorie_id: expense?.categorie_id || categories[0]?.id || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    type_depense: expense?.type_depense || 'Perso',
    commentaire: expense?.commentaire || '',
    est_fixe: expense?.est_fixe || false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit({
      ...form,
      montant: parseFloat(form.montant)
    })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Montant (€)"
        type="number"
        step="0.01"
        min="0"
        value={form.montant}
        onChange={(e) => setForm({ ...form, montant: e.target.value })}
        placeholder="0.00"
        required
      />

      <Select
        label="Catégorie"
        value={form.categorie_id}
        onChange={(e) => setForm({ ...form, categorie_id: parseInt(e.target.value) })}
        options={categories.map(c => ({ value: c.id, label: c.nom }))}
      />

      <Input
        label="Date"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />

      <div className="space-y-2">
        <label className="block text-xs md:text-sm font-medium text-gray-300">Type</label>
        <div className="flex gap-2">
          {['Perso', 'Pro'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, type_depense: t })}
              className={`
                flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                ${form.type_depense === t
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
                }
              `}
            >
              {t === 'Perso' ? '👤 Perso' : '💼 Pro'}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Commentaire"
        type="text"
        value={form.commentaire}
        onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
        placeholder="Description (optionnel)"
      />

      <Toggle
        checked={form.est_fixe}
        onChange={(checked) => setForm({ ...form, est_fixe: checked })}
        label="🔒 Dépense fixe"
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          size="md"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
          size="md"
        >
          {expense ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
