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
      <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Loading admin portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Admin Login</h2>
        {loginError && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{loginError}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Admin Password:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: '0.75rem', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Login to Admin Dashboard
          </button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Public Site</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0, color: '#111827' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>Public Home</Link>
          <button
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {dataError && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '2rem' }}>
          {dataError}
        </div>
      )}

      {/* Athletes Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
          Registered Athletes ({athletes.length})
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Sport</th>
                <th style={{ padding: '0.75rem' }}>City</th>
                <th style={{ padding: '0.75rem' }}>Consented?</th>
                <th style={{ padding: '0.75rem' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>{a.id.substring(0, 8)}...</td>
                  <td style={{ padding: '0.75rem' }}>{a.email}</td>
                  <td style={{ padding: '0.75rem' }}>{a.name || <span style={{ color: '#9ca3af' }}>Incomplete</span>}</td>
                  <td style={{ padding: '0.75rem' }}>{a.sport_type || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{a.city || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ color: a.consent_given ? '#16a34a' : '#d97706', fontWeight: 'bold' }}>
                      {a.consent_given ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {athletes.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No athletes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Brands Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
          Registered Brands ({brands.length})
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Company Name</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Contact Name</th>
                <th style={{ padding: '0.75rem' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>{b.id.substring(0, 8)}...</td>
                  <td style={{ padding: '0.75rem' }}>{b.email}</td>
                  <td style={{ padding: '0.75rem' }}>{b.company_name || <span style={{ color: '#9ca3af' }}>Incomplete</span>}</td>
                  <td style={{ padding: '0.75rem' }}>{b.category || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{b.contact_name || '-'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No brands found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contact Requests Section */}
      <section>
        <h2 style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
          Contact Requests ({contactRequests.length})
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>From Brand</th>
                <th style={{ padding: '0.75rem' }}>To Athlete</th>
                <th style={{ padding: '0.75rem', width: '50%' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {contactRequests.map((cr) => (
                <tr key={cr.id} style={{ borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                    {new Date(cr.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{cr.company_name}</td>
                  <td style={{ padding: '0.75rem' }}>{cr.athlete_name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ backgroundColor: '#f9fafb', padding: '0.5rem', borderRadius: '4px', border: '1px solid #f3f4f6', fontSize: '0.9rem', color: '#374151' }}>
                      {cr.message}
                    </div>
                  </td>
                </tr>
              ))}
              {contactRequests.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No contact requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}