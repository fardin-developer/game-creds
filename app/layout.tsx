import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import ReduxProvider from './components/ReduxProvider';
import MaintenanceChecker from './components/MaintenanceChecker';
import NavigationWrapper from './components/NavigationWrapper';
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Game Creds | Game Recharge Platform",
  description: "Your one-stop destination for game top-ups and recharges. Fast, secure, and reliable platform for gaming greatness.",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <MaintenanceChecker>
            {children}
            <NavigationWrapper />
          </MaintenanceChecker>
        </ReduxProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              border: '1px solid #7F8CAA',
            },
            success: {
              style: {
                background: '#232426',
                border: '1px solid #4CAF50',
              },
            },
            error: {
              style: {
                background: '#232426',
                border: '1px solid #EF4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
