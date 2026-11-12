import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import mark from '../assets/login/mark.webp';
import portraitTop from '../assets/login/portrait-top.webp';
import portraitLeft from '../assets/login/portrait-left.webp';
import portraitRight from '../assets/login/portrait-right.webp';
import portraitBottom from '../assets/login/portrait-bottom.webp';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showRecoveryHelp, setShowRecoveryHelp] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password, rememberMe);
      if (res.isComplete) {
        navigate('/feed');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-layout">
        <section className="login-intro" aria-labelledby="login-title">
          <header className="login-brand">
            <img src={mark} alt="" />
            <div>
              <p>Sans<span>Network</span></p>
              <small>Build Meaningful Connections. Grow Together.</small>
            </div>
          </header>
          <h1 id="login-title">Welcome <span>Back!</span></h1>
          <p className="login-description">Sign in to continue your<br className="login-desktop-break" /> networking journey.</p>

          <div className="login-network" aria-hidden="true">
            <div className="login-orbit login-orbit-outer"><i /><i /><i /><i /></div>
            <div className="login-orbit login-orbit-inner"><i /><i /><i /><i /></div>
            <img className="login-network-mark" src={mark} alt="" />
            <img className="login-portrait login-portrait-top" src={portraitTop} alt="" />
            <img className="login-portrait login-portrait-left" src={portraitLeft} alt="" />
            <img className="login-portrait login-portrait-right" src={portraitRight} alt="" />
            <img className="login-portrait login-portrait-bottom" src={portraitBottom} alt="" />
          </div>
        </section>

        <section className="login-card" aria-label="Sign in">
          <div className="login-rule login-card-mark" aria-hidden="true"><img src={mark} alt="" /></div>
          <div className="login-google">
            <GoogleOAuthButton
              buttonText="Continue with Google"
              buttonClassName="login-google-button"
              onSuccess={(isComplete) => navigate(isComplete ? '/feed' : '/profile')}
              onError={setError}
            />
          </div>
          <div className="login-rule login-divider">Or sign in with email</div>
          {error && <p className="login-error" role="alert">{error}</p>}

          <form onSubmit={handleLogin} className="login-form">
            <div>
              <label htmlFor="login-email">Email address</label>
              <div className="login-field">
                <Mail aria-hidden="true" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password">Password</label>
              <div className="login-field">
                <Lock aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <div className="login-options">
              <label><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>
              <button type="button" aria-expanded={showRecoveryHelp} onClick={() => setShowRecoveryHelp(!showRecoveryHelp)}>
                Forgot password?
              </button>
            </div>
            {showRecoveryHelp && (
              <p className="login-recovery">Password reset is currently unavailable. Contact your account administrator for help.</p>
            )}
            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'Authenticating…' : 'Sign In'} <ArrowRight aria-hidden="true" />
            </button>
          </form>

          <div className="login-membership">
            <span>New to SansNetwork?</span> <Link to="/register">Create an account</Link>
          </div>
        </section>
      </div>

      <footer className="login-footer">
        <p className="login-rule"><ShieldCheck aria-hidden="true" /> A community for meaningful B2B relationships.</p>
      </footer>
    </main>
  );
};
