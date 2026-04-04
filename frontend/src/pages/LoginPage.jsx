import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>📦</div>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your username"
              style={styles.input}
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>

        {/* Demo credentials hint */}
        <div style={styles.demo}>
          <p style={styles.demoTitle}>Demo Credentials:</p>
          <p style={styles.demoText}>Admin: <code>admin</code> / <code>admin123</code></p>
          <p style={styles.demoText}>Customer: <code>customer1</code> / <code>pass123</code></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 800, color: '#2c3e50', textAlign: 'center', margin: '0 0 8px 0' },
  subtitle: { fontSize: 15, color: '#7f8c8d', textAlign: 'center', margin: '0 0 32px 0' },
  error: { background: '#fde8e8', color: '#c0392b', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: '#2c3e50' },
  input: { padding: '14px 16px', border: '2px solid #ecf0f1', borderRadius: 10, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' },
  btn: { padding: '15px', background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#7f8c8d' },
  link: { color: '#3498db', fontWeight: 600, textDecoration: 'none' },
  demo: { marginTop: 24, padding: '16px', background: '#f8f9fa', borderRadius: 10, border: '1px dashed #bdc3c7' },
  demoTitle: { fontSize: 12, fontWeight: 700, color: '#7f8c8d', marginBottom: 6, margin: '0 0 6px 0' },
  demoText: { fontSize: 12, color: '#95a5a6', margin: '4px 0' },
};
