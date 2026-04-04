import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, full_name: form.full_name, password: form.password });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>📦</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join and start shopping today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Username *</label>
              <input type="text" value={form.username} onChange={e => update('username', e.target.value)}
                placeholder="johndoe" style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                placeholder="John Doe" style={styles.input} />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email *</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              placeholder="john@example.com" style={styles.input} required />
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                placeholder="Min 6 chars" style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password *</label>
              <input type="password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)}
                placeholder="Repeat password" style={styles.input} required />
            </div>
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 800, color: '#2c3e50', textAlign: 'center', margin: '0 0 8px 0' },
  subtitle: { fontSize: 15, color: '#7f8c8d', textAlign: 'center', margin: '0 0 32px 0' },
  error: { background: '#fde8e8', color: '#c0392b', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#2c3e50' },
  input: { padding: '12px 14px', border: '2px solid #ecf0f1', borderRadius: 10, fontSize: 14, outline: 'none' },
  btn: { padding: '15px', background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#7f8c8d' },
  link: { color: '#3498db', fontWeight: 600, textDecoration: 'none' },
};
