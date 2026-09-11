import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/customer/CartDrawer';
import { AuthModal } from '../components/customer/AuthModal';
import { ChatWidget } from '../components/customer/ChatWidget';

export const metadata: Metadata = {
  title: 'CrochetLoom | Handcrafted Artisanal Crochet & Knitwear',
  description:
    'Discover heirloom quality handcrafted crochet bouquets, flower clutches, daisy tote bags, cozy cardigans, and adorable amigurumi plushies made with organic cotton.',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-crochet-pattern text-stone-900 antialiased selection:bg-clay-200 selection:text-clay-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <AuthModal />
        <ChatWidget />
      </body>
    </html>
  );
}
