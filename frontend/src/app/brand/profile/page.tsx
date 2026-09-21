'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BrandProfilePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [category, setCategory] = useState('');
  const [contactName, setContactName] = useState('');
  const [lookingFor, setLookingFor] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/brand-profile/me`, {
          credentials: 'include',
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.status === 403) {
          setError('Access restricted to brand accounts only.');
          setLoading(false);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          const p = data.profile;
          if (p) {
            setCompanyName(p.company_name || '');
            setWebsiteUrl(p.website_url || '');
            setCategory(p.category || '');
            setContactName(p.contact_name || '');
            setLookingFor(p.looking_for || '');
          }
        }
      } catch (err: any) {
        setError('Failed to fetch brand profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [API_URL, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!companyName.trim() || !category.trim() || !contactName.trim()) {
      setError('Please fill out all required fields (Company Name, Category, Contact Name).');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        company_name: companyName.trim(),
        website_url: websiteUrl.trim() || null,
        category: category.trim(),
        contact_name: contactName.trim(),
        looking_for: lookingFor.trim() || null,
      };

      const res = await fetch(`${API_URL}/brand-profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update brand profile.');
      }

      setSuccess('Brand profile saved successfully! You are ready to contact athletes.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading brand profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Header */}
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

      <main style={{ maxWidth: '720px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        <div className="animate-fade-in" style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Brand Profile Setup
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Complete your company information to unlock direct messaging and sponsorship inquiries with athletes.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Company Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Company / Brand Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                placeholder="e.g. Apex Nutrition"
              />
            </div>

            {/* Website URL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Website URL (Optional)
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                placeholder="e.g. https://apexnutrition.com"
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Industry / Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                placeholder="e.g. Sports Nutrition, Apparel, Recovery Gear, Fitness Tech"
              />
            </div>

            {/* Contact Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Primary Contact Person *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}
                placeholder="e.g. Jordan Smith (Head of Sports Marketing)"
              />
            </div>

            {/* Looking For */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Sponsorship Objectives & Target Placements (Optional)
              </label>
              <textarea
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.95rem', lineHeight: 1.5, resize: 'vertical' }}
                placeholder="e.g. Seeking marathon and Hyrox athletes for arm and shoulder logo placements during 2026 championship events."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '0.5rem',
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
              {submitting ? 'Saving Profile...' : 'Save Brand Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
