import { useState } from 'react';
import { Modal } from './ui/index.jsx';
import { Avatar } from './layout/Sidebar.jsx';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const SettleUpModal = ({ isOpen, onClose, group, suggestedSettlements, onSettled }) => {
  const [loading, setLoading] = useState(null);

  const handleSettle = async (settlement, idx) => {
    setLoading(idx);
    try {
      await api.post('/settlements', {
        fromUser: settlement.from._id, toUser: settlement.to._id,
        amount: settlement.amount, groupId: group._id, note: 'Settled up',
      });
      toast.success(`₹${settlement.amount} settlement recorded!`);
      onSettled();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Settlement failed'); }
    finally { setLoading(null); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settle Up">
      {suggestedSettlements.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>All settled up!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>No outstanding balances in this group.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Suggested payments to settle all debts:</p>
          {suggestedSettlements.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={s.from?.name} size="sm" />
                <span className="text-xs font-semibold truncate max-w-[70px]" style={{ color: 'var(--text-secondary)' }}>
                  {s.from?.name?.split(' ')[0]}
                </span>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <Avatar name={s.to?.name} size="sm" />
                <span className="text-xs font-semibold truncate max-w-[70px]" style={{ color: 'var(--text-secondary)' }}>
                  {s.to?.name?.split(' ')[0]}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>₹{s.amount.toFixed(2)}</span>
                <button onClick={() => handleSettle(s, i)} disabled={loading === i} className="btn-primary text-xs px-3 py-1.5">
                  {loading === i
                    ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'Record'}
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
            Recording a settlement marks it as paid and updates balances.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default SettleUpModal;
