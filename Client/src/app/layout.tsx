import React from 'react';
import './globals.css';
import Background from './components/Background';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Invest It</title>
        <meta name="description" content="Your investment social network" />
      </head>
      <body>
        <Background>
          {children}
        </Background>
      </body>
    </html>
  );
} 