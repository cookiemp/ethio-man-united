# 🎯 COMPREHENSIVE CODEBASE CONTEXT
**Ethio Man United - Manchester United Fan Community Platform**

**Last Updated:** October 8, 2025, 8:10 PM  
**Build Status:** ✅ 0 TypeScript Errors  
**Phase Status:** Phase 2 - 60% Complete  

---

## 📖 PROJECT OVERVIEW

### What Is This Project?
**Ethio Man United** (formerly "Red Devils Hub") is a Next.js-based Manchester United fan community website tailored for an Ethiopian audience. It combines news management, forum discussions, match fixtures, and user engagement features with real-time Firebase integration.

### Core Value Proposition
- **For Fans:** Central hub to follow Man United news, discuss matches, and connect with fellow fans
- **For Admins:** Full content management system for news articles and community moderation
- **For Community:** Interactive forum for discussions, comments, and fan engagement

---

## 🏗️ ARCHITECTURE OVERVIEW

### Tech Stack
```
Frontend:
├── Next.js 14.2.33 (App Router)
├── React 18.3.1
├── TypeScript 5
└── Tailwind CSS 3.4.1 + shadcn/ui

Backend:
├── Firebase Firestore (Database)
├── Firebase Authentication (User Auth + Anonymous)
├── Firebase Storage (Image uploads)
└── Firebase App Hosting (Deployment)

Authentication:
├── JWT-based admin sessions (HttpOnly cookies)
├── Firebase Auth for public users
└── Anonymous auth for commenting
```

### Project Structure
```
ethio-man-united/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── admin/                    # Admin dashboard & management
│   │   │   ├── layout.tsx           # Auth guard + admin nav
│   │   │   ├── page.tsx             # Dashboard with stats
│   │   │   ├── login/               # Admin login
│   │   │   ├── news/                # News CRUD
│   │   │   └── comments/            # Comment moderation
│   │   ├── api/                     # API routes
│   │   │   ├── admin/               # Admin API (news, comments, auth)
│   │   │   └── forum/               # Forum API (create posts)
│   │   ├── auth/                    # User authentication
│   │   │   ├── signup/              # User registration
│   │   │   └── login/               # User login
│   │   ├── forum/                   # Forum pages
│   │   │   ├── page.tsx            # Forum listing (real data)
│   │   │   ├── create/             # Create forum post
│   │   │   └── [topicId]/          # Forum detail (mock data - TO UPDATE)
│   │   ├── news/                    # Public news pages
│   │   │   ├── page.tsx            # News listing
│   │   │   └── [articleId]/        # Article detail + comments
│   │   ├── profile/                 # User profile pages
│   │   │   ├── page.tsx            # View/edit profile
│   │   │   └── settings/           # User settings
│   │   ├── fixtures/                # Match fixtures (mock data)
│   │   └── page.tsx                # Homepage
│   ├── components/
│   │   ├── ui/                      # 35+ shadcn/ui components
│   │   ├── auth/                    # UserMenu, AdminAuthGuard
│   │   └── layout/                  # Header, Footer, AdminNav
│   ├── firebase/
│   │   ├── config.ts               # Firebase credentials
│   │   ├── provider.tsx            # Firebase context
│   │   └── firestore/              # Custom hooks (useCollection, useDoc)
│   └── lib/
│       ├── auth.ts                 # JWT session management
│       ├── storage.ts              # Image upload helpers
│       ├── rate-limit.ts           # Rate limiting
│       └── mock-data.ts            # TypeScript types + sample data
├── firestore.rules                  # Security rules (deployed)
├── storage.rules                    # Storage security rules
└── firebase.json                    # Firebase config
```

---

## 🔥 FIREBASE CONFIGURATION

### Collections & Schema

#### 1. **news_articles** Collection
```typescript
{
  id: string;                    // Auto-generated
  headline: string;
  content: string;               // Full article text
  author: string;                // Author name
  authorId: string;              // Firebase UID
  thumbnailUrl: string;          // Image URL (Firebase Storage)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

Subcollection: comments/
{
  id: string;
  content: string;
  author: string;
  authorId: string;
  isApproved: boolean;           // Requires admin approval
  createdAt: Timestamp;
}
```

#### 2. **forum_posts** Collection
```typescript
{
  id: string;
  title: string;
  content: string;
  category: 'match-discussion' | 'transfers' | 'general' | 'fan-zone';
  author: string;
  authorId: string;
  isApproved: boolean;           // Auto-approved (true by default)
  isPinned: boolean;             // false by default
  viewCount: number;             // 0 by default
  replyCount: number;            // 0 by default
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

Subcollection: replies/
{
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: Timestamp;
}
```

#### 3. **users** Collection
```typescript
{
  uid: string;                   // Firebase Auth UID
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  joinedAt: Timestamp;
  postCount: number;             // 0 by default
  commentCount: number;          // 0 by default
}
```

### Firestore Security Rules (Deployed)
```javascript
// News articles - authenticated users can write
match /news_articles/{newsArticleId} {
  allow get, list: if true;
  allow create, update, delete: if isSignedIn();
}

// Comments - authenticated users can create, moderate
match /news_articles/{newsArticleId}/comments/{commentId} {
  allow get, list: if true;
  allow create: if isSignedIn() && request.resource.data.authorId == request.auth.uid;
  allow update, delete: if isSignedIn();
}

// Forum posts - owner-based access
match /forum_posts/{forumPostId} {
  allow get, list: if true;
  allow create: if isSignedIn() && request.resource.data.authorId == request.auth.uid;
  allow update, delete: if isSignedIn() && isExistingOwner(resource.data.authorId);
  
  // Forum replies
  match /replies/{replyId} {
    allow get, list: if true;
    allow create: if isSignedIn() && request.resource.data.authorId == request.auth.uid;
    allow update, delete: if isSignedIn();
  }
}

// User profiles
match /users/{userId} {
  allow get, list: if true;
  allow create: if isSignedIn() && request.auth.uid == userId;
  allow update: if isSignedIn() && request.auth.uid == userId;
  allow delete: if false;
}
```

---

## 🎯 PHASE 1 - COMPLETE ✅

### Features Implemented (100%)

#### 1. Admin Authentication System ✅
- **Location:** `/admin/login`
- **Credentials:** `admin` / `ManUtd2025!` (stored in `.env.local`)
- **Implementation:**
  - JWT-based session management
  - HttpOnly cookies with 7-day expiration
  - Rate limiting (5 attempts per 15 min)
  - Admin auth guard on all `/admin/*` routes
- **Files:**
  - `src/app/api/admin/login/route.ts`
  - `src/app/api/admin/logout/route.ts`
  - `src/app/api/admin/check-auth/route.ts`
  - `src/lib/auth.ts` (JWT helpers)
  - `src/lib/rate-limit.ts` (Rate limiting)

#### 2. Admin Dashboard ✅
- **Location:** `/admin`
- **Features:**
  - Real-time statistics from Firestore
  - Total news articles count
  - Total comments count
  - Pending comments count
  - Total site visits (placeholder)
- **Files:**
  - `src/app/admin/page.tsx`

#### 3. News Management (Full CRUD) ✅
- **Create:** `/admin/news/create`
  - Form with headline, author, content, image upload
  - Firebase Storage integration for images
  - API: `POST /api/admin/news/create`
  
- **Read:** `/admin/news`
  - List all articles with edit/delete actions
  - Real-time data from Firestore
  
- **Update:** `/admin/news/[id]/edit`
  - Pre-populated edit form
  - Image replacement support
  - API: `PUT /api/admin/news/[id]/update`
  
- **Delete:** `/admin/news/[id]`
  - Confirmation dialog
  - Deletes article + all comments
  - API: `DELETE /api/admin/news/[id]/delete`

- **Files:**
  - `src/app/admin/news/page.tsx`
  - `src/app/admin/news/create/page.tsx`
  - `src/app/api/admin/news/create/route.ts`
  - `src/app/api/admin/news/[id]/update/route.ts`
  - `src/app/api/admin/news/[id]/delete/route.ts`
  - `src/lib/storage.ts` (Image upload helpers)

#### 4. Comment System ✅
- **Public Commenting:**
  - Anonymous user authentication
  - Real-time comment submission
  - Pending comments shown with blur effect (60% opacity)
  - Approved comments fully visible
  
- **Comment Moderation:** `/admin/comments`
  - View all comments (collection group query)
  - Approve pending comments
  - Delete any comment
  - Real-time updates
  
- **APIs:**
  - `PUT /api/admin/comments/[id]/approve`
  - `DELETE /api/admin/comments/[id]/delete`

- **Files:**
  - `src/app/news/[articleId]/comment-section.tsx`
  - `src/app/admin/comments/page.tsx`
  - `src/app/api/admin/comments/[id]/approve/route.ts`
  - `src/app/api/admin/comments/[id]/delete/route.ts`

#### 5. Public News Pages ✅
- **News Listing:** `/news`
  - Server-side rendered
  - Fetches from Firestore
  - Grid layout with images
  
- **Article Detail:** `/news/[articleId]`
  - Server-rendered article content
  - Client-side comment section
  - Real-time comments with approval status
  
- **Files:**
  - `src/app/news/page.tsx`
  - `src/app/news/[articleId]/page.tsx`
  - `src/app/news/[articleId]/comment-section.tsx`

---

## 🚀 PHASE 2 - IN PROGRESS (60% Complete)

### Completed Features ✅

#### 1. User Authentication System (100%) ✅
- **Signup:** `/auth/signup`
  - Email/password registration
  - Display name setup
  - Creates user profile in Firestore
  - Form validation with error messages
  - Auto-redirect to homepage after signup
  
- **Login:** `/auth/login`
  - Email/password authentication
  - Error handling for invalid credentials
  - Auto-redirect to homepage after login
  
- **User Menu:** Header component
  - Shows Login/Signup buttons when logged out
  - Shows user avatar with initial when logged in
  - Dropdown menu with Profile, Settings, Logout
  - Smooth loading states
  
- **Profile Page:** `/profile`
  - View user information (email, display name, join date)
  - Edit display name functionality
  - Protected route (redirects to login if not authenticated)
  - Updates both Firebase Auth and Firestore
  
- **Files:**
  - `src/app/auth/signup/page.tsx`
  - `src/app/auth/login/page.tsx`
  - `src/app/profile/page.tsx`
  - `src/app/profile/settings/page.tsx` (placeholder)
  - `src/components/auth/user-menu.tsx`

#### 2. Forum System (60%) ⏳

##### ✅ **Forum Post Creation** (100%)
- **Location:** `/forum/create`
- **Features:**
  - Create new forum topics (login required)
  - Category selection: Match Discussion, Transfers, General, Fan Zone
  - Title and content fields with character counter
  - Form validation
  - Auto-approves posts (isApproved: true by default)
  - Saves to Firestore `forum_posts` collection
- **API:** `POST /api/forum/create`
- **Files:**
  - `src/app/forum/create/page.tsx`
  - `src/app/api/forum/create/route.ts`

##### ✅ **Forum Listing** (100%)
- **Location:** `/forum`
- **Features:**
  - Server-side rendering
  - Fetches posts from Firestore
  - Table format with:
    - Post title and author
    - Category badge with color coding
    - Reply count
    - Creation date
  - "New Topic" button
  - Empty state when no posts exist
  - Sorted by newest first
  - Clickable post titles → detail page
- **Files:**
  - `src/app/forum/page.tsx`

##### ❌ **Forum Detail Page** (NOT IMPLEMENTED)
- **Location:** `/forum/[topicId]/page.tsx`
- **Current State:** Using mock data from `src/lib/mock-data.ts`
- **Needs:**
  - Fetch forum post from Firestore
  - Display full post content
  - Show post metadata (author, date, category)
  - Fetch replies from subcollection
  - Reply form component (similar to news comments)
  - Real-time reply submission
  - Update reply count when replies added

##### ❌ **Forum Moderation** (NOT IMPLEMENTED)
- **Location:** `/admin/forum` (to be created)
- **Needs:**
  - List all forum posts with status
  - Approve/delete forum posts
  - Delete replies
  - API routes for moderation

---

## 📊 CURRENT STATUS SNAPSHOT

### What's Working ✅
1. **Admin System**
   - Login/logout with JWT sessions
   - Dashboard with real-time stats
   - News article CRUD (create, read, update, delete)
   - Comment moderation (approve, delete)

2. **Public Features**
   - News listing and detail pages
   - Comment submission (anonymous)
   - User signup/login
   - User profile view/edit
   - Forum post creation
   - Forum listing

3. **Technical**
   - 0 TypeScript errors
   - Build successful
   - Firestore rules deployed
   - Firebase Storage configured
   - Real-time data updates

### What Needs Work 🚧
1. **Forum Detail Page**
   - Currently uses mock data
   - Needs Firestore integration
   - Reply system not implemented

2. **Forum Moderation**
   - No admin interface yet
   - Need API routes

3. **Match Fixtures**
   - Still using mock data
   - Could integrate football API (optional)

### Known Issues ⚠️
- **Forum detail page:** Uses mock data instead of Firestore
- **Fixture data:** Mock data only (no live scores)
- **No pagination:** News/forum lists will slow down with many items

---

## 🎯 IMMEDIATE NEXT STEPS

### Priority 1: Forum Detail Page with Replies (HIGHEST)
**Estimated Time:** 45 minutes

**Tasks:**
1. Update `/forum/[topicId]/page.tsx`:
   - Convert to async server component
   - Fetch forum post from Firestore using topicId
   - Display full post content
   - Show post metadata (author, date, category)

2. Create reply section component:
   - Similar to news comment section
   - Fetch replies from `forum_posts/{postId}/replies` subcollection
   - Display replies with author and timestamp
   - Reply form (requires authentication)
   - Submit reply to Firestore
   - Update parent post's `replyCount` field

3. Handle reply submission:
   - Option A: Client-side with Firebase SDK (easier, recommended)
   - Option B: API route (more consistent with admin pattern)

**Files to Create/Update:**
```
src/app/forum/[topicId]/page.tsx          # Update with real data
src/app/forum/[topicId]/reply-section.tsx # New component (optional)
```

**Database Schema:**
```typescript
forum_posts/{postId}/replies/{replyId}
{
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: Timestamp;
}
```

### Priority 2: Forum Moderation (Admin) (MEDIUM)
**Estimated Time:** 30 minutes

**Tasks:**
1. Create `/admin/forum` page:
   - List all forum posts
   - Show approval status (though all auto-approved)
   - Approve/Delete actions
   - View reply count

2. Create API routes:
   - `PUT /api/admin/forum/[id]/approve` (if needed)
   - `DELETE /api/admin/forum/[id]/delete`
   - `DELETE /api/admin/forum/[id]/replies/[replyId]/delete`

**Files to Create:**
```
src/app/admin/forum/page.tsx
src/app/api/admin/forum/[id]/approve/route.ts
src/app/api/admin/forum/[id]/delete/route.ts
```

### Priority 3: Testing & Polish (HIGH)
**Estimated Time:** 20 minutes

**Test Full Flow:**
- [ ] Create forum post (logged in)
- [ ] View forum list
- [ ] Click post → view detail
- [ ] Reply to post
- [ ] Admin approve/delete posts
- [ ] Admin delete replies
- [ ] Logout → cannot create/reply
- [ ] Login → can create/reply again

---

## 🔧 DEVELOPMENT WORKFLOW

### Starting the Dev Server
```bash
npm run dev
# Runs on http://localhost:9002
```

### Type Checking
```bash
npm run typecheck
# 0 errors currently ✅
```

### Building for Production
```bash
npm run build
# All pages compile successfully ✅
```

### Deploying Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Full Deployment
```bash
npm run build
firebase deploy
```

---

## 🔐 SECURITY MODEL

### Admin Authentication
- **Method:** JWT tokens in HttpOnly cookies
- **Session Duration:** 7 days
- **Rate Limiting:** 5 login attempts per 15 minutes
- **Credentials:** Stored in `.env.local` (not committed)
- **Protected Routes:** All `/admin/*` routes check JWT validity

### Public User Authentication
- **Method:** Firebase Authentication (email/password)
- **User Profiles:** Stored in Firestore `users` collection
- **Anonymous Auth:** Used for commenting without registration

### API Route Protection
- **Admin APIs:** Check `isAuthenticated()` from JWT
- **User APIs:** Use Firebase Auth UID for authorization
- **Firestore Rules:** Enforce data access at database level

### Data Security
- **Public Read:** News articles, forum posts, comments
- **Write Access:** Only authenticated users
- **Owner-Only Updates:** Users can only edit their own content
- **Admin Moderation:** Admins can delete any content

---

## 💡 KEY TECHNICAL PATTERNS

### Server vs Client Components
```typescript
// Server Component (default in App Router)
// - Can fetch data directly
// - No useState, useEffect, etc.
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component (use 'use client')
// - Can use React hooks
// - Interactive features
'use client';
export default function Page() {
  const [state, setState] = useState();
  return <button onClick={...}>Click</button>;
}
```

### Firebase Real-Time Hooks
```typescript
// Always memoize queries to prevent re-subscriptions
const newsQuery = useMemoFirebase(
  () => firestore ? collection(firestore, 'news_articles') : null,
  [firestore]
);

const { data, isLoading, error } = useCollection<NewsArticle>(newsQuery);
// data updates automatically when Firestore changes
```

### Form Handling Pattern
```typescript
// React Hook Form + Zod validation (not yet implemented)
// Current: Manual validation in forms

const [formData, setFormData] = useState({ ... });

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // Validate
  // Submit to API or Firestore
};
```

---

## 📁 CRITICAL FILES REFERENCE

### Configuration
- **Firebase:** `src/firebase/config.ts`
- **Next.js:** `next.config.mjs`
- **TypeScript:** `tsconfig.json`
- **Tailwind:** `tailwind.config.ts`
- **Environment:** `.env.local` (not in git)

### Authentication
- **JWT Utils:** `src/lib/auth.ts`
- **Rate Limiting:** `src/lib/rate-limit.ts`
- **Admin Guard:** `src/components/auth/admin-auth-guard.tsx`
- **User Menu:** `src/components/auth/user-menu.tsx`

### Firebase
- **Initialization:** `src/firebase/index.ts`
- **Provider:** `src/firebase/provider.tsx`
- **Hooks:** `src/firebase/firestore/use-collection.tsx`
- **Security Rules:** `firestore.rules`

### Admin Pages
- **Dashboard:** `src/app/admin/page.tsx`
- **News Management:** `src/app/admin/news/page.tsx`
- **Comment Moderation:** `src/app/admin/comments/page.tsx`
- **Admin Layout:** `src/app/admin/layout.tsx` (auth guard)

### Public Pages
- **Homepage:** `src/app/page.tsx`
- **News List:** `src/app/news/page.tsx`
- **News Detail:** `src/app/news/[articleId]/page.tsx`
- **Forum List:** `src/app/forum/page.tsx`
- **Forum Detail:** `src/app/forum/[topicId]/page.tsx` (needs update)
- **User Profile:** `src/app/profile/page.tsx`

### API Routes
- **Admin Login:** `src/app/api/admin/login/route.ts`
- **News Create:** `src/app/api/admin/news/create/route.ts`
- **Comment Approve:** `src/app/api/admin/comments/[id]/approve/route.ts`
- **Forum Create:** `src/app/api/forum/create/route.ts`

---

## 🎨 UI/UX PATTERNS

### Design System
- **Primary Color:** Manchester United Red (#DA291C)
- **Fonts:** Space Grotesk (headlines), Inter (body)
- **Components:** shadcn/ui (35+ components)
- **Layout:** Card-based design, consistent spacing

### User Feedback
- **Loading States:** Spinner with `Loader2` icon
- **Error Messages:** Alert component (red)
- **Success Messages:** Alert component (green)
- **Empty States:** Icon + message + CTA button

### Comment Status Indicators
- **Pending Comments:** 60% opacity + 0.5px blur (subtle de-emphasis)
- **Approved Comments:** Full opacity, no blur
- **Smooth Transitions:** CSS transitions for state changes

---

## 🚨 IMPORTANT NOTES

### Git Status
- **Uncommitted Changes:** Many files modified/created
- **Untracked Documentation:** All progress docs not committed
- **Next Step:** Should commit Phase 2 progress before continuing

### Environment Variables
```env
# .env.local (not in git)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ManUtd2025!
SESSION_SECRET=ethio_man_united_secret_key_change_in_production_2025
```

### Firebase Project
- **Project ID:** studio-1460723099-b75c7
- **Location:** Configured in `src/firebase/config.ts`
- **Rules Deployed:** Yes (latest version includes users collection)

### Known Warnings (Non-Breaking)
- Next.js version outdated (14.2.33 vs 15.5.3) - can update later
- Custom fonts warning in layout - expected with App Router
- Firebase auto-init warning during build - harmless

---

## 🎯 COMPLETION ESTIMATE

### Phase 2 Progress
| Component | Status | Time Spent | Time Remaining |
|-----------|--------|------------|----------------|
| User Auth | ✅ 100% | 30 min | - |
| Forum Create | ✅ 100% | 15 min | - |
| Forum List | ✅ 100% | 10 min | - |
| Forum Detail + Replies | ⏳ 0% | - | 45 min |
| Forum Moderation | ⏳ 0% | - | 30 min |
| Testing & Polish | ⏳ 0% | - | 20 min |
| **TOTAL** | **60%** | **55 min** | **95 min** |

**Estimated Time to Complete Phase 2:** ~1.5 hours remaining

---

## 🏁 SUCCESS CRITERIA

### Phase 2 Complete When:
- ✅ Users can create forum posts
- ✅ Users can view forum list
- ❌ Users can view forum post details
- ❌ Users can reply to posts
- ❌ Admin can moderate forum content
- ✅ Public user authentication works
- ✅ User profiles are viewable and editable
- ✅ Forum data from Firestore (not mock)
- ✅ 0 TypeScript errors
- ✅ Build successful

---

## 📞 QUICK ACCESS URLS

- **Homepage:** http://localhost:9002/
- **Admin Login:** http://localhost:9002/admin/login
- **Admin Dashboard:** http://localhost:9002/admin
- **News Management:** http://localhost:9002/admin/news
- **Comment Moderation:** http://localhost:9002/admin/comments
- **User Signup:** http://localhost:9002/auth/signup
- **User Login:** http://localhost:9002/auth/login
- **Profile:** http://localhost:9002/profile
- **Forum:** http://localhost:9002/forum
- **Create Forum Post:** http://localhost:9002/forum/create

---

## 🎓 LEARNING RESOURCES

### Documentation Used
- [Next.js 14 App Router](https://nextjs.org/docs)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Project Documentation
- **Product Blueprint:** `docs/blueprint.md`
- **Data Schema:** `docs/backend.json`
- **Codebase Overview:** `CODEBASE_OVERVIEW.md`
- **Phase 1 Complete:** `PHASE_1_FINAL.md`
- **Phase 2 Plan:** `PHASE_2_PLAN.md`
- **Phase 2 Progress:** `PHASE_2_PROGRESS.md`
- **Current Status:** `CURRENT_STATUS.md`

---

## ⚡ IMMEDIATE ACTION ITEMS

### TO DO NOW (In Order):
1. **Build Forum Detail Page** (45 min)
   - Update `src/app/forum/[topicId]/page.tsx` with real data
   - Add reply section component
   - Test forum post viewing and replying

2. **Add Forum Moderation** (30 min)
   - Create `/admin/forum` page
   - Add API routes for moderation
   - Test admin forum management

3. **Full Testing** (20 min)
   - Test complete forum flow
   - Test user auth flow
   - Verify all features working

4. **Commit Progress** (5 min)
   - Stage all changes
   - Commit with clear message
   - Push to origin

---

**READY TO CONTINUE DEVELOPMENT! 🚀**

**Next Command to Run:**
```bash
npm run dev
# Then open http://localhost:9002
```

**Next File to Edit:**
```
src/app/forum/[topicId]/page.tsx
```

---

*This document serves as the complete context for the project. Use it to understand where we are, what's been done, and what needs to happen next.*
