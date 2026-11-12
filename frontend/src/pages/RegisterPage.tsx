import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import mark from '../assets/login/mark.webp';
import './LoginPage.css';

export const RegisterPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await register(email, password, displayName);
      if (res.isComplete) {
        navigate('/feed');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page register-page">
      <header className="login-intro register-intro">
        <div className="login-brand register-brand">
          <img src={mark} alt="" />
          <p>Sans<span>Network</span></p>
        </div>
        <h1 id="register-title">Create an <span>account</span></h1>
        <p className="login-description">Build meaningful connections. Grow together.</p>
      </header>

      <section className="login-card register-card" aria-labelledby="register-title">
        <div className="login-google">
          <GoogleOAuthButton
            buttonText="Sign up with Google"
            buttonClassName="login-google-button"
            onSuccess={(isComplete) => navigate(isComplete ? '/feed' : '/profile')}
            onError={setError}
          />
        </div>
        <div className="login-rule login-divider">Or register with email</div>
        {error && <p className="login-error" role="alert">{error}</p>}

        <form onSubmit={handleRegister} className="login-form">
          <div>
            <label htmlFor="register-name">Full name</label>
            <div className="login-field">
              <User aria-hidden="true" />
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Your full name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="register-email">Email address</label>
            <div className="login-field">
              <Mail aria-hidden="true" />
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="register-password">Password</label>
            <div className="login-field">
              <Lock aria-hidden="true" />
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="login-submit">
            {loading ? 'Creating account…' : 'Create an account'} <ArrowRight aria-hidden="true" />
          </button>
        </form>

        <div className="login-membership">
          <span>Already have an account?</span> <Link to="/login">Sign in</Link>
        </div>
      </section>
    </main>
  );
};
