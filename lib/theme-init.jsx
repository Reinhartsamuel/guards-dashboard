'use client';
import { useEffect, useState } from 'react';

export default function ThemeInit() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('guards-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = stored ? stored === 'dark' : prefersDark;
    if (shouldDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);
  if (!mounted) return null;
  return null;
}
