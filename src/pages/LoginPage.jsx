import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/Layout/BrandLogo';
import './AuthPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    setTimeout(() => {
      const result = login(form.email, form.password);
      if (result.success) {
        navigate('/generator');
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden>
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <BrandLogo size={34} fontSize="1.2rem" fontWeight={800} gap="10px" />
        </div>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to start generating pitches</p>

        <form onSubmit={submit} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="current-password" />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Sign In →'}
          </button>
        </form>

        <button type="button" className="auth-forgot" onClick={() => console.log('Forgot password functionality')}>
          Forgot password?
        </button>
        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up Free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
