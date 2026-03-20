import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, UserPlus, Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/layout/Sidebar.jsx';
import toast from 'react-hot-toast';

const CreateGroupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim().length >= 2) doSearch();
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const doSearch = async () => {
    setSearching(true);
    try {
      const { data } = await api.get(`/users?search=${search}`);
      setSearchResults(data.users.filter((u) => !selectedMembers.find((m) => m._id === u._id)));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const addMember = (u) => { setSelectedMembers((p) => [...p, u]); setSearch(''); setSearchResults([]); };
  const removeMember = (id) => setSelectedMembers((p) => p.filter((m) => m._id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Group name is required'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/groups', {
        name: form.name.trim(), description: form.description.trim(),
        memberIds: selectedMembers.map((m) => m._id),
      });
      toast.success('Group created!');
      navigate(`/groups/${data.group._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create group'); }
    finally { setLoading(false); }
  };

  const sectionStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create a Group</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Add friends and start splitting expenses</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl p-6 space-y-4" style={sectionStyle}>
          <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={18} style={{ color: 'var(--brand-600)' }} /> Group Details
          </h2>
          {[
            { key: 'name', label: 'Group Name *', placeholder: 'e.g. Goa Trip 2025', max: 100 },
            { key: 'description', label: 'Description (optional)', placeholder: 'What is this group for?', max: 200 },
          ].map(({ key, label, placeholder, max }) => (
            <div key={key}>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder} className="input-field" maxLength={max} />
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 space-y-4" style={sectionStyle}>
          <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <UserPlus size={18} style={{ color: 'var(--brand-600)' }} /> Add Members
          </h2>

          {/* You */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
            <Avatar name={user?.name} size="sm" />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {user?.name} <span style={{ color: 'var(--brand-600)' }}>(you)</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>

          {selectedMembers.map((m) => (
            <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
              <Avatar name={m.name} size="sm" />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
              </div>
              <button type="button" onClick={() => removeMember(m._id)}
                className="p-1 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-owe)'; e.currentTarget.style.color = 'var(--color-owe)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                <X size={15} />
              </button>
            </div>
          ))}

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…" className="input-field pl-9" />
          </div>

          {searchResults.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {searchResults.map((u) => (
                <button key={u._id} type="button" onClick={() => addMember(u)}
                  className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left"
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Avatar name={u.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                  <UserPlus size={15} className="ml-auto" style={{ color: 'var(--brand-600)' }} />
                </button>
              ))}
            </div>
          )}
          {searching && <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Searching…</p>}
          {search.trim().length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>No users found matching "{search}"</p>
          )}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupPage;
