'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BodyPart {
  part: string;
  price: number | string;
}

interface Athlete {
  id: string;
  name: string;
  city: string;
  sport_type: string;
  upcoming_event: string;
  event_date: string;
  instagram_handle: string | null;
  available_body_parts: BodyPart[];
  photo_url: string | null;
}

export default function AthletesPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [cityFilter, setCityFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');

  // User auth state for dynamic header actions
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    async function checkAuth() {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        // Not logged in, completely fine for a public page
      }
    }

    checkAuth();
  }, [API_URL]);

  // Fetch athletes whenever filters change (with slight debounce via effect)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const queryParams = new URLSearchParams();
    if (cityFilter.trim()) queryParams.set('city', cityFilter.trim());
    if (sportFilter.trim()) queryParams.set('sport_type', sportFilter.trim());
    if (eventFilter.trim()) queryParams.set('event', eventFilter.trim());

    fetch(`${API_URL}/athletes?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load athletes');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setAthletes(data.athletes || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error fetching directory');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [API_URL, cityFilter, sportFilter, eventFilter]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/athletes');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      {/* Header / Nav */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <div>
          <Link href="/" style={{ textDecoration: 'none', color: '#111827' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Athlete Directory</h1>
          </Link>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
            Browse and discover athletes available for event sponsorships
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <>
              {user.role === 'brand' && (
                <Link
                  href="/brand/profile"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Edit Brand Profile
                </Link>
              )}
              {user.role === 'athlete' && (
                <Link
                  href="/athlete/profile"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  My Profile
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <section style={{ backgroundColor: '#f9fafb', padding: '1.25rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.75rem 0', color: '#374151' }}>
          Filter Athletes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '0.25rem' }}>
              Sport / Discipline
            </label>
            <input
              type="text"
              placeholder="e.g. Hyrox, Marathon..."
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '0.25rem' }}>
              City
            </label>
            <input
              type="text"
              placeholder="e.g. London, Austin..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '0.25rem' }}>
              Upcoming Event
            </label>
            <input
              type="text"
              placeholder="e.g. 2026 Championships..."
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {(sportFilter || cityFilter || eventFilter) && (
          <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
            <button
              onClick={() => {
                setSportFilter('');
                setCityFilter('');
                setEventFilter('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* Directory Listing */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p>Loading available athletes...</p>
        </div>
      ) : athletes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '0.5rem' }}>No athletes found.</p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Try clearing or adjusting your search filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {athletes.map((athlete) => (
            <Link
              key={athlete.id}
              href={`/athletes/${athlete.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s, transform 0.2s',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ height: '200px', backgroundColor: '#e5e7eb', position: 'relative' }}>
                {athlete.photo_url ? (
                  <img
                    src={`${API_URL}${athlete.photo_url}`}
                    alt={athlete.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {athlete.name?.charAt(0) || 'A'}
                  </div>
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 500,
                  }}
                >
                  {athlete.sport_type}
                </span>
              </div>

              <div style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                    {athlete.name}
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    {athlete.city}
                  </span>
                </div>

                {athlete.instagram_handle && (
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#2563eb' }}>
                    {athlete.instagram_handle.startsWith('@') ? athlete.instagram_handle : `@${athlete.instagram_handle}`}
                  </p>
                )}

                <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: '4px', marginBottom: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Next Event</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>
                    {athlete.upcoming_event}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                    {new Date(athlete.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Available Body Parts:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {athlete.available_body_parts && athlete.available_body_parts.map((bp, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 500,
                        }}
                      >
                        {bp.part}: ${bp.price}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
