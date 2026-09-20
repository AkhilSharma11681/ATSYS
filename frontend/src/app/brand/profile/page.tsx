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

      setSuccess('Brand profile saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <p>Loading brand profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '2rem', border: '1px solid #eaeaea', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Brand Profile Setup</h1>
        <Link href="/brand/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Dashboard
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
        {/* Company Name */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Company / Brand Name *</label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. Apex Nutrition"
          />
        </div>

        {/* Website URL */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Website URL (Optional)</label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. https://apexnutrition.com"
          />
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Industry / Category *</label>
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. Sports Nutrition, Apparel, Fitness Tech, Recovery"
          />
        </div>

        {/* Contact Name */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Primary Contact Person *</label>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. Jordan Smith (Head of Marketing)"
          />
        </div>

        {/* Looking For */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>What are you looking for? (Optional)</label>
          <textarea
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
            placeholder="e.g. Looking for Hyrox athletes in the UK/EU for arm and shoulder logo placements during upcoming 2026 events."
          />
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
            marginTop: '0.5rem',
          }}
        >
          {submitting ? 'Saving Profile...' : 'Save Brand Profile'}
        </button>
      </form>
    </div>
  );
}
