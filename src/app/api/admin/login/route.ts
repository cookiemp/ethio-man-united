import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, setAdminSession } from '@/lib/auth';
import { adminLoginLimiter, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);
    
    // Check rate limit
    const rateLimitResult = adminLoginLimiter.check(clientIp);
    
    if (rateLimitResult.isLimited) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitResult.resetAt?.toISOString()
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetAt!.getTime() - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      // Add a small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Set session cookie
    await setAdminSession();
    
    // Reset rate limit on successful login
    adminLoginLimiter.reset(clientIp);

    return NextResponse.json({ 
      success: true,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

