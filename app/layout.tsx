import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Rabbit-Child Portrait Generator</title>
        <meta name="description" content="Generate an ultra-realistic cinematic rabbit-child hybrid portrait." />
      </head>
      <body>
        <div className="container">
          <header className="header">
            <h1>Rabbit?Child Portrait Generator</h1>
            <p className="subtitle">Ultra?realistic cinematic 9:16 portrait</p>
          </header>
          {children}
          <footer className="footer">Built for Vercel deployment</footer>
        </div>
      </body>
    </html>
  );
}
