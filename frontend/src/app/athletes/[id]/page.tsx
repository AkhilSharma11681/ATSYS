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
      <div style={{ maxWidth: '720px', margin: '4rem auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#6b7280' }}>Loading athlete profile details...</p>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div style={{ maxWidth: '720px', margin: '4rem auto', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '1.5rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error || 'Athlete not found.'}
        </div>
        <Link
          href="/athletes"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto', padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/athletes"
          style={{
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          ← Back to Directory
        </Link>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {/* Top Hero / Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e5e7eb', marginBottom: '1rem', border: '3px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {athlete.photo_url ? (
              <img
                src={athlete.photo_url.startsWith('http') ? athlete.photo_url : `${API_URL}${athlete.photo_url}`}
                alt={athlete.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#9ca3af', fontWeight: 'bold' }}>
                {athlete.name?.charAt(0) || 'A'}
              </div>
            )}
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 0.25rem 0', color: '#111827' }}>
            {athlete.name}
          </h1>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#4b5563', fontSize: '0.95rem' }}>
            <span>📍 {athlete.city}</span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: '#2563eb' }}>{athlete.sport_type}</span>
          </div>

          {athlete.instagram_handle && (
            <div style={{ marginTop: '0.5rem' }}>
              <a
                href={`https://instagram.com/${athlete.instagram_handle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#db2777', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
              >
                📸 {athlete.instagram_handle.startsWith('@') ? athlete.instagram_handle : `@${athlete.instagram_handle}`}
              </a>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          {/* Event Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>
              Upcoming Target Event
            </h2>
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                {athlete.upcoming_event}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                🗓️ Date: {new Date(athlete.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Body Part Spaces and Pricing */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>
              Available Ad Placements & Rates
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {athlete.available_body_parts && athlete.available_body_parts.map((bp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Placement Space
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                    {bp.part}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a' }}>
                    ${bp.price} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#6b7280' }}>/ event</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
              Contact this Athlete
            </h2>

            {authChecking ? (
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Checking authorization...</p>
            ) : !currentUser ? (
              /* Logged-out visitor */
              <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#4b5563', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  Interested in sponsoring or advertising with {athlete.name}?
                </p>
                <Link
                  href="/login"
                  style={{
                    display: 'inline-block',
                    padding: '0.625rem 1.25rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
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
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '1.5rem' }}>
                <p style={{ color: '#b45309', margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 500 }}>
                  Please complete your brand profile before contacting athletes.
                </p>
                <Link
                  href="/brand/profile"
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Complete Brand Profile →
                </Link>
              </div>
            ) : (
              /* Logged-in brand with complete profile */
              <div>
                <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Send an introductory message or proposal to {athlete.name}. They will receive your brand contact details.
                </p>

                {contactError && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {contactError}
                  </div>
                )}

                {contactSuccess && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {contactSuccess}
                  </div>
                )}

                <form onSubmit={handleContactSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Introduce your brand and describe which placement space or event you're interested in sponsoring...`}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingContact}
                    style={{
                      padding: '0.625rem 1.25rem',
                      backgroundColor: submittingContact ? '#93c5fd' : '#2563eb',
                      color: '#ffffff',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: submittingContact ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
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
    </div>
  );
}
