import React from 'react';
import mark from '../assets/login/mark.webp';
import './LoginPage.css';

import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <main className="login-page register-page">
      <header className="login-intro register-intro">
        <div className="login-brand register-brand">
          <img src={mark} alt="" />
          <p>Sans<span>Networks</span></p>
        </div>
        <h1 id="register-title">Create an <span>account</span></h1>
        <p className="login-description">Build meaningful connections. Grow together.</p>
      </header>

      <section className="login-card register-card" aria-labelledby="register-title">
        <RegisterForm />
      </section>
    </main>
  );
};
