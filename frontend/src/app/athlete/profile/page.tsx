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

      setSuccess('Profile saved successfully! Your athlete details and consent have been recorded.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '2rem', border: '1px solid #eaeaea', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Athlete Profile Setup</h1>
        <Link href="/athletes" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Directory
        </Link>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '4px', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Name */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. Alex Hunter"
          />
        </div>

        {/* City */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>City *</label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. London, UK"
          />
        </div>

        {/* Sport Type */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Sport / Discipline *</label>
          <input
            type="text"
            required
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. Hyrox, Marathon, CrossFit, Triathlon"
          />
        </div>

        {/* Upcoming Event */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Upcoming Event Name *</label>
          <input
            type="text"
            required
            value={upcomingEvent}
            onChange={(e) => setUpcomingEvent(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. Hyrox London 2026"
          />
        </div>

        {/* Event Date */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Event Date *</label>
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Instagram Handle */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Instagram Handle (Optional)</label>
          <input
            type="text"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. @alex_athlete"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Profile Photo</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handlePhotoUpload}
            style={{ marginBottom: '0.5rem' }}
          />
          {photoUrl && (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>Current Photo:</p>
              <img
                src={`${API_URL}${photoUrl}`}
                alt="Profile Preview"
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc', marginTop: '0.25rem' }}
              />
            </div>
          )}
        </div>

        {/* Available Body Parts */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Available Body Parts & Pricing (USD) *</label>
          {bodyParts.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="e.g. Left Arm, Back, Chest"
                value={item.part}
                onChange={(e) => handleBodyPartChange(index, 'part', e.target.value)}
                style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                required
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={item.price}
                onChange={(e) => handleBodyPartChange(index, 'price', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                required
              />
              <button
                type="button"
                onClick={() => removeBodyPartRow(index)}
                style={{ padding: '0.5rem 0.75rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBodyPartRow}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.25rem' }}
          >
            + Add Body Part
          </button>
        </div>

        {/* Consent Checkbox */}
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="consent"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            required
            style={{ marginTop: '0.25rem' }}
          />
          <label htmlFor="consent" style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
            <strong>Required:</strong> I agree my profile and photo will be public, and I understand the platform's safety terms.
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.75rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          {submitting ? 'Saving Profile...' : 'Save Athlete Profile'}
        </button>
      </form>
    </div>
  );
}
