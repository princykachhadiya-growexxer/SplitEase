import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, TrendingDown, Plus, ArrowRight, Receipt } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState } from '../components/ui/index.jsx';
import { Avatar } from '../components/layout/Sidebar.jsx';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [summary, setSummary] = useState({ totalOwe: 0, totalOwed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data.groups);
      let totalOwe = 0, totalOwed = 0;
      await Promise.all(data.groups.map(async (group) => {
        try {
          const res = await api.get(`/expenses/group/${group._id}/balances`);
          const mb = res.data.memberBalances.find((m) => m.user._id === user._id);
          if (mb) {
            if (mb.balance < 0) totalOwe += Math.abs(mb.balance);
            else totalOwed += mb.balance;
          }
        } catch { /* skip */ }
      }));
      setSummary({
        totalOwe: Math.round(totalOwe * 100) / 100,
        totalOwed: Math.round(totalOwed * 100) / 100,
      });
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  const netBalance = summary.totalOwed - summary.totalOwe;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Here's your expense overview</p>
        </div>
        <Link to="/groups/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /><span className="hidden sm:inline">New Group</span>
        </Link>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="You Owe" amount={summary.totalOwe}
          icon={TrendingDown} iconColor="text-red-400"
          valueColor="var(--color-owe)" bg="var(--bg-owe)" border="var(--border-owe)"
          sub="across all groups"
        />
        <SummaryCard
          label="You're Owed" amount={summary.totalOwed}
          icon={TrendingUp} iconColor="text-emerald-400"
          valueColor="var(--color-owed)" bg="var(--bg-owed)" border="var(--border-owed)"
          sub="across all groups"
        />
        <SummaryCard
          label="Net Balance" amount={netBalance}
          icon={Receipt} iconColor={netBalance >= 0 ? 'text-brand-400' : 'text-orange-400'}
          valueColor={netBalance >= 0 ? 'var(--brand-600)' : '#f97316'}
          bg={netBalance >= 0 ? 'var(--bg-owed)' : '#fff7ed'}
          border={netBalance >= 0 ? 'var(--border-owed)' : '#fed7aa'}
          sub={netBalance >= 0 ? 'overall you are ahead' : 'overall you owe more'}
          showSign
        />
      </div>

      {/* Groups */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Your Groups</h2>
          <Link to="/groups" className="text-sm font-medium flex items-center gap-1 transition-colors"
            style={{ color: 'var(--brand-600)' }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {groups.length === 0 ? (
          <EmptyState
            icon={Users} title="No groups yet"
            description="Create a group to start splitting expenses with friends."
            action={
              <Link to="/groups/new" className="btn-primary text-sm flex items-center gap-2">
                <Plus size={15} /> Create your first group
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} userId={user._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, amount, icon: Icon, iconColor, valueColor, bg, border, sub, showSign }) => (
  <div className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${border}`, boxShadow: 'var(--shadow-card)' }}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: valueColor, opacity: 0.7 }}>{label}</p>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg, border: `1px solid ${border}` }}>
        <Icon size={16} className={iconColor} />
      </div>
    </div>
    <p className="font-display text-3xl font-bold" style={{ color: valueColor }}>
      {showSign && amount >= 0 ? '+' : showSign && amount < 0 ? '-' : ''}₹{Math.abs(amount).toFixed(2)}
    </p>
    <p className="text-xs mt-1" style={{ color: valueColor, opacity: 0.6 }}>{sub}</p>
  </div>
);

const GroupCard = ({ group, userId }) => {
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    api.get(`/expenses/group/${group._id}/balances`)
      .then(({ data }) => {
        const mb = data.memberBalances.find((m) => m.user._id === userId);
        setBalance(mb?.balance ?? 0);
      })
      .catch(() => setBalance(0));
  }, [group._id, userId]);

  return (
    <Link to={`/groups/${group._id}`} className="card card-hover block cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: 'var(--brand-600)' }}>
          <Users size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{group.name}</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{group.members.length} members</p>
        </div>
      </div>
      <div className="flex items-center -space-x-2 mb-4">
        {group.members.slice(0, 4).map((m) => (
          <div key={m._id} title={m.name} className="ring-2 rounded-full" style={{ '--tw-ring-color': 'var(--bg-card)' }}>
            <Avatar name={m.name} size="sm" />
          </div>
        ))}
        {group.members.length > 4 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '2px solid var(--bg-card)' }}>
            +{group.members.length - 4}
          </div>
        )}
      </div>
      <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {balance === null
          ? <div className="h-4 rounded animate-pulse w-24" style={{ background: 'var(--bg-muted)' }} />
          : balance === 0 ? <span className="badge-settled">All settled</span>
          : balance > 0 ? <span className="badge-owed">You get ₹{balance.toFixed(2)}</span>
          : <span className="badge-owe">You owe ₹{Math.abs(balance).toFixed(2)}</span>
        }
      </div>
    </Link>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;
