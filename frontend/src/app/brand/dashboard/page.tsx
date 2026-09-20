'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BrandDashboardPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  return (
    <main style={{ maxWidth: '640px', margin: '4rem auto', padding: '2rem', border: '1px solid #eaeaea', borderRadius: '8px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Brand Dashboard</h1>
      <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '2rem' }}>
        Welcome — the athlete directory is coming soon.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          href="/brand/profile"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          Edit Brand Profile
        </Link>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
