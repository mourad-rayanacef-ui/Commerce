import React, { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { uploadsAPI } from '../services/api';
import '../styles/profile.css';

const ProfilePage = () => {
  const { user, token, refreshUser } = useContext(AuthContext);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const pickFile = () => inputRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;
    setError('');
    setStatus('');
    setBusy(true);
    try {
      const url = await uploadsAPI.uploadImage(file, token);
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_url: url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Could not save profile photo');
        return;
      }
      await refreshUser();
      setStatus('Profile photo updated.');
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const clearPhoto = async () => {
    if (!token) return;
    setError('');
    setStatus('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_url: '' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.detail === 'string' ? data.detail : 'Could not remove photo');
        return;
      }
      await refreshUser();
      setStatus('Profile photo removed.');
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <div>
          <h1>Profile</h1>
          <p className="profile-hero-sub">Your account and profile picture.</p>
        </div>
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/'} className="profile-back">
          ← Back
        </Link>
      </header>

      <div className="profile-card">
        <div className="profile-avatar-wrap">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-placeholder" aria-hidden>
              {(user?.username || '?').slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <dl className="profile-fields">
          <div>
            <dt>Username</dt>
            <dd>{user?.username}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Full name</dt>
            <dd>{user?.full_name || '—'}</dd>
          </div>
        </dl>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="profile-file-input"
          onChange={onFile}
          aria-hidden
        />

        <div className="profile-actions">
          <button type="button" className="profile-btn profile-btn-primary" onClick={pickFile} disabled={busy}>
            {busy ? 'Working…' : 'Upload new photo'}
          </button>
          {user?.avatar_url ? (
            <button type="button" className="profile-btn profile-btn-ghost" onClick={clearPhoto} disabled={busy}>
              Remove photo
            </button>
          ) : null}
        </div>

        <p className="profile-hint">JPEG, PNG, WebP, or GIF — up to 5MB. Stored on Cloudinary when configured, otherwise on this server.</p>

        {error && (
          <p className="profile-msg profile-msg--error" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p className="profile-msg profile-msg--ok" role="status">
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
