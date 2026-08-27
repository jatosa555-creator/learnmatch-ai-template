import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'รู้จักคน จำให้ได้ — The Invisible STEM Role Models',
  description: 'เกมจำคู่และคลังความรู้เรื่องบุคคลสำคัญในโลก STEM สำหรับเด็กและครู',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
