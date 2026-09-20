import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Athlete Advertising Marketplace
      </h1>
      <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#666', marginBottom: '2rem' }}>
        A platform for athletes to offer body parts as advertising space and for brands to discover them.
        <br />
        <strong>Lean v1 (Currently in Development)</strong>
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          href="/athletes"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          Browse Athletes
        </Link>
        <Link
          href="/login"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          Login
        </Link>
        <Link
          href="/athlete/profile"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#eaeaea',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          Athlete Profile
        </Link>
        <Link
          href="/brand/profile"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#eaeaea',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          Brand Profile
        </Link>
        <Link
          href="/admin"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#374151',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          Admin Portal
        </Link>
      </div>
    </main>
  );
}
