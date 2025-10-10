import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { headline, content, thumbnailUrl, author } = body;

    // Validate required fields
    if (!headline || !content) {
      return NextResponse.json(
        { error: 'Headline and content are required' },
        { status: 400 }
      );
    }

    // Initialize Firebase (server-side)
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    
    // Sign in anonymously to get Firebase Auth credentials
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;

    // Create news article document
    const newsRef = collection(firestore, 'news_articles');
    const docRef = await addDoc(newsRef, {
      headline: headline.trim(),
      content: content.trim(),
      thumbnailUrl: thumbnailUrl || '',
      author: author || 'Admin',
      authorId: firebaseUser.uid, // Use actual Firebase Auth UID
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'News article created successfully',
    });
  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json(
      { error: 'Failed to create news article' },
      { status: 500 }
    );
  }
}
