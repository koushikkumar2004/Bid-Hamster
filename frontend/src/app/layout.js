import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import './globals.css';

export const metadata = {
  title: 'Bid Hamster — Real-Time Auction Platform',
  description: 'Premium real-time auction platform. Bid, win, and sell with confidence.',
  keywords: 'auction, bidding, real-time, online auction, Bid Hamster',
  openGraph: {
    title: 'Bid Hamster — Real-Time Auction Platform',
    description: 'Premium real-time auction platform',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg font-inter antialiased">
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#111827',
                  color: '#E2E8F0',
                  border: '1px solid #1E3A5F',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#10B981', secondary: '#111827' } },
                error: { iconTheme: { primary: '#EF4444', secondary: '#111827' } },
                duration: 4000,
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
