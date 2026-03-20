import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-4"
            style={{ background: 'var(--brand-600)' }}>
            <Wallet size={24} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>SplitEase</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Split expenses with friends, effortlessly</p>
        </div>

        <div className="card shadow-xl">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name',     label: 'Full name',         type: 'text',     placeholder: 'Alex Johnson',          autoComplete: 'name' },
              { name: 'email',    label: 'Email address',     type: 'email',    placeholder: 'you@example.com',       autoComplete: 'email' },
              { name: 'password', label: 'Password',          type: showPw ? 'text' : 'password', placeholder: 'At least 6 characters', autoComplete: 'new-password' },
              { name: 'confirm',  label: 'Confirm password',  type: 'password', placeholder: 'Repeat your password',  autoComplete: 'new-password' },
            ].map(({ name, label, type, placeholder, autoComplete }) => (
              <div key={name}>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                <div className="relative">
                  <input
                    type={type} name={name} value={form[name]}
                    onChange={handleChange} placeholder={placeholder}
                    className={`input-field ${name === 'password' ? 'pr-11' : ''}`}
                    autoComplete={autoComplete}
                  />
                  {name === 'password' && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><span>Create account</span><ArrowRight size={16} /></>
              }
            </button>
          </form>
          <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--brand-600)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
