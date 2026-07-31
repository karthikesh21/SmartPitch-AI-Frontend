import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/Layout/BrandLogo';
import './AuthPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    // Validation
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = signup(form.email, form.password, form.name);

      if (result.success) {
        login(form.email, form.password);
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

        <h1>Create account</h1>
        <p className="auth-sub">
          Start generating AI-powered pitches for free
        </p>

        <form onSubmit={submit} className="auth-form">
          <div className="auth-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Smith"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-terms">
          By signing up you agree to our{' '}
          <Link to="/terms">Terms</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;