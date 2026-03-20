import { X } from 'lucide-react';
import { useEffect } from 'react';

// ── Modal ─────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ── Spinner ───────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div
      className={`${sizes[size]} border-4 rounded-full animate-spin ${className}`}
      style={{ borderColor: 'var(--brand-100)', borderTopColor: 'var(--brand-600)' }}
    />
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
    </div>
  </div>
);

// ── EmptyState ────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: 'var(--bg-muted)' }}
    >
      <Icon size={28} style={{ color: 'var(--text-muted)' }} />
    </div>
    <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
    {description && (
      <p className="text-sm max-w-xs mb-4" style={{ color: 'var(--text-muted)' }}>{description}</p>
    )}
    {action}
  </div>
);

// ── StatCard ──────────────────────────────────────────────
export const StatCard = ({ label, amount, type = 'neutral' }) => {
  const styles = {
    owe:     { color: 'var(--color-owe)',  bg: 'var(--bg-owe)',  border: 'var(--border-owe)' },
    owed:    { color: 'var(--color-owed)', bg: 'var(--bg-owed)', border: 'var(--border-owed)' },
    neutral: { color: 'var(--text-primary)', bg: 'var(--bg-card)', border: 'var(--border)' },
  };
  const s = styles[type];
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: 'var(--shadow-card)' }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: s.color, opacity: 0.7 }}
      >
        {label}
      </p>
      <p className="text-3xl font-display font-bold" style={{ color: s.color }}>
        ₹{Math.abs(amount).toFixed(2)}
      </p>
    </div>
  );
};

// ── FormField ─────────────────────────────────────────────
export const FormField = ({ label, error, children }) => (
  <div>
    {label && (
      <label
        className="block text-sm font-semibold mb-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
    )}
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);
