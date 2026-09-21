'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BodyPart {
  part: string;
  price: number | string;
}

export default function AthleteProfilePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [sportType, setSportType] = useState('');
  const [upcomingEvent, setUpcomingEvent] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([
    { part: '', price: '' }
  ]);

  // Load existing profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/athlete-profile/me`, {
          credentials: 'include',
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.status === 403) {
          setError('Access restricted to athlete accounts only.');
          setLoading(false);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          const p = data.profile;
          if (p) {
            setName(p.name || '');
            setCity(p.city || '');
            setSportType(p.sport_type || '');
            setUpcomingEvent(p.upcoming_event || '');
            setEventDate(p.event_date ? p.event_date.split('T')[0] : '');
            setInstagramHandle(p.instagram_handle || '');
            setPhotoUrl(p.photo_url || '');
            setConsentGiven(Boolean(p.consent_given));
            if (Array.isArray(p.available_body_parts) && p.available_body_parts.length > 0) {
              setBodyParts(p.available_body_parts);
            }
          }
        }
      } catch (err: any) {
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [API_URL, router]);

  // Body parts helpers
  const handleBodyPartChange = (index: number, field: 'part' | 'price', value: string) => {
    const updated = [...bodyParts];
    updated[index] = { ...updated[index], [field]: value };
    setBodyParts(updated);
  };

  const addBodyPartRow = () => {
    setBodyParts([...bodyParts, { part: '', price: '' }]);
  };

  const removeBodyPartRow = (index: number) => {
    if (bodyParts.length === 1) {
      setBodyParts([{ part: '', price: '' }]);
      return;
    }
    setBodyParts(bodyParts.filter((_, i) => i !== index));
  };

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setError('');
      const res = await fetch(`${API_URL}/athlete-profile/photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo.');
      }

      setPhotoUrl(data.photo_url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!consentGiven) {
      setError('You must agree to the public profile & safety consent terms.');
      return;
    }

    // Filter out empty rows
    const validBodyParts = bodyParts
      .filter((bp) => bp.part.trim() !== '')
      .map((bp) => ({
        part: bp.part.trim(),
        price: Number(bp.price) || 0,
      }));

    if (validBodyParts.length === 0) {
      setError('Please add at least one available body part and price.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        city: city.trim(),
        sport_type: sportType.trim(),
        upcoming_event: upcomingEvent.trim(),
        event_date: eventDate,
        instagram_handle: instagramHandle.trim() || null,
        available_body_parts: validBodyParts,
        photo_url: photoUrl || null,
        consent_given: consentGiven,
      };

      const res = await fetch(`${API_URL}/athlete-profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setSuccess('Profile saved successfully! Your athlete details and placement rates are live.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading athlete profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
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
          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ATSYS
          </span>
        </Link>
        <Link href="/athletes" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          Browse Directory →
        </Link>
      </header>

      <main style={{ maxWidth: '760px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        <div className="animate-fade-in" style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Athlete Profile Setup
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Configure your competition details and available ad inventory to start receiving brand sponsorship inquiries.
            </p>
          </div>

          {error && (
            <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--danger-border)', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--success-light)', color: 'var(--success-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--success-border)', fontSize: '0.9rem', fontWeight: 600 }}>
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. Basic Info */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                1. Basic Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                    placeholder="e.g. Alex Hunter"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                    placeholder="e.g. London, UK"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Sport / Discipline *
                  </label>
                  <input
                    type="text"
                    required
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                    placeholder="e.g. Hyrox, Marathon, CrossFit, Triathlon"
                  />
                </div>
              </div>
            </div>

            {/* 2. Target Event */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                2. Target Event
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Upcoming Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={upcomingEvent}
                    onChange={(e) => setUpcomingEvent(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                    placeholder="e.g. Hyrox London 2026"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Media & Social */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                3. Media & Social
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Instagram Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                    placeholder="e.g. @alex_athlete"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Profile Photo (Cloudinary)
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handlePhotoUpload}
                    style={{ fontSize: '0.9rem' }}
                  />
                  {photoUrl && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={photoUrl.startsWith('http') ? photoUrl : `${API_URL}${photoUrl}`}
                        alt="Profile Preview"
                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-subtle)' }}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--success-hover)', fontWeight: 600 }}>
                        ✓ Photo uploaded and ready
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Placement Spaces & Pricing */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                4. Available Placement Spaces & Rates (USD) *
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bodyParts.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="e.g. Left Arm, Back, Chest, Shoulders"
                      value={item.part}
                      onChange={(e) => handleBodyPartChange(index, 'part', e.target.value)}
                      style={{ flex: 2, padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price ($)"
                      value={item.price}
                      onChange={(e) => handleBodyPartChange(index, 'price', e.target.value)}
                      style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeBodyPartRow(index)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--danger-light)',
                        color: 'var(--danger)',
                        border: '1px solid var(--danger-border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addBodyPartRow}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    alignSelf: 'flex-start',
                    marginTop: '0.25rem'
                  }}
                >
                  + Add Placement Space
                </button>
              </div>
            </div>

            {/* 5. Consent & Safety */}
            <div style={{
              backgroundColor: 'var(--primary-light)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                required
                style={{ marginTop: '0.25rem', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="consent" style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <strong>Public Directory & Safety Terms:</strong> I consent to making my profile, competition details, and photo publicly visible to brand advertisers on the marketplace.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.875rem 1.5rem',
                backgroundColor: submitting ? 'var(--primary-hover)' : 'var(--primary)',
                color: '#ffffff',
                fontWeight: 700,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {submitting ? 'Saving Profile...' : 'Save Athlete Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
