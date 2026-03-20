import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowRight, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState } from '../components/ui/index.jsx';
import { Avatar } from '../components/layout/Sidebar.jsx';
import toast from 'react-hot-toast';

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data.groups);
    } catch { toast.error('Failed to load groups'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete group "${name}"? This removes all expenses and settlements.`)) return;
    try {
      await api.delete(`/groups/${id}`);
      setGroups((prev) => prev.filter((g) => g._id !== id));
      toast.success('Group deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete group'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Groups</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {groups.length} group{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/groups/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={Users} title="No groups yet"
          description="Create a group to start splitting expenses with your friends."
          action={
            <Link to="/groups/new" className="btn-primary text-sm flex items-center gap-2">
              <Plus size={15} /> Create your first group
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {groups.map((group) => (
            <div key={group._id} className="card card-hover relative group/card">
              {group.createdBy._id === user._id && (
                <button
                  onClick={(e) => { e.preventDefault(); handleDelete(group._id, group.name); }}
                  className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-owe)'; e.currentTarget.style.color = 'var(--color-owe)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="Delete group"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <Link to={`/groups/${group._id}`} className="block">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: 'var(--brand-600)' }}>
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{group.name}</h3>
                    {group.description && (
                      <p className="text-xs truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 5).map((m) => (
                      <div key={m._id} title={m.name} className="ring-2 rounded-full" style={{ '--tw-ring-color': 'var(--bg-card)' }}>
                        <Avatar name={m.name} size="sm" />
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '2px solid var(--bg-card)' }}>
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{group.members.length} members</span>
                </div>
                <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--brand-600)' }}>
                    View <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
