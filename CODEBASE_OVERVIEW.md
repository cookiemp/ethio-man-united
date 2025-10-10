# Ethio Man United - Codebase Overview

## 🎯 Project Summary
**Red Devils Hub** is a Next.js-based Manchester United fan community website with real-time Firebase integration, featuring news, fixtures, forums, and admin capabilities for an Ethiopian audience.

---

## 📋 Tech Stack

### Core Framework
- **Next.js 15.3.3** (React 18.3.1) with App Router
- **TypeScript 5** with strict mode enabled
- **Turbopack** for development (port 9002)

### Styling & UI
- **Tailwind CSS 3.4.1** with custom configuration
- **shadcn/ui** components (Radix UI primitives)
- **Lucide React** for icons
- Custom fonts: Space Grotesk (headlines), Inter (body), Source Code Pro (code)

### Backend & Database
- **Firebase 11.9.1**
  - Firestore for database
  - Firebase Authentication (password + anonymous)
  - Firebase App Hosting
- **Firestore Security Rules** with role-based access control

### Form Management
- **React Hook Form 7.54.2**
- **Zod 3.24.2** for validation
- **@hookform/resolvers 4.1.3**

### Additional Libraries
- **date-fns** - Date formatting
- **embla-carousel-react** - Carousels
- **recharts** - Charts for admin dashboard
- **class-variance-authority** - Component variants
- **tailwind-merge + clsx** - Conditional class merging

---

## 🗂️ Project Structure

```
ethio-man-united/
├── .idx/                          # Project Dev Environment
├── docs/                          # Documentation
│   ├── blueprint.md              # Product requirements & design
│   └── backend.json              # Data schema definitions
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout with Firebase provider
│   │   ├── page.tsx              # Homepage
│   │   ├── globals.css           # Global styles (Tailwind + CSS vars)
│   │   ├── admin/                # Admin dashboard
│   │   ├── news/                 # News articles
│   │   ├── fixtures/             # Match fixtures & results
│   │   └── forum/                # Community forum
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (35+ components)
│   │   ├── layout/               # Header, Footer, Admin Nav
│   │   ├── icons/                # Custom icons (Logo, Football)
│   │   ├── hero-section.tsx
│   │   └── FirebaseErrorListener.tsx
│   ├── firebase/                 # Firebase configuration & hooks
│   │   ├── config.ts             # Firebase project credentials
│   │   ├── index.ts              # Firebase initialization
│   │   ├── provider.tsx          # Firebase context provider
│   │   ├── client-provider.tsx   # Client-side wrapper
│   │   ├── errors.ts             # Custom error types
│   │   ├── error-emitter.ts      # Global error handling
│   │   └── firestore/
│   │       ├── use-collection.tsx # Real-time collection hook
│   │       └── use-doc.tsx        # Real-time document hook
│   ├── ai/                       # AI/Genkit integration
│   │   ├── genkit.ts             # Genkit config (Gemini 2.5 Flash)
│   │   └── dev.ts                # AI development server
│   ├── lib/
│   │   ├── mock-data.ts          # Sample data & TypeScript types
│   │   ├── utils.ts              # Utility functions (cn helper)
│   │   └── placeholder-images.ts
│   └── hooks/
│       ├── use-mobile.tsx        # Responsive breakpoint detection
│       └── use-toast.ts          # Toast notifications
├── firestore.rules               # Firestore security rules
├── apphosting.yaml               # Firebase App Hosting config
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui configuration
└── package.json                  # Dependencies & scripts
```

---

## 🎨 Design System

### Color Palette
```css
/* Primary */
--primary: hsl(4, 82%, 51%)        /* Manchester United Red #DA291C */

/* Backgrounds */
--background: hsl(0, 0%, 96.1%)    /* Light Gray #F5F5F5 */
--card: hsl(0, 0%, 100%)           /* White */

/* Accents */
--foreground: hsl(0, 0%, 20%)      /* Dark Gray #333333 */
--muted: hsl(0, 0%, 94.1%)
--border: hsl(0, 0%, 89.8%)
```

### Typography
- **Headlines**: `font-headline` (Space Grotesk) - Bold, modern
- **Body**: `font-body` (Inter) - Clean, readable
- **Code**: `font-code` (Source Code Pro) - Monospace

### Layout Principles
- **Card-based** design for news & forum posts
- **Consistent navigation** with sticky header
- **Responsive** breakpoints (sm, md, lg)
- **Subtle animations** on hover & load (`group-hover`, `animate-fade-in-up`)

---

## 📊 Data Schema

### Firestore Collections

#### 1. `/news_articles/{newsArticleId}`
```typescript
interface NewsArticle {
  id: string;
  headline: string;
  thumbnailUrl: string;        // Image URL
  content: string;             // Full article text
  authorId: string;            // Reference to Admin
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

#### 2. `/forum_posts/{forumPostId}`
```typescript
interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;            // Reference to User
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isApproved: boolean;         // Admin moderation required
}
```

#### 3. Comments (Subcollections)
- `/news_articles/{newsArticleId}/comments/{commentId}`
- `/forum_posts/{forumPostId}/comments/{commentId}`

```typescript
interface Comment {
  id: string;
  content: string;
  authorId: string;            // Reference to User
  newsArticleId?: string;      // If on news article
  forumPostId?: string;        // If on forum post
  createdAt: Timestamp;
  isApproved: boolean;         // Admin moderation required
}
```

#### 4. `/users/{userId}` (Implicit)
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Timestamp;
}
```

#### 5. `/admins/{adminId}` (Implicit)
```typescript
interface Admin {
  id: string;
  username: string;
  email: string;
  createdAt: Timestamp;
}
```

---

## 🔐 Security Model

### Firestore Rules
Located in `firestore.rules` - Role-based access control:

**Key Principles:**
1. **Public Read**: News articles & forum posts are publicly readable
2. **Owner-Only Write**: Users can only edit their own content (`authorId` matching)
3. **Authentication Required**: All write operations require auth
4. **Authorization Independence**: No `get()` calls in security rules
5. **Moderation**: `isApproved` field controls content visibility

**Example Rules:**
```javascript
// News articles
allow get, list: if true;  // Public read
allow create: if isSignedIn() && request.resource.data.authorId == request.auth.uid;
allow update, delete: if isSignedIn() && isExistingOwner(resource.data.authorId);
```

### Authentication Providers
- **Password-based** authentication
- **Anonymous** authentication

---

## 🔌 Firebase Integration

### Custom Hooks

#### `useFirebase()`
Returns Firebase services + user state:
```typescript
const { firebaseApp, firestore, auth, user, isUserLoading, userError } = useFirebase();
```

#### `useCollection<T>(query)`
Real-time Firestore collection listener:
```typescript
const { data, isLoading, error } = useCollection<NewsArticle>(newsQuery);
```
⚠️ **IMPORTANT**: Must use `useMemoFirebase()` to memoize queries!

#### `useDoc<T>(docRef)`
Real-time Firestore document listener (similar to `useCollection`)

#### `useMemoFirebase(factory, deps)`
Memoizes Firebase queries/refs to prevent unnecessary re-subscriptions:
```typescript
const newsQuery = useMemoFirebase(
  () => firestore ? collection(firestore, 'news_articles') : null,
  [firestore]
);
```

### Error Handling
- **Global error emitter** for permission errors
- **FirebaseErrorListener** component catches and displays errors
- Custom `FirestorePermissionError` type

---

## 🚀 Available Scripts

```json
"dev": "next dev --turbopack -p 9002"         // Start dev server on port 9002
"genkit:dev": "genkit start -- tsx src/ai/dev.ts"  // Start AI dev server
"genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts"  // AI with watch mode
"build": "NODE_ENV=production next build"     // Production build
"start": "next start"                         // Start production server
"lint": "next lint"                           // Run ESLint
"typecheck": "tsc --noEmit"                   // Type checking only
```

---

## 📱 Features Implemented

### ✅ Core Features
1. **Homepage**
   - Hero section
   - Latest news highlight
   - Recent match results (3 most recent)

2. **News Section**
   - Grid layout of news articles
   - Article detail pages (to be implemented)
   - Comment system (moderation pending)

3. **Fixtures & Results**
   - Tabbed interface (Upcoming / Recent)
   - Match cards with scores
   - Date/time formatting

4. **Forum**
   - Topic listing
   - Reply counts
   - Last post information
   - "New Topic" button (to be implemented)

5. **Admin Dashboard**
   - Real-time stats:
     - Total news articles (from Firestore)
     - Total forum posts (from Firestore)
     - Pending comments (requires approval)
     - Approved comments
   - Site visits counter (mock data)

### 🚧 Features Partially Implemented
- Comment moderation interface
- News article creation/editing
- Forum post creation
- User authentication UI

---

## 🔧 Configuration Files

### Next.js Config (`next.config.ts`)
```typescript
{
  typescript: { ignoreBuildErrors: true },  // ⚠️ Production concern
  eslint: { ignoreDuringBuilds: true },     // ⚠️ Production concern
  images: {
    remotePatterns: [
      'placehold.co',
      'images.unsplash.com',
      'picsum.photos'
    ]
  }
}
```

### TypeScript Config
- **Target**: ES2017
- **Strict mode**: Enabled
- **Path alias**: `@/*` → `./src/*`
- **JSX**: preserve (handled by Next.js)

### Tailwind Config
- Custom font families
- Extended color palette (HSL-based CSS variables)
- Custom animations (`accordion-down`, `accordion-up`)
- shadcn/ui plugin integration

---

## 🎯 Development Guidelines

### When Adding Features

1. **Data Layer**
   - Define types in `src/lib/mock-data.ts`
   - Add Firestore schema to `docs/backend.json`
   - Update security rules in `firestore.rules`

2. **UI Components**
   - Use existing shadcn/ui components from `src/components/ui/`
   - Follow design system colors & typography
   - Maintain responsive design (mobile-first)
   - Add proper TypeScript types

3. **Firebase Integration**
   - Always use `useMemoFirebase()` for queries
   - Handle loading states (`isLoading`)
   - Handle error states (`error`)
   - Respect auth state (`user`)

4. **Styling**
   - Use Tailwind utility classes
   - Use `cn()` helper for conditional classes
   - Maintain Manchester United branding (red #DA291C)
   - Follow card-based layout pattern

5. **TypeScript**
   - No `any` types (use generics)
   - Define interfaces for all data structures
   - Use Zod schemas for form validation

---

## ⚠️ Known Considerations

### Build Configuration
```typescript
// ⚠️ These are currently disabled for development speed
typescript: { ignoreBuildErrors: true }
eslint: { ignoreDuringBuilds: true }
```
**Recommendation**: Re-enable these for production to catch errors early.

### Environment Variables
Currently using hardcoded Firebase config in `src/firebase/config.ts`.
**Production**: Firebase App Hosting injects config automatically.

### Mock Data
Several pages use mock data from `src/lib/mock-data.ts`:
- News articles (3 articles)
- Match fixtures/results (6 matches)
- Forum topics (2 topics)

**Next Steps**: Replace with real Firestore queries.

### Missing Features
1. Authentication UI (login/register forms)
2. Admin content creation forms
3. Comment moderation interface
4. Forum post detail pages
5. News article detail pages
6. User profile pages
7. Football API integration (for live match data)

---

## 🔄 Firebase Real-Time Architecture

### Pattern
The app uses **real-time subscriptions** via `onSnapshot()`:
- Changes in Firestore automatically update UI
- No manual refresh needed
- Optimistic UI updates possible

### Query Example
```typescript
// Admin dashboard - real-time stats
const newsQuery = useMemoFirebase(
  () => firestore ? collection(firestore, 'news_articles') : null,
  [firestore]
);
const { data: newsArticles } = useCollection<NewsArticle>(newsQuery);
// newsArticles updates automatically when Firestore changes
```

---

## 🎨 UI Component Library (shadcn/ui)

### Available Components
35+ pre-built components in `src/components/ui/`:
- **Layout**: Card, Sheet, Sidebar, Separator
- **Forms**: Input, Textarea, Select, Checkbox, Switch, Radio Group
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Overlays**: Dialog, Popover, Dropdown Menu
- **Data**: Table, Tabs, Accordion, Collapsible
- **Navigation**: Menubar
- **Misc**: Avatar, Badge, Button, Calendar, Carousel, Chart, Slider, Tooltip

### Usage Pattern
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click me</Button>
  </CardContent>
</Card>
```

---

## 📖 Key Files Reference

### Must-Read Files
1. **`docs/blueprint.md`** - Product vision & requirements
2. **`docs/backend.json`** - Complete data schema
3. **`firestore.rules`** - Security model
4. **`src/lib/mock-data.ts`** - TypeScript types & sample data
5. **`src/firebase/provider.tsx`** - Firebase context setup

### Entry Points
- **`src/app/layout.tsx`** - Root layout with providers
- **`src/app/page.tsx`** - Homepage
- **`src/firebase/index.ts`** - Firebase initialization

### Styling
- **`src/app/globals.css`** - CSS variables & Tailwind base
- **`tailwind.config.ts`** - Tailwind customization

---

## 🚀 Getting Started (Next Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Firebase (if needed)
- Create `.env.local` for local development (optional)
- Firebase credentials are in `src/firebase/config.ts`

### 3. Start Development Server
```bash
npm run dev
# Opens on http://localhost:9002
```

### 4. Start AI Server (Optional)
```bash
npm run genkit:dev
```

### 5. Deploy to Firebase
```bash
npm run build
firebase deploy
```

---

## 📚 Documentation & Resources

### Internal Docs
- **Product Blueprint**: `docs/blueprint.md`
- **Data Schema**: `docs/backend.json`
- **This Overview**: `CODEBASE_OVERVIEW.md`

### External Resources
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Genkit AI](https://firebase.google.com/docs/genkit)

---

## 🤝 Contributing Guidelines

### Code Style
- Use TypeScript for all new files
- Follow existing naming conventions (kebab-case for files)
- Use functional components with hooks
- Prefer `const` over `let`
- Use destructuring for props

### Component Structure
```typescript
'use client'; // If needed

import { /* imports */ } from 'packages';
import { /* local imports */ } from '@/components';

interface ComponentProps {
  // Props definition
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
}
```

### Git Workflow
- Branch naming: `feature/`, `fix/`, `docs/`
- Commit messages: Clear, descriptive, present tense
- Test before committing
- Keep commits atomic

---

## 📊 Project Status

### Completion Estimate
- **Frontend Structure**: 70% complete
- **Backend Integration**: 40% complete
- **Authentication**: 30% complete
- **Admin Features**: 30% complete
- **Content Creation**: 20% complete
- **Moderation System**: 10% complete

### Priority Features
1. ✅ Basic page layouts (DONE)
2. ✅ Firebase integration setup (DONE)
3. ⏳ Authentication UI (IN PROGRESS)
4. 🔜 Content creation forms (NEXT)
5. 🔜 Comment moderation (NEXT)
6. 🔜 Real-time match data API

---

## 📞 Support & Maintenance

### Common Issues

**Issue**: Firebase permission errors
**Solution**: Check `firestore.rules` and ensure user is authenticated

**Issue**: Queries not updating
**Solution**: Verify `useMemoFirebase()` is used for query memoization

**Issue**: Build errors about types
**Solution**: Run `npm run typecheck` to identify issues

**Issue**: Styling not applying
**Solution**: Check Tailwind config and CSS variable definitions

---

**Last Updated**: 2025-10-08  
**Version**: 0.1.0  
**Maintained By**: Development Team

