import ThemeInit from '../lib/theme-init';
import './globals.css';

export const metadata = {
  title: 'GUARDS Dashboard',
  description: 'Guard distraction monitoring dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
