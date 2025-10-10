import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, author } = body;

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
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

    // Create forum post document
    const forumPostsRef = collection(firestore, 'forum_posts');
    const docRef = await addDoc(forumPostsRef, {
      title: title.trim(),
      content: content.trim(),
      category,
      author: author || 'Anonymous User',
      authorId: firebaseUser.uid,
      isApproved: true, // Auto-approve for now
      isPinned: false,
      viewCount: 0,
      replyCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Forum post created successfully',
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    return NextResponse.json(
      { error: 'Failed to create forum post' },
      { status: 500 }
    );
  }
}
