# Simplified Admin Authentication Plan

## 🔐 Admin-Only Authentication Strategy

### Overview
For a fan site, we don't need complex user auth. Instead:
- **Public users**: Can view everything (no login needed)
- **Admins only**: Single password-protected access to admin panel

---

## 🎯 Implementation Plan

### Option A: Environment Variable Auth (Simplest)

#### 1. Add Admin Credentials to Environment
```env
# .env.local
ADMIN_USERNAME=ethio_admin
ADMIN_PASSWORD=your_secure_password_here
NEXT_PUBLIC_SITE_NAME=Ethio Man United
```

#### 2. Create Admin Middleware
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !isValidAuth(authHeader)) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }
  }
  
  return NextResponse.next();
}

function isValidAuth(authHeader: string): boolean {
  const [username, password] = Buffer.from(
    authHeader.split(' ')[1], 
    'base64'
  ).toString().split(':');
  
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

export const config = {
  matcher: '/admin/:path*',
};
```

**Pros:**
- ✅ Super simple
- ✅ No database needed
- ✅ Browser handles password storage
- ✅ Works great on Vercel

**Cons:**
- ⚠️ Only one admin credential (fine for small team)
- ⚠️ Can't change password without redeploying

---

### Option B: Session-Based Auth (More Flexible)

#### 1. Install Dependencies
```bash
npm install iron-session
```

#### 2. Create Login Page
```typescript
// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      alert('Invalid credentials');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={e => setCredentials({...credentials, username: e.target.value})}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={e => setCredentials({...credentials, password: e.target.value})}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-primary text-white rounded">
          Login
        </button>
      </form>
    </div>
  );
}
```

#### 3. Create Login API
```typescript
// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  password: process.env.SESSION_SECRET!, // 32+ char random string
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  // Check credentials against env vars
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const session = await getIronSession(cookies(), sessionOptions);
    session.isAdmin = true;
    await session.save();
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
```

#### 4. Protect Admin Routes
```typescript
// src/app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export default async function AdminLayout({ children }) {
  const session = await getIronSession(cookies(), sessionOptions);
  
  if (!session.isAdmin) {
    redirect('/admin/login');
  }
  
  return <>{children}</>;
}
```

**Pros:**
- ✅ Custom login page
- ✅ Session-based (stays logged in)
- ✅ Can add logout functionality
- ✅ Still uses env vars for credentials

**Cons:**
- ⚠️ Slightly more complex
- ⚠️ Still single credential (fine for your use case)

---

## 🗄️ Database Simplification

### Remove User Collections
Since only admins can write:

**Before:**
```
/users/{id}                    ❌ Remove
/admins/{id}                   ❌ Remove
/news_articles/{id}            ✅ Keep (admin creates)
  authorId → "admin"           ✅ Just use string "admin"
/forum_posts/{id}              ✅ Keep (public can create)
  authorId → "anonymous"       ✅ Anonymous users
  isApproved → true/false      ✅ Admin moderates
/comments/{id}                 ✅ Keep (flat structure)
  parentType → "news"|"forum"  ✅ Track parent type
  parentId → news or forum id  ✅ Track parent ID
  isApproved → true/false      ✅ Admin moderates
```

### Updated Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // News articles - public read, admin-only write
    match /news_articles/{articleId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Forum posts - public read, public create, admin approve
    match /forum_posts/{postId} {
      allow read: if true;
      allow create: if true; // Anyone can create
      allow update, delete: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Comments - public read, public create, admin approve
    match /comments/{commentId} {
      allow read: if true;
      allow create: if true; // Anyone can create (as pending)
      allow update, delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

---

## 🔄 Auto-Deletion Strategy

### Option 1: Firebase Cloud Functions (FREE)
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Run daily at midnight
exports.cleanupOldContent = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const ninetyDaysAgo = new Date(now.toDate() - 90 * 24 * 60 * 60 * 1000);
    
    // Delete old forum posts
    const oldPosts = await db.collection('forum_posts')
      .where('createdAt', '<', ninetyDaysAgo)
      .get();
    
    const batch = db.batch();
    oldPosts.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    console.log(`Deleted ${oldPosts.size} old forum posts`);
  });
```

### Option 2: Vercel Cron Job (Simpler)
```typescript
// src/app/api/cron/cleanup/route.ts
import { NextResponse } from 'next/server';
import { firestore } from '@/firebase';

export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  // Delete old forum posts
  const oldPosts = await firestore
    .collection('forum_posts')
    .where('createdAt', '<', ninetyDaysAgo)
    .get();
  
  const deletePromises = oldPosts.docs.map(doc => doc.ref.delete());
  await Promise.all(deletePromises);
  
  return NextResponse.json({ 
    success: true, 
    deleted: oldPosts.size 
  });
}
```

Then add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 0 * * *"
  }]
}
```

---

## 📊 Cost Analysis

### Keeping Firebase (Recommended)
```
Monthly Active Users: 10,000
Daily reads: 50 reads/user = 500k/month
Daily writes: 5 writes/user = 50k/month
Storage: ~500MB

Firebase Free Tier:
- 50k reads/day = 1.5M/month ✅ (you'd use 500k)
- 20k writes/day = 600k/month ✅ (you'd use 50k)
- 1GB storage ✅ (you'd use 500MB)

COST: $0/month
```

### Vercel Postgres Alternative
```
Base: $20/month
Storage: ~$5/month for 10GB
Total: $25/month minimum

COST: $25/month
```

**Verdict:** Firebase is actually FREE for your use case!

---

## ✅ Recommended Final Architecture

### Tech Stack
- **Frontend**: Next.js 15 + Vercel hosting (FREE)
- **Database**: Firebase Firestore (FREE tier)
- **Auth**: Environment variable-based admin auth (FREE)
- **Storage**: Firebase Storage for images (FREE tier)
- **Cleanup**: Vercel Cron Jobs (FREE on hobby plan)

### Why This Works
1. ✅ Completely free for a fan site
2. ✅ Scales to 100k+ monthly users
3. ✅ Real-time updates
4. ✅ Simple admin auth (no complex user management)
5. ✅ Auto-cleanup via cron jobs
6. ✅ Works perfectly with Vercel
7. ✅ Minimal maintenance

### What Changes
1. 🔄 Remove Firebase Auth UI (use simple env-based auth)
2. 🔄 Remove `/users` and `/admins` collections
3. 🔄 Simplify comment structure (flat instead of nested)
4. 🔄 Add auto-cleanup cron job
5. 🔄 Polish admin dashboard

---

## 🎯 Next Steps

1. Choose authentication approach (Option A or B)
2. Simplify database schema
3. Add auto-cleanup cron
4. Polish admin features
5. Deploy to Vercel

Would you like me to implement any of these changes?

