import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tika',
  description: '티켓 기반 칸반 보드 TODO 앱',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
