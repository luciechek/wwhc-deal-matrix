import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deal Evaluation Matrix',
  description: 'White Wolf Capital Deal Scoring Tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
