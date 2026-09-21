'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Nav */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '1.2rem'
          }}>
            A
          </div>
          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ATSYS
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/athletes" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }}>
            Directory
          </Link>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }}>
            Sign In
          </Link>
          <Link
            href="/login"
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'opacity 0.2s'
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <section style={{
          padding: '6rem 2rem',
          textAlign: 'center',
          background: 'radial-gradient(circle at top, var(--primary-light) 0%, var(--bg-page) 60%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '0.375rem 1rem',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--primary-border)',
            marginBottom: '1.5rem'
          }} className="animate-fade-in">
            🚀 The Live Sports Sponsorship Marketplace
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            lineHeight: 1.1,
            maxWidth: '900px',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }} className="animate-fade-in">
            Turn Race Day Performance into <span style={{ color: 'var(--primary)' }}>High-Impact</span> Branding.
          </h1>

          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.35rem)',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            marginBottom: '2.5rem'
          }} className="animate-fade-in">
            Connect directly with verified athletes competing in marathons, triathlons, and functional fitness events. Book ad space right where the cameras are looking.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }} className="animate-fade-in">
            <Link
              href="/athletes"
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '1.05rem',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              Browse Athletes
            </Link>
            <Link
              href="/login"
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '1.05rem',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              Join as Athlete / Brand
            </Link>
          </div>
        </section>

        {/* Value Proposition Cards */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>A seamless dual-sided marketplace tailored for sports sponsorships.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

            {/* Brands Card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-subtle)',
              borderTop: '4px solid var(--primary)'
            }}>
              <div style={{
                width: '48px', height: '48px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                🎯
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Brands</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  Discover verified athletes competing in upcoming races
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  Filter by sport discipline, city, and specific events
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  Book targeted placement inventory instantly (Arms, Shoulders, Chest)
                </li>
              </ul>
            </div>

            {/* Athletes Card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-subtle)',
              borderTop: '4px solid var(--warning)'
            }}>
              <div style={{
                width: '48px', height: '48px',
                backgroundColor: 'var(--warning-light)',
                color: 'var(--warning)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                🏃
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Athletes</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--warning)' }}>✓</span>
                  Monetize your race day performance and audience reach
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--warning)' }}>✓</span>
                  Set custom rates for specific body placements
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--warning)' }}>✓</span>
                  Direct contact requests straight from verified marketing teams
                </li>
              </ul>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        backgroundColor: 'var(--text-primary)',
        color: 'var(--text-light)',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{
            width: '24px', height: '24px',
            background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '0.8rem'
          }}>
            A
          </div>
          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.1rem', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>
            ATSYS
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>© 2026 Athlete Advertising Marketplace. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.875rem' }}>
          <Link href="/admin" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>Admin Portal</Link>
          <a href="#" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
