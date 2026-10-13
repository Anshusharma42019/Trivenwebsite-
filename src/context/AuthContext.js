'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setUser(json.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (emailOrPhone, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone,
        identifier: emailOrPhone,
        email: emailOrPhone,
        password,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    await refreshUser();
    return data.data.user;
  };

  const register = async (nameOrData, phoneOrEmail, password, optionalOther) => {
    let payload;
    if (typeof nameOrData === 'object' && nameOrData !== null) {
      payload = nameOrData;
    } else {
      // If 2nd parameter looks like a 10-digit phone
      const cleanDigits = String(phoneOrEmail || '').replace(/[^0-9]/g, '');
      if (cleanDigits.length >= 10 && !String(phoneOrEmail).includes('@')) {
        payload = {
          name: nameOrData,
          phone: phoneOrEmail,
          password: password,
          email: optionalOther || '',
        };
      } else {
        payload = {
          name: nameOrData,
          email: phoneOrEmail,
          password: password,
          phone: optionalOther || '',
        };
      }
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    await refreshUser();
    return data.data.user;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isStaff: user && user.role !== 'customer',
        isSuperAdmin: user && user.role === 'super_admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
