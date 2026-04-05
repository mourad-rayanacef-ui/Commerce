import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  /**
   * False only while validating a stored token on load (or after token change).
   * No token => ready immediately. Avoids /orders redirect-to-login flash after checkout reload.
   */
  const [authReady, setAuthReady] = useState(() => !localStorage.getItem('token'));

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setUser(null);
      setAuthReady(true);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.username === 'string') {
            setUser(data);
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.detail };
      }

      const accessToken = data.access_token;
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!meRes.ok) {
        return { success: false, error: 'Could not load your profile' };
      }
      const me = await meRes.json();
      if (!me || typeof me.username !== 'string') {
        return { success: false, error: 'Invalid profile response' };
      }

      localStorage.setItem('token', accessToken);
      setAuthReady(true);
      setToken(accessToken);
      setUser(me);
      return { success: true, user: me };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, username, password, full_name) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, full_name }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, user: data };
      }
      return { success: false, error: data.detail };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setAuthReady(true);
  };

  const refreshUser = async () => {
    const t = token || localStorage.getItem('token');
    if (!t) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.username === 'string') {
          setUser(data);
        }
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, authReady, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
