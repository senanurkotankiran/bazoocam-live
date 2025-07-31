import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { authOptions } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

// Prevent indexing of admin pages
export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin-login');
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <AdminNavigation />
          <main className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
} 