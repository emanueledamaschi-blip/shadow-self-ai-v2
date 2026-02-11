'use client';

import React, { useState } from 'react';
import { Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          onAuthSuccess(data.user);
        }
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage('Account creato! Controlla la tua email per confermare.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Moon size={48} color="#c41e3a" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#e8e8e8' }}>
            SHADOW SELF AI
          </h1>
          <p style={{ color: '#a0a0a0', fontStyle: 'italic' }}>
            Integrate what you deny. Transform what you hide.
          </p>
        </div>

        {/* Auth Form */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #2a2a2a'
        }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: isLogin ? '#c41e3a' : 'transparent',
                color: isLogin ? '#fff' : '#a0a0a0',
                border: 'none',
                borderRadius: '6px 0 0 6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                padding: '12px 24px',
                backgroundColor: !isLogin ? '#c41e3a' : 'transparent',
                color: !isLogin ? '#fff' : '#a0a0a0',
                border: 'none',
                borderRadius: '0 6px 6px 0',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#a0a0a0',
                fontWeight: '500'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#e8e8e8',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#a0a0a0',
                fontWeight: '500'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#e8e8e8',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              {!isLogin && (
                <p style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '4px' }}>
                  Minimo 6 caratteri
                </p>
              )}
            </div>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#2a1a1a',
                border: '1px solid #c41e3a',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '14px', color: '#c41e3a' }}>
                  {error}
                </p>
              </div>
            )}

            {message && (
              <div style={{
                padding: '12px',
                backgroundColor: '#1a2a1a',
                border: '1px solid #4caf50',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '14px', color: '#4caf50' }}>
                  {message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#c41e3a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Loading...' : isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          {isLogin && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={async () => {
                  if (email) {
                    setLoading(true);
                    const { error } = await supabase.auth.resetPasswordForEmail(email);
                    if (error) {
                      setError(error.message);
                    } else {
                      setMessage('Email di reset password inviata!');
                    }
                    setLoading(false);
                  } else {
                    setError('Inserisci la tua email prima');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4a90e2',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Password dimenticata?
              </button>
            </div>
          )}
        </div>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#a0a0a0'
        }}>
          {isLogin ? (
            <>
              Non hai un account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4a90e2',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Registrati
              </button>
            </>
          ) : (
            <>
              Hai già un account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4a90e2',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
