'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data
  const [athletes, setAthletes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [dataError, setDataError] = useState('');

  // Check Auth on Mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setAuthChecking(true);
    try {
      const res = await fetch(`${API_URL}/admin/me`, { credentials: 'include' });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed.');
      }

      setIsAuthenticated(true);
      fetchDashboardData();
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setAthletes([]);
      setBrands([]);
      setContactRequests([]);
      setPassword('');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const fetchDashboardData = async () => {
    setDataError('');
    try {
      const [athRes, braRes, crRes] = await Promise.all([
        fetch(`${API_URL}/admin/athletes`, { credentials: 'include' }),
        fetch(`${API_URL}/admin/brands`, { credentials: 'include' }),
        fetch(`${API_URL}/admin/contact-requests`, { credentials: 'include' })
      ]);

      if (!athRes.ok || !braRes.ok || !crRes.ok) {
        throw new Error('Failed to fetch admin data.');
      }

      const athData = await athRes.json();
      const braData = await braRes.json();
      const crData = await crRes.json();

      setAthletes(athData.athletes || []);
      setBrands(braData.brands || []);
      setContactRequests(crData.contact_requests || []);
    } catch (err: any) {
      setDataError(err.message);
    }
  };

  // Render Logic
  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading admin portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
        {/* Simple Header */}
        <header style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '1.2rem'
            }}>
              A
            </div>
            <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              ATSYS
            </span>
          </Link>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="animate-fade-in" style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'var(--bg-card)',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Admin Portal</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Log in to access platform data.</p>
            </div>

            {loginError && (
              <div style={{
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                marginBottom: '1.5rem',
                border: '1px solid var(--danger-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚠️</span> {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '1rem',
                  padding: '0.875rem',
                  backgroundColor: 'var(--text-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'background-color 0.2s'
                }}
              >
                Login to Admin Dashboard
              </button>
            </form>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>← Back to Public Site</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '1.2rem'
          }}>
            A
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>ATSYS</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin Dashboard</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Public Home
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '2.5rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1 }}>
        {dataError && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', border: '1px solid var(--danger-border)', fontWeight: 500 }}>
            ⚠️ {dataError}
          </div>
        )}

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Athletes</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-jakarta)' }}>{athletes.length}</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Brands</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-jakarta)' }}>{brands.length}</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Contact Inquiries</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', margin: 0, fontFamily: 'var(--font-jakarta)' }}>{contactRequests.length}</p>
          </div>
        </div>

        {/* Athletes Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '1.25rem', fontWeight: 700 }}>
            Registered Athletes
          </h2>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ID</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sport</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>City</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Consent</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-page)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.id.substring(0, 8)}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{a.email}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{a.name || <span style={{ color: 'var(--text-light)', fontStyle: 'italic', fontWeight: 400 }}>Incomplete</span>}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{a.sport_type || '-'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{a.city || '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: a.consent_given ? 'var(--success-light)' : 'var(--warning-light)',
                          color: a.consent_given ? 'var(--success-hover)' : '#b45309',
                          border: `1px solid ${a.consent_given ? 'var(--success-border)' : 'var(--warning-border)'}`
                        }}>
                          {a.consent_given ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {athletes.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No athletes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '1.25rem', fontWeight: 700 }}>
            Registered Brands
          </h2>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ID</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Name</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Name</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-page)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.id.substring(0, 8)}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{b.email}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{b.company_name || <span style={{ color: 'var(--text-light)', fontStyle: 'italic', fontWeight: 400 }}>Incomplete</span>}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{b.category || '-'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{b.contact_name || '-'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(b.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {brands.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No brands found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Contact Requests Section */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '1.25rem', fontWeight: 700 }}>
            Contact Inquiries
          </h2>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From Brand</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>To Athlete</th>
                    <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', width: '50%' }}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {contactRequests.map((cr) => (
                    <tr key={cr.id} style={{ borderBottom: '1px solid var(--border-subtle)', verticalAlign: 'top', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-page)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(cr.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cr.company_name}</td>
                      <td style={{ padding: '1.25rem 1rem', fontSize: '0.95rem', color: 'var(--primary)' }}>{cr.athlete_name}</td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{
                          backgroundColor: 'var(--bg-subtle)',
                          padding: '1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          color: 'var(--text-secondary)',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {cr.message}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {contactRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No contact requests yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}