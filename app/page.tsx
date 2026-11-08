import { redirect } from 'next/navigation';
import { getSessionToken } from '@/lib/auth';

export default async function Home() {
  const token = getSessionToken();
  if (!token) redirect('/login');
  redirect('/dashboard');
}
