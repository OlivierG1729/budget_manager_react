import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Edit2, Trash2, Calendar, Tag } from 'lucide-react'
import { Card, Button, Input, Select, Badge, Modal, Toggle, EmptyState } from './ui'

export default function Expenses({ 
  depenses, 
  categories, 
  onAdd, 
  onUpdate, 
  onDelete 
}) {
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')

  // Filter expenses
  const filteredExpenses = depenses.filter(d => {
    const matchesSearch = !searchTerm || 
      d.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !filterCategory || d.categorie === filterCategory
    const matchesType = !filterType || 
      (filterType === 'fixe' && d.est_fixe) ||
      (filterType === 'variable' && !d.est_fixe)
    
    return matchesSearch && matchesCategory && matchesType
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Mes dépenses</h2>
          <p className="text-gray-400">{filteredExpenses.length} transaction(s)</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Nouvelle dépense
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { value: '', label: 'Toutes catégories' },
              ...categories.map(c => ({ value: c.nom, label: c.nom }))
            ]}
            className="md:w-48"
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: '', label: 'Tous types' },
              { value: 'fixe', label: '🔒 Fixes' },
              { value: 'variable', label: '💸 Variables' },
            ]}
            className="md:w-40"
          />
        </div>
      </Card>

      {/* Expenses List */}
      <Card className="overflow-hidden p-0">
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 font-medium p-4 text-sm">Date</th>
                  <th className="text-left text-gray-400 font-medium p-4 text-sm">Description</th>
                  <th className="text-left text-gray-400 font-medium p-4 text-sm">Catégorie</th>
                  <th className="text-left text-gray-400 font-medium p-4 text-sm">Type</th>
                  <th className="text-right text-gray-400 font-medium p-4 text-sm">Montant</th>
                  <th className="text-right text-gray-400 font-medium p-4 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredExpenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 text-gray-300">
                        {new Date(expense.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {expense.est_fixe && (
                            <span title="Dépense fixe" className="text-rose-400">🔒</span>
                          )}
                          <span className="text-white">
                            {expense.commentaire || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="violet">{expense.categorie}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={expense.type_depense === 'Pro' ? 'blue' : 'emerald'}>
                          {expense.type_depense}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white font-semibold font-mono">
                          {parseFloat(expense.montant).toFixed(2)} €
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(expense)}
                            className="p-2 rounded-lg hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="📝"
            title="Aucune dépense"
            description="Commencez à suivre vos dépenses en ajoutant votre première transaction"
            action={
              <Button onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4" />
                Ajouter une dépense
              </Button>
            }
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingExpense ? '✏️ Modifier la dépense' : '➕ Nouvelle dépense'}
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
    <form onSubmit={handleSubmit} className="space-y-5">
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
        <label className="block text-sm font-medium text-gray-300">Type</label>
        <div className="flex gap-3">
          {['Perso', 'Pro'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, type_depense: t })}
              className={`
                flex-1 py-3 rounded-xl font-medium transition-all
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
        label="🔒 Dépense fixe (loyer, abonnements...)"
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {expense ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
