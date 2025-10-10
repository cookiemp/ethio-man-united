import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { isAuthenticated } from '@/lib/auth';

// Initialize Firebase for server-side
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Delete all replies first
    const repliesRef = collection(db, 'forum_posts', id, 'replies');
    const repliesSnap = await getDocs(repliesRef);
    
    const deletePromises = repliesSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the forum post
    const postRef = doc(db, 'forum_posts', id);
    await deleteDoc(postRef);

    return NextResponse.json(
      { message: 'Forum post and all replies deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting forum post:', error);
    return NextResponse.json(
      { error: 'Failed to delete forum post' },
      { status: 500 }
    );
  }
}
