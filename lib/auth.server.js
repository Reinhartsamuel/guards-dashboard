import { cookies } from 'next/headers';

export function getSessionToken() {
  return cookies().get('token')?.value;
}
