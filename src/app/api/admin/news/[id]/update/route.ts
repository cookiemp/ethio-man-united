import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { headline, content, thumbnailUrl, author } = body;
    
    console.log('Received thumbnailUrl:', thumbnailUrl);

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
    
    console.log('Firebase Auth User ID:', firebaseUser.uid);
    console.log('Updating article ID:', id);

    // Update news article document
    const articleRef = doc(firestore, 'news_articles', id);
    const updateData: any = {
      headline: headline.trim(),
      content: content.trim(),
      author: author || 'Admin',
      authorId: firebaseUser.uid, // Update authorId to match current auth user
      updatedAt: serverTimestamp(),
    };
    
    // Only update thumbnailUrl if one is provided (don't overwrite with empty string)
    if (thumbnailUrl) {
      updateData.thumbnailUrl = thumbnailUrl;
    }
    
    console.log('Updating article with data:', updateData);
    
    await updateDoc(articleRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'News article updated successfully',
    });
  } catch (error) {
    console.error('Error updating news article:', error);
    return NextResponse.json(
      { error: 'Failed to update news article' },
      { status: 500 }
    );
  }
}
