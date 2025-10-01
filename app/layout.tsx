import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EmpEdge - Employee Management',
  description: 'Modern employee management dashboard for your organization',
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