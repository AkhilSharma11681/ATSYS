import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Athlete Advertising Marketplace',
  description: 'Connect athletes with brands for event sponsorships and ad space',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
