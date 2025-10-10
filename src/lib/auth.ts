import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

// Get the secret key as a Uint8Array
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

// Create a JWT token
async function createToken(payload: { isAdmin: boolean }): Promise<string> {
  const secret = getSecretKey();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);
  
  return token;
}

// Verify a JWT token
async function verifyToken(token: string): Promise<{ isAdmin: boolean } | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload as { isAdmin: boolean };
  } catch (error) {
    return null;
  }
}

// Set the admin session cookie
export async function setAdminSession(): Promise<void> {
  const token = await createToken({ isAdmin: true });
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

// Get the admin session from cookie
export async function getAdminSession(): Promise<{ isAdmin: boolean } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token.value);
}

// Clear the admin session cookie
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Verify admin credentials
export function verifyAdminCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables');
    return false;
  }
  
  return username === adminUsername && password === adminPassword;
}

// Check if user is authenticated (for use in Server Components)
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null && session.isAdmin === true;
}

