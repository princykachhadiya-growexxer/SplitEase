import { useState } from 'react';
import { Modal, FormField } from './ui/index.jsx';
import { Avatar } from './layout/Sidebar.jsx';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'food', label: '🍔 Food' }, { value: 'transport', label: '🚗 Transport' },
  { value: 'accommodation', label: '🏨 Accommodation' }, { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'utilities', label: '⚡ Utilities' }, { value: 'other', label: '📦 Other' },
];

const AddExpenseModal = ({ isOpen, onClose, group, onExpenseAdded }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ description: '', amount: '', paidBy: user._id, category: 'other', participantIds: [] });
  const [splitAll, setSplitAll] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleParticipant = (id) => setForm((p) => ({
    ...p, participantIds: p.participantIds.includes(id) ? p.participantIds.filter((x) => x !== id) : [...p.participantIds, id],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!splitAll && form.participantIds.length === 0) { toast.error('Select at least one participant'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/expenses', {
        groupId: group._id, description: form.description.trim(), amount: Number(form.amount),
        paidBy: form.paidBy, category: form.category,
        participantIds: splitAll ? [] : form.participantIds,
      });
      toast.success('Expense added!');
      onExpenseAdded(data.expense);
      onClose();
      setForm({ description: '', amount: '', paidBy: user._id, category: 'other', participantIds: [] });
      setSplitAll(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add expense'); }
    finally { setLoading(false); }
  };

  const perPerson = () => {
    if (!form.amount || isNaN(form.amount)) return 0;
    const count = splitAll ? group.members.length : (form.participantIds.length || 1);
    return (Number(form.amount) / count).toFixed(2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Description">
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Dinner at restaurant" className="input-field" maxLength={200} />
        </FormField>
        <FormField label="Amount (₹)">
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00" className="input-field" min="0.01" step="0.01" />
        </FormField>
        <FormField label="Paid by">
          <select value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })} className="input-field">
            {group.members.map((m) => (
              <option key={m._id} value={m._id}>{m.name}{m._id === user._id ? ' (you)' : ''}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Category">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Split between</label>
          <div className="flex gap-2 mb-3">
            {['all', 'custom'].map((t) => (
              <button key={t} type="button" onClick={() => setSplitAll(t === 'all')}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: (t === 'all') === splitAll ? 'var(--brand-600)' : 'var(--bg-muted)',
                  color: (t === 'all') === splitAll ? '#fff' : 'var(--text-secondary)',
                }}>
                {t === 'all' ? 'All members' : 'Select members'}
              </button>
            ))}
          </div>
          {!splitAll && (
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {group.members.map((m) => (
                <label key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all"
                  style={{
                    background: form.participantIds.includes(m._id) ? 'var(--brand-50)' : 'var(--bg-muted)',
                    borderColor: form.participantIds.includes(m._id) ? 'var(--brand-100)' : 'transparent',
                  }}>
                  <input type="checkbox" className="accent-green-600" checked={form.participantIds.includes(m._id)} onChange={() => toggleParticipant(m._id)} />
                  <Avatar name={m.name} size="sm" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {m.name}{m._id === user._id ? ' (you)' : ''}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {form.amount && (
          <div className="rounded-xl p-3 text-sm flex items-center justify-between"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Each person pays:</span>
            <span className="font-bold" style={{ color: 'var(--brand-600)' }}>₹{perPerson()}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
