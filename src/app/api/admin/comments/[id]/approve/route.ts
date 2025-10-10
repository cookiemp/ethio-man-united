import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated as admin
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Get the comment reference from request body
    const body = await request.json();
    const { parentType, parentId } = body; // 'news_articles' or 'forum_posts'
    
    if (!parentType || !parentId) {
      return NextResponse.json(
        { error: 'Parent type and ID are required' },
        { status: 400 }
      );
    }

    // Initialize Firebase (server-side)
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    
    // Sign in anonymously to get Firebase Auth credentials
    await signInAnonymously(auth);
    
    // Build the document path
    const docPath = `${parentType}/${parentId}/comments/${id}`;
    const commentRef = doc(firestore, docPath);
    
    // Update the comment
    await updateDoc(commentRef, {
      isApproved: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Comment approved successfully',
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    return NextResponse.json(
      { error: 'Failed to approve comment' },
      { status: 500 }
    );
  }
}
