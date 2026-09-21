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

  // Fetch athletes whenever filters change
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header / Nav */}
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '1.2rem'
          }}>
            A
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Marketplace</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Athlete Directory</span>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <>
              {user.role === 'brand' && (
                <Link
                  href="/brand/profile"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Brand Dashboard
                </Link>
              )}
              {user.role === 'athlete' && (
                <Link
                  href="/athlete/profile"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  My Profile
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
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
                padding: '0.5rem 1.25rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%', flex: 1 }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Discover Athletes</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Find the perfect match for your next campaign.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <section style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Sport / Discipline
              </label>
              <input
                type="text"
                placeholder="e.g. Hyrox, Marathon..."
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. London, Austin..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Upcoming Event
              </label>
              <input
                type="text"
                placeholder="e.g. 2026 Championships..."
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {(sportFilter || cityFilter || eventFilter) && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filtering results...</span>
              <button
                onClick={() => {
                  setSportFilter('');
                  setCityFilter('');
                  setEventFilter('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear Filters ×
              </button>
            </div>
          )}
        </section>

        {/* Directory Listing */}
        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', border: '1px solid var(--danger-border)' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p>Loading available athletes...</p>
          </div>
        ) : athletes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--border-hover)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No athletes found.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Try clearing or adjusting your search filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {athletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/athletes/${athlete.id}`}
                className="animate-fade-in"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{ height: '220px', backgroundColor: 'var(--bg-subtle)', position: 'relative' }}>
                  {athlete.photo_url ? (
                    <img
                      src={athlete.photo_url.startsWith('http') ? athlete.photo_url : `${API_URL}${athlete.photo_url}`}
                      alt={athlete.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '3rem', fontWeight: 800 }}>
                      {athlete.name?.charAt(0) || 'A'}
                    </div>
                  )}
                  {athlete.sport_type && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {athlete.sport_type}
                    </span>
                  )}
                </div>

                <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {athlete.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <span>📍 {athlete.city}</span>
                    {athlete.instagram_handle && (
                      <>
                        <span style={{ color: 'var(--border-subtle)' }}>|</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                          📸 {athlete.instagram_handle.startsWith('@') ? athlete.instagram_handle : `@${athlete.instagram_handle}`}
                        </span>
                      </>
                    )}
                  </div>

                  {athlete.upcoming_event && (
                    <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Target Event
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {athlete.upcoming_event}
                      </div>
                      {athlete.event_date && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          🗓 {new Date(athlete.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Placements Available
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {athlete.available_body_parts && athlete.available_body_parts.length > 0 ? (
                        athlete.available_body_parts.slice(0, 3).map((bp, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.8rem',
                              backgroundColor: 'var(--success-light)',
                              color: 'var(--success-hover)',
                              padding: '0.25rem 0.6rem',
                              borderRadius: 'var(--radius-full)',
                              fontWeight: 600,
                              border: '1px solid var(--success-border)'
                            }}
                          >
                            {bp.part}: ${bp.price}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None listed</span>
                      )}
                      {(athlete.available_body_parts?.length || 0) > 3 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0.25rem 0.4rem' }}>
                          +{athlete.available_body_parts.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
