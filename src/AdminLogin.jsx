
import { useState } from 'react';
import './AdminLogin.css';

function AdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (username === 'admin' && password === 'Estate@123') {
      setError('');
      onLogin();
    } else {
      setError('Incorrect username or password.');
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="login-eyebrow">APNAESTATE MANAGEMENT</p>
        <h1>Admin Login</h1>
        <p className="login-description">
          Sign in to manage your property listings.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter admin username"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit">
            Sign In
          </button>
        </form>

        <button type="button" className="login-back" onClick={onBack}>
          ← Back to Buyer Website
        </button>
      </section>
    </main>
  );
}

export default AdminLogin;
