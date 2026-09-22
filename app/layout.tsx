import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Jan-Setu — AI Welfare Discovery & Application Readiness',
  description: 'Bridging citizens to the government welfare benefits they are entitled to using deterministic rule matching, document vault readiness, and AI explanations.',
  keywords: ['welfare schemes', 'government benefits', 'Jan-Setu', 'PM-KISAN', 'Aasara', 'Telangana schemes', 'eligibility engine'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 flex flex-col min-h-screen antialiased selection:bg-blue-100 selection:text-blue-900">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
