import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

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
        <AuthProvider>
          <LanguageProvider>
            <AppShell>
              {children}
            </AppShell>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

