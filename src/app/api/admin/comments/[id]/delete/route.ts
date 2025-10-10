import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

export async function DELETE(
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
    
    // Get the comment path from query parameters
    const url = new URL(request.url);
    const parentType = url.searchParams.get('parentType'); // 'news_articles' or 'forum_posts'
    const parentId = url.searchParams.get('parentId');
    
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
    
    // Delete the comment
    await deleteDoc(commentRef);

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
