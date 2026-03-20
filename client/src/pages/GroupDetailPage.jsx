import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, Plus, ArrowLeft, Receipt, TrendingUp,
  TrendingDown, Wallet, Trash2, UserPlus, Search, X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState } from '../components/ui/index.jsx';
import { Avatar } from '../components/layout/Sidebar.jsx';
import AddExpenseModal from '../components/AddExpenseModal.jsx';
import SettleUpModal from '../components/SettleUpModal.jsx';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  food: '🍔', transport: '🚗', accommodation: '🏨',
  entertainment: '🎬', utilities: '⚡', other: '📦',
};

const GroupDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [suggestedSettlements, setSuggestedSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/group/${id}`),
        api.get(`/expenses/group/${id}/balances`),
      ]);
      setGroup(groupRes.data.group);
      setExpenses(expensesRes.data.expenses);
      setBalances(balancesRes.data.memberBalances);
      setSuggestedSettlements(balancesRes.data.suggestedSettlements);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        toast.error('Group not found or access denied');
        navigate('/groups');
      } else toast.error('Failed to load group');
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExpenseAdded = () => fetchAll();

  const handleDeleteExpense = async (expId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expId}`);
      fetchAll();
      toast.success('Expense deleted');
    } catch { toast.error('Failed to delete expense'); }
  };

  const myBalance = balances.find((b) => b.user._id === user._id);
  if (loading) return <PageLoader />;
  if (!group) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/groups')}
          className="p-2 rounded-xl transition-colors mt-0.5"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{group.name}</h1>
          {group.description && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{group.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex -space-x-1.5">
              {group.members.slice(0, 5).map((m) => (
                <div key={m._id} title={m.name} className="ring-2 rounded-full" style={{ '--tw-ring-color': 'var(--bg-page)' }}>
                  <Avatar name={m.name} size="sm" />
                </div>
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{group.members.length} members</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {group.createdBy._id === user._id && (
            <button onClick={() => setShowAddMember(true)} className="btn-secondary text-sm flex items-center gap-1.5">
              <UserPlus size={15} /><span className="hidden sm:inline">Add</span>
            </button>
          )}
          <button onClick={() => setShowSettleUp(true)} className="btn-secondary text-sm flex items-center gap-1.5">
            <Wallet size={15} /><span className="hidden sm:inline">Settle</span>
          </button>
          <button onClick={() => setShowAddExpense(true)} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={15} /><span className="hidden sm:inline">Expense</span>
          </button>
        </div>
      </div>

      {/* My balance banner */}
      {myBalance && myBalance.balance !== 0 && (
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: myBalance.balance > 0 ? 'var(--bg-owed)' : 'var(--bg-owe)',
            border: `1px solid ${myBalance.balance > 0 ? 'var(--border-owed)' : 'var(--border-owe)'}`,
          }}>
          <div className="flex items-center gap-3">
            {myBalance.balance > 0
              ? <TrendingUp size={20} style={{ color: 'var(--color-owed)' }} />
              : <TrendingDown size={20} style={{ color: 'var(--color-owe)' }} />}
            <div>
              <p className="text-sm font-semibold" style={{ color: myBalance.balance > 0 ? 'var(--color-owed)' : 'var(--color-owe)' }}>
                {myBalance.balance > 0
                  ? `You are owed ₹${myBalance.balance.toFixed(2)}`
                  : `You owe ₹${Math.abs(myBalance.balance).toFixed(2)}`}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>in this group</p>
            </div>
          </div>
          {myBalance.balance < 0 && (
            <button onClick={() => setShowSettleUp(true)} className="btn-primary text-xs px-3 py-1.5">
              Settle up
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-muted)' }}>
        {[{ key: 'expenses', label: 'Expenses', icon: Receipt }, { key: 'balances', label: 'Balances', icon: Users }]
          .map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === key ? 'var(--bg-card)' : 'transparent',
                color: activeTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: activeTab === key ? 'var(--shadow-card)' : 'none',
              }}>
              <Icon size={15} /> {label}
            </button>
          ))}
      </div>

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        expenses.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses yet" description="Add your first expense to start tracking splits."
            action={
              <button onClick={() => setShowAddExpense(true)} className="btn-primary text-sm flex items-center gap-2">
                <Plus size={15} /> Add first expense
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseCard key={expense._id} expense={expense} userId={user._id} onDelete={handleDeleteExpense} />
            ))}
          </div>
        )
      )}

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {balances.map(({ user: member, balance }) => (
              <div key={member._id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {member.name}{member._id === user._id && <span style={{ color: 'var(--brand-600)' }} className="ml-1">(you)</span>}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.email}</p>
                  </div>
                </div>
                {balance === 0 ? <span className="badge-settled">Settled</span>
                  : balance > 0 ? <span className="badge-owed">+₹{balance.toFixed(2)}</span>
                  : <span className="badge-owe">-₹{Math.abs(balance).toFixed(2)}</span>}
              </div>
            ))}
          </div>
          {suggestedSettlements.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Wallet size={16} style={{ color: 'var(--brand-600)' }} /> Suggested Settlements
              </h3>
              <div className="space-y-2">
                {suggestedSettlements.map((s, i) => (
                  <div key={i} className="card py-3 flex items-center gap-3">
                    <Avatar name={s.from?.name} size="sm" />
                    <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.from?.name?.split(' ')[0]}</span>
                      {' pays '}
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.to?.name?.split(' ')[0]}</span>
                    </p>
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>₹{s.amount.toFixed(2)}</span>
                    <Avatar name={s.to?.name} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddExpenseModal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)}
        group={group} onExpenseAdded={handleExpenseAdded} />
      <SettleUpModal isOpen={showSettleUp} onClose={() => setShowSettleUp(false)}
        group={group} suggestedSettlements={suggestedSettlements} onSettled={fetchAll} />
      {showAddMember && (
        <AddMemberModal group={group} onClose={() => setShowAddMember(false)}
          onMemberAdded={(updated) => { setGroup(updated); setShowAddMember(false); }} />
      )}
    </div>
  );
};

// ── ExpenseCard ───────────────────────────────────────────
const ExpenseCard = ({ expense, userId, onDelete }) => {
  const isPayer = expense.paidBy._id === userId;
  const myShare = expense.participants.find((p) => p.userId._id === userId)?.share || 0;
  return (
    <div className="card flex items-center gap-4 group/exp" style={{ transition: 'all 200ms' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: 'var(--bg-muted)' }}>
        {CATEGORY_ICONS[expense.category] || '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{expense.description}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Paid by <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isPayer ? 'you' : expense.paidBy.name}
          </span>{' · '}
          {new Date(expense.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>₹{expense.amount.toFixed(2)}</p>
        {isPayer
          ? <p className="text-xs font-medium" style={{ color: 'var(--color-owed)' }}>you paid</p>
          : <p className="text-xs font-medium" style={{ color: 'var(--color-owe)' }}>you owe ₹{myShare.toFixed(2)}</p>}
      </div>
      <button onClick={() => onDelete(expense._id)}
        className="p-1.5 rounded-lg opacity-0 group-hover/exp:opacity-100 transition-all flex-shrink-0"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-owe)'; e.currentTarget.style.color = 'var(--color-owe)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
        <Trash2 size={15} />
      </button>
    </div>
  );
};

// ── AddMemberModal ────────────────────────────────────────
const AddMemberModal = ({ group, onClose, onMemberAdded }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (search.trim().length < 2) { setResults([]); return; }
      setSearching(true);
      try {
        const { data } = await api.get(`/users?search=${search}`);
        const ids = group.members.map((m) => m._id);
        setResults(data.users.filter((u) => !ids.includes(u._id)));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, group.members]);

  const addMember = async (userId) => {
    try {
      const { data } = await api.post(`/groups/${group._id}/members`, { userId });
      toast.success('Member added!');
      onMemberAdded(data.group);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl shadow-2xl w-full max-w-md"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Add Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…" className="input-field pl-9" autoFocus />
          </div>
          {searching && <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Searching…</p>}
          {results.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {results.map((u) => (
                <button key={u._id} onClick={() => addMember(u._id)}
                  className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Avatar name={u.name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                  <UserPlus size={15} style={{ color: 'var(--brand-600)' }} />
                </button>
              ))}
            </div>
          )}
          {search.trim().length >= 2 && !searching && results.length === 0 && (
            <p className="text-sm text-center py-2" style={{ color: 'var(--text-muted)' }}>No users found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
