import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@turnkey/react-wallet-kit/styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PushLend - P2P Lending Platform',
  description: 'Decentralized peer-to-peer lending on Push Network',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
