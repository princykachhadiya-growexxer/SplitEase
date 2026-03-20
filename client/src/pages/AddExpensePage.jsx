import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'food', label: '🍔 Food' }, { value: 'transport', label: '🚗 Transport' },
  { value: 'accommodation', label: '🏨 Accommodation' }, { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'utilities', label: '⚡ Utilities' }, { value: 'other', label: '📦 Other' },
];

const AddExpensePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ groupId: '', description: '', amount: '', paidBy: user._id, category: 'other', splitAll: true, participantIds: [] });
  const [loading, setLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    api.get('/groups').then(({ data }) => setGroups(data.groups)).catch(() => toast.error('Failed to load groups')).finally(() => setGroupsLoading(false));
  }, []);

  const handleGroupChange = (e) => {
    const g = groups.find((g) => g._id === e.target.value);
    setSelectedGroup(g || null);
    setForm((p) => ({ ...p, groupId: e.target.value, paidBy: user._id, participantIds: [] }));
  };

  const toggleParticipant = (id) => setForm((p) => ({
    ...p, participantIds: p.participantIds.includes(id) ? p.participantIds.filter((x) => x !== id) : [...p.participantIds, id],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.groupId) { toast.error('Select a group'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!form.splitAll && form.participantIds.length === 0) { toast.error('Select participants'); return; }
    setLoading(true);
    try {
      await api.post('/expenses', {
        groupId: form.groupId, description: form.description.trim(),
        amount: Number(form.amount), paidBy: form.paidBy, category: form.category,
        participantIds: form.splitAll ? [] : form.participantIds,
      });
      toast.success('Expense added!');
      navigate(`/groups/${form.groupId}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add expense'); }
    finally { setLoading(false); }
  };

  if (groupsLoading) return <PageLoader />;

  const perPerson = () => {
    if (!form.amount || !selectedGroup) return 0;
    const count = form.splitAll ? selectedGroup.members.length : (form.participantIds.length || 1);
    return (Number(form.amount) / count).toFixed(2);
  };

  const sectionStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' };
  const labelStyle = { color: 'var(--text-secondary)' };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Add Expense</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Record a new expense and split it with your group</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl p-6 space-y-4" style={sectionStyle}>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Group *</label>
            <select name="groupId" value={form.groupId} onChange={handleGroupChange} className="input-field">
              <option value="">Select a group…</option>
              {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Description *</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Dinner at restaurant" className="input-field" maxLength={200} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00" className="input-field" min="0.01" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          {selectedGroup && (
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Paid by</label>
              <select value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })} className="input-field">
                {selectedGroup.members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}{m._id === user._id ? ' (you)' : ''}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedGroup && (
          <div className="rounded-2xl p-6 space-y-4" style={sectionStyle}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Split between</h3>
            <div className="flex gap-2">
              {['all', 'custom'].map((t) => (
                <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, splitAll: t === 'all', participantIds: [] }))}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: (t === 'all') === form.splitAll ? 'var(--brand-600)' : 'var(--bg-muted)',
                    color: (t === 'all') === form.splitAll ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {t === 'all' ? 'All members' : 'Custom'}
                </button>
              ))}
            </div>
            {!form.splitAll && (
              <div className="space-y-1.5">
                {selectedGroup.members.map((m) => (
                  <label key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: form.participantIds.includes(m._id) ? 'var(--brand-50)' : 'var(--bg-muted)',
                      border: `1px solid ${form.participantIds.includes(m._id) ? 'var(--brand-100)' : 'transparent'}`,
                    }}>
                    <input type="checkbox" className="accent-green-600" checked={form.participantIds.includes(m._id)} onChange={() => toggleParticipant(m._id)} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {m.name}{m._id === user._id ? ' (you)' : ''}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {form.amount && (
              <div className="rounded-xl p-3 text-sm flex items-center justify-between"
                style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Each person pays:</span>
                <span className="font-bold" style={{ color: 'var(--brand-700)' }}>₹{perPerson()}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><PlusCircle size={16} /> Add Expense</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpensePage;
