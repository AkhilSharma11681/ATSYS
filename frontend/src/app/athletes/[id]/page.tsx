'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
  created_at?: string;
}

interface User {
  id: string;
  email: string;
  role: 'athlete' | 'brand';
}

export default function AthleteDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Auth & Brand Profile State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [brandProfileComplete, setBrandProfileComplete] = useState(false);

  // Contact Form State
  const [message, setMessage] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');

  // Fetch Athlete Profile
  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/athletes/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          throw new Error('Athlete profile not found or is incomplete/unverified.');
        }
        if (!res.ok) {
          throw new Error('Failed to load athlete profile.');
        }
        return res.json();
      })
      .then((data) => {
        setAthlete(data.athlete);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error fetching profile.');
        setLoading(false);
      });
  }, [API_URL, id]);

  // Check Current Auth and Brand Profile Completion
  useEffect(() => {
    async function checkAuthAndBrandStatus() {
      try {
        const authRes = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          const user = authData.user;
          setCurrentUser(user);

          if (user?.role === 'brand') {
            const brandRes = await fetch(`${API_URL}/brand-profile/me`, {
              credentials: 'include',
            });

            if (brandRes.ok) {
              const brandData = await brandRes.json();
              const p = brandData.profile;
              if (
                p &&
                p.company_name?.trim() &&
                p.category?.trim() &&
                p.contact_name?.trim()
              ) {
                setBrandProfileComplete(true);
              } else {
                setBrandProfileComplete(false);
              }
            } else {
              setBrandProfileComplete(false);
            }
          }
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    }

    checkAuthAndBrandStatus();
  }, [API_URL]);

  // Handle Contact Form Submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');

    if (!message.trim()) {
      setContactError('Please write a message before sending.');
      return;
    }

    setSubmittingContact(true);

    try {
      const res = await fetch(`${API_URL}/contact-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          athlete_id: id,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'INCOMPLETE_BRAND_PROFILE') {
          setBrandProfileComplete(false);
        }
        throw new Error(data.error || 'Failed to send contact request.');
      }

      setContactSuccess('Your message has been sent successfully!');
      setMessage('');
    } catch (err: any) {
      setContactError(err.message || 'Something went wrong.');
    } finally {
      setSubmittingContact(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading athlete profile details...</p>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div style={{ maxWidth: '640px', margin: '6rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--danger-border)' }}>
          {error || 'Athlete not found.'}
        </div>
        <Link
          href="/athletes"
          style={{
            display: 'inline-block',
            padding: '0.625rem 1.25rem',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          ← Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Top Header Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <Link href="/athletes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
          <span>←</span> Back to Directory
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '1rem'
          }}>
            A
          </div>
          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ATSYS
          </span>
        </Link>
      </header>

      <main style={{ maxWidth: '800px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        <div className="animate-fade-in" style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Top Hero / Banner */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '3rem 2rem 2.5rem',
            background: 'radial-gradient(circle at top, var(--primary-light) 0%, var(--bg-card) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-subtle)',
              marginBottom: '1.25rem',
              border: '4px solid var(--bg-card)',
              boxShadow: 'var(--shadow-md)'
            }}>
              {athlete.photo_url ? (
                <img
                  src={athlete.photo_url.startsWith('http') ? athlete.photo_url : `${API_URL}${athlete.photo_url}`}
                  alt={athlete.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', color: 'var(--text-light)', fontWeight: 800 }}>
                  {athlete.name?.charAt(0) || 'A'}
                </div>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {athlete.name}
            </h1>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
              <span style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-full)',
              }}>
                {athlete.sport_type}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                📍 {athlete.city}
              </span>
            </div>

            {athlete.instagram_handle && (
              <a
                href={`https://instagram.com/${athlete.instagram_handle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.9rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--accent)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                📸 {athlete.instagram_handle.startsWith('@') ? athlete.instagram_handle : `@${athlete.instagram_handle}`}
              </a>
            )}
          </div>

          {/* Content Body */}
          <div style={{ padding: '2.5rem' }}>
            {/* Target Event */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Upcoming Target Event
              </h2>
              <div style={{
                backgroundColor: 'var(--primary-light)',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-border)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Confirmed Competition
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {athlete.upcoming_event}
                </div>
                {athlete.event_date && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    🗓️ {new Date(athlete.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
              </div>
            </div>

            {/* Body Part Spaces and Pricing */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Available Ad Placements & Rates
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {athlete.available_body_parts && athlete.available_body_parts.map((bp, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-card)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      Placement Space
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {bp.part}
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>
                      ${bp.price} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ event</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Contact this Athlete
              </h2>

              {authChecking ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Checking authorization...</p>
              ) : !currentUser ? (
                /* Logged-out visitor */
                <div style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '1rem' }}>
                    Interested in sponsoring or advertising with <strong>{athlete.name}</strong>?
                  </p>
                  <Link
                    href="/login"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    Sign in as a brand to contact this athlete
                  </Link>
                </div>
              ) : currentUser.role === 'athlete' ? (
                /* Logged-in athlete */
                null
              ) : !brandProfileComplete ? (
                /* Logged-in brand with incomplete profile */
                <div style={{
                  backgroundColor: 'var(--warning-light)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem'
                }}>
                  <p style={{ color: '#92400e', margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600 }}>
                    ⚠️ Please complete your brand profile before contacting athletes.
                  </p>
                  <Link
                    href="/brand/profile"
                    style={{
                      display: 'inline-block',
                      padding: '0.625rem 1.25rem',
                      backgroundColor: 'var(--warning)',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    Complete Brand Profile →
                  </Link>
                </div>
              ) : (
                /* Logged-in brand with complete profile */
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                    Send an introductory proposal to {athlete.name}. They will receive your brand details and campaign request.
                  </p>

                  {contactError && (
                    <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.9rem', border: '1px solid var(--danger-border)' }}>
                      ⚠️ {contactError}
                    </div>
                  )}

                  {contactSuccess && (
                    <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--success-light)', color: 'var(--success-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.9rem', border: '1px solid var(--success-border)', fontWeight: 600 }}>
                      ✓ {contactSuccess}
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Introduce your brand and describe which placement space or event you're interested in sponsoring...`}
                        style={{
                          width: '100%',
                          padding: '0.875rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                          resize: 'vertical',
                        }}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingContact}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: submittingContact ? 'var(--primary-hover)' : 'var(--primary)',
                        color: '#ffffff',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: submittingContact ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {submittingContact ? 'Sending Message...' : 'Send Contact Request'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
