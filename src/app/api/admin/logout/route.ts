import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';

export async function POST() {
  try {
    await clearAdminSession();
    
    return NextResponse.json({ 
      success: true,
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}

