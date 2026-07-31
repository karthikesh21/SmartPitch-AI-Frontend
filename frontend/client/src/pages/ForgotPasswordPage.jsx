import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import BrandLogo from '../components/Layout/BrandLogo';
import './AuthPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    setDevOtpHint('');

    try {
      const res = await authAPI.forgotPassword({ email });
      if (res && res.success) {
        setInfoMessage(res.message || 'OTP code sent to your email address.');
        if (res.devOtp) {
          setDevOtpHint(`Dev helper: OTP is ${res.devOtp}`);
        }
        setStep(2);
      } else {
        setError(res.error || 'Failed to send OTP.');
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.error || err?.message || 'Failed to send OTP.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    if (otp.length < 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authAPI.verifyOTP({ email, otp });
      if (res && res.success) {
        setInfoMessage('OTP verified! Now enter your new password.');
        setStep(3);
      } else {
        setError(res.error || 'Invalid OTP code.');
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.error || err?.message || 'Verification failed.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authAPI.resetPassword({ email, otp, newPassword });
      if (res && res.success) {
        // Automatically attempt login with new password
        const loginRes = await login(email, newPassword);
        if (loginRes.success) {
          setStep(4);
        } else {
          setStep(4);
        }
      } else {
        setError(res.error || 'Failed to reset password.');
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.error || err?.message || 'Failed to reset password.');
      setError(msg);
    } finally {
      setLoading(false);
    }
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

        {step === 1 && (
          <>
            <h1>Forgot Password</h1>
            <p className="auth-sub">Enter your email address to receive a 6-digit OTP</p>

            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : 'Send OTP to Mail →'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Enter OTP Code</h1>
            <p className="auth-sub">Enter the 6-digit OTP code sent to <strong>{email}</strong></p>

            {infoMessage && (
              <div style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '10px',
                color: '#4ade80',
                fontSize: '0.85rem',
                padding: '10px 14px',
                marginBottom: '16px'
              }}>
                {infoMessage}
              </div>
            )}

            {devOtpHint && (
              <div style={{
                background: 'rgba(234,179,8,0.12)',
                border: '1px solid rgba(234,179,8,0.3)',
                borderRadius: '10px',
                color: '#fde047',
                fontSize: '0.82rem',
                padding: '10px 14px',
                marginBottom: '16px'
              }}>
                {devOtpHint}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="auth-field">
                <label>6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    letterSpacing: '6px',
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    fontWeight: 700
                  }}
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : 'Verify OTP →'}
              </button>

              <button
                type="button"
                className="auth-forgot"
                style={{ textAlign: 'center', marginTop: '12px' }}
                onClick={() => setStep(1)}
              >
                Change email or resend OTP
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Reset Password</h1>
            <p className="auth-sub">Choose a new secure password for your account</p>

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="auth-field">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : 'Reset Password & Login →'}
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)',
              border: '2px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justify-content: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
              color: '#22c55e'
            }}>
              ✓
            </div>
            <h1 style={{ marginBottom: '10px' }}>Password Reset Complete!</h1>
            <p className="auth-sub" style={{ marginBottom: '24px' }}>
              Your password has been successfully updated. You can now log in across all your devices.
            </p>

            <button
              type="button"
              className="auth-btn"
              style={{ width: '100%' }}
              onClick={() => navigate('/generator')}
            >
              Continue to Generator 🚀
            </button>
          </div>
        )}

        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">
          Remember your password? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
