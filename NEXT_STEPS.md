# Next Steps - Ethio Man United Development Roadmap

## 📋 Current Status (2025-10-08)

### ✅ Completed Features
- [x] Basic project structure with Next.js 15 + TypeScript
- [x] Firebase integration (Firestore + Authentication)
- [x] Homepage with hero section and recent matches
- [x] News, Fixtures, Forum pages (basic layouts)
- [x] Admin authentication system with JWT sessions
- [x] Admin dashboard with real-time stats from Firestore
- [x] Firestore security rules deployed
- [x] Admin area hidden from main navigation (accessible via `/admin`)
- [x] Collection group queries enabled for comments

### 🔐 Admin Access
- **URL**: `http://localhost:9002/admin`
- **Username**: `admin`
- **Password**: `ManUtd2025!`
- **Environment**: `.env.local` file configured

---

## 🚀 Priority Features to Implement

### 1. Content Management (HIGH PRIORITY)

#### A. News Article Management
**Location**: `/admin/news`

**Tasks**:
- [ ] Create "Add News Article" form
  - Title input
  - Content editor (rich text with markdown support)
  - Thumbnail image upload (Firebase Storage)
  - Author auto-populated from admin session
  - Publish/Draft status
- [ ] News article listing page
  - Table view with edit/delete actions
  - Pagination (10 articles per page)
  - Search/filter by title or date
- [ ] Edit news article functionality
- [ ] Delete news article with confirmation dialog
- [ ] Image upload to Firebase Storage integration

**API Routes Needed**:
- `POST /api/admin/news/create`
- `PUT /api/admin/news/[id]/update`
- `DELETE /api/admin/news/[id]/delete`

**Files to Create**:
- `src/app/admin/news/create/page.tsx`
- `src/app/admin/news/[id]/edit/page.tsx`

---

#### B. Comment Moderation System
**Location**: `/admin/comments`

**Tasks**:
- [ ] Display all pending comments (from `collectionGroup` query)
- [ ] Show comment content, author, parent article/post
- [ ] Approve/Reject actions
- [ ] Bulk approve/reject functionality
- [ ] Filter by approved/pending/all
- [ ] Pagination

**API Routes Needed**:
- `PUT /api/admin/comments/[id]/approve`
- `PUT /api/admin/comments/[id]/reject`
- `DELETE /api/admin/comments/[id]/delete`

**Files to Update**:
- `src/app/admin/comments/page.tsx` (already exists, needs implementation)

---

### 2. Public-Facing Features (MEDIUM PRIORITY)

#### A. News Article Detail Pages
**Location**: `/news/[id]`

**Tasks**:
- [ ] Dynamic route for individual articles
- [ ] Display full article content with formatting
- [ ] Show author and publication date
- [ ] Related articles section (same category/recent)
- [ ] Comment section at the bottom
  - Display approved comments
  - Add comment form (requires user auth)
  - Real-time comment updates

**Files to Create**:
- `src/app/news/[id]/page.tsx`

---

#### B. Forum Functionality
**Location**: `/forum`

**Tasks**:
- [ ] Forum post listing with pagination
- [ ] "Create New Topic" button and form
- [ ] Forum post detail page (`/forum/[id]`)
  - Display full post content
  - Reply/comment functionality
  - Real-time updates for new replies
- [ ] User authentication for posting
  - Sign up / Log in forms
  - Anonymous posting option (with moderation)
- [ ] Admin approval workflow for new posts

**Files to Create**:
- `src/app/forum/[id]/page.tsx`
- `src/app/forum/create/page.tsx`
- `src/components/forum/post-form.tsx`
- `src/components/forum/reply-list.tsx`

---

#### C. User Authentication (Public Users)
**Location**: Various

**Tasks**:
- [ ] Firebase Authentication UI components
  - Email/Password sign up
  - Email/Password login
  - Anonymous login option
- [ ] User profile page (`/profile`)
  - Display username, email
  - List user's posts and comments
  - Edit profile functionality
- [ ] Authentication state management
  - Login/Logout buttons in header (when authenticated)
  - Protected routes for posting content
- [ ] User roles in Firestore (`users` collection)

**Files to Create**:
- `src/app/auth/login/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/profile/page.tsx`
- `src/components/auth/auth-buttons.tsx`
- `src/components/auth/user-auth-guard.tsx`

---

### 3. Data Integration (MEDIUM PRIORITY)

#### A. Live Match Data API
**Tasks**:
- [ ] Research and integrate football API (e.g., Football-Data.org, API-Football)
- [ ] Create API route to fetch Man United fixtures
- [ ] Cache results to minimize API calls
- [ ] Update Fixtures page to use real data
- [ ] Auto-refresh scores during live matches
- [ ] Store match results in Firestore for historical data

**API Routes Needed**:
- `GET /api/matches/upcoming`
- `GET /api/matches/recent`
- `GET /api/matches/live`

**Files to Update**:
- `src/app/fixtures/page.tsx`
- `src/lib/football-api.ts` (new file for API integration)

---

#### B. Replace Mock Data
**Location**: `src/lib/mock-data.ts`

**Tasks**:
- [ ] Remove mock news articles from homepage
- [ ] Fetch real news from Firestore on homepage
- [ ] Remove mock forum topics
- [ ] Fetch real forum posts from Firestore
- [ ] Update TypeScript types to match actual Firestore schema

---

### 4. UI/UX Improvements (LOW PRIORITY)

#### A. Homepage Enhancements
- [ ] Hero carousel with multiple featured articles
- [ ] "Latest News" section with 6 articles in grid
- [ ] "Upcoming Match" countdown timer
- [ ] "Top Forum Discussions" section
- [ ] Newsletter signup form (email collection)

#### B. Responsive Design Polish
- [ ] Test all pages on mobile devices
- [ ] Optimize images for different screen sizes
- [ ] Improve mobile navigation (hamburger menu)
- [ ] Add loading skeletons for better perceived performance

#### C. Dark Mode Support
- [ ] Add dark mode toggle in header
- [ ] Update Tailwind config for dark mode
- [ ] Test all components in dark mode

---

### 5. Performance & SEO (LOW PRIORITY)

#### A. SEO Optimization
- [ ] Add meta tags to all pages (Open Graph, Twitter Cards)
- [ ] Generate sitemap.xml
- [ ] Add robots.txt
- [ ] Implement proper heading hierarchy (H1, H2, H3)
- [ ] Add alt text to all images
- [ ] Create JSON-LD structured data for articles

#### B. Performance Optimization
- [ ] Implement image optimization with Next.js Image component
- [ ] Add caching headers to API routes
- [ ] Lazy load images and components
- [ ] Code splitting for admin pages
- [ ] Implement ISR (Incremental Static Regeneration) for news pages

---

### 6. Production Deployment (WHEN READY)

#### A. Pre-Deployment Checklist
- [ ] Re-enable TypeScript strict checking in `next.config.ts`
- [ ] Re-enable ESLint in build (`next.config.ts`)
- [ ] Update `SESSION_SECRET` in production environment
- [ ] Update admin credentials (stronger password)
- [ ] Remove all console.log statements
- [ ] Add error logging service (e.g., Sentry)
- [ ] Test all functionality in production mode (`npm run build && npm start`)

#### B. Firebase Deployment
- [ ] Configure Firebase App Hosting
- [ ] Set up production environment variables
- [ ] Deploy Firestore rules
- [ ] Set up Firebase Storage rules
- [ ] Configure custom domain
- [ ] Set up SSL certificate

#### C. Post-Deployment
- [ ] Monitor Firebase usage and quotas
- [ ] Set up Google Analytics
- [ ] Monitor error rates
- [ ] Create backup strategy for Firestore data

---

## 📚 Technical Debt & Improvements

### Code Quality
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Document all custom hooks
- [ ] Add JSDoc comments to utility functions
- [ ] Create component documentation (Storybook)

### Security
- [ ] Implement rate limiting for API routes
- [ ] Add CSRF protection
- [ ] Implement content sanitization for user inputs
- [ ] Add input validation with Zod schemas
- [ ] Regular security audits of dependencies

### Accessibility
- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader testing
- [ ] Color contrast compliance (WCAG AA)

---

## 🗂️ File Structure Reference

```
src/
├── app/
│   ├── admin/              # Admin pages (protected)
│   │   ├── page.tsx        # Dashboard ✅
│   │   ├── layout.tsx      # Admin layout ✅
│   │   ├── login/          # Admin login ✅
│   │   ├── news/           # News management (TODO)
│   │   └── comments/       # Comment moderation (TODO)
│   ├── news/               # Public news pages
│   │   └── [id]/           # Article detail (TODO)
│   ├── forum/              # Public forum pages
│   │   ├── [id]/           # Topic detail (TODO)
│   │   └── create/         # New topic (TODO)
│   ├── auth/               # User authentication (TODO)
│   └── api/                # API routes
│       └── admin/          # Admin API routes ✅
├── components/
│   ├── auth/               # Auth components
│   │   └── admin-auth-guard.tsx ✅
│   ├── layout/             # Layout components ✅
│   ├── ui/                 # shadcn/ui components ✅
│   └── forum/              # Forum components (TODO)
├── firebase/               # Firebase integration ✅
├── lib/                    # Utility functions ✅
└── hooks/                  # Custom hooks ✅
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Firebase login
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy to Firebase App Hosting
firebase deploy
```

---

## 📝 Environment Variables

Stored in `.env.local`:
```env
# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ManUtd2025!

# Session Secret
SESSION_SECRET=ethio_man_united_secret_key_change_in_production_2025
```

---

## 🐛 Known Issues

1. **SWC Warning**: `@next/swc-win32-x64-msvc` warning on Windows - harmless, Next.js falls back to Babel
2. **Mock Data**: Homepage still uses mock data for news and matches
3. **TypeScript Errors**: Build errors ignored in `next.config.ts` - should be fixed before production

---

## 📖 Documentation Links

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

---

## 💡 Quick Start (Next Session)

1. **Start the dev server**: `npm run dev`
2. **Login to admin**: Go to `http://localhost:9002/admin`
3. **Pick a task**: Choose from Priority Features above
4. **Check existing code**: Review similar components for patterns
5. **Test thoroughly**: Test both functionality and edge cases
6. **Update this file**: Mark tasks as complete when done

---

**Last Updated**: 2025-10-08  
**Current Version**: 0.1.0  
**Status**: Active Development

