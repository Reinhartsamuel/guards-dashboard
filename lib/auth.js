import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function getClientSessionToken() {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|; )\s*token=([^;]*)/);
  return match ? match[1] : undefined;
}
