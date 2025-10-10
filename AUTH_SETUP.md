# 🔐 Authentication Setup Guide

## Overview

This application uses a **simple cookie-based authentication system** specifically designed for admin-only access. Public users can browse the site without authentication, while administrators must log in to access the admin panel.

---

## 🎯 Authentication Architecture

### Key Features
- ✅ **Cookie-based** sessions using JWT tokens
- ✅ **Admin-only** authentication (no user registration)
- ✅ **Environment variable** credentials (no database needed)
- ✅ **7-day session** duration
- ✅ **Automatic protection** of all `/admin` routes
- ✅ **Built-in security** features (httpOnly cookies, CSRF protection)

### How It Works

1. **Login Flow:**
   - Admin visits `/admin` → redirected to `/admin/login`
   - Enters username & password
   - Server validates credentials against env variables
   - On success: JWT token created and stored in httpOnly cookie
   - Redirected to `/admin` dashboard

2. **Session Management:**
   - Cookie expires after 7 days
   - Cookie is httpOnly (JavaScript cannot access it)
   - Cookie is secure in production (HTTPS only)
   - JWT token is signed with secret key

3. **Protected Routes:**
   - All `/admin/*` routes (except `/admin/login`) require authentication
   - Server checks cookie on every admin page load
   - Invalid/missing cookie → redirect to login

---

## 🚀 Quick Start

### 1. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Then edit `.env.local` with your credentials:

```env
# Admin Credentials
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password_here

# Session Secret (32+ characters, random string)
SESSION_SECRET=your_random_secret_key_min_32_chars_long
```

### 2. Generate a Secure Session Secret

**Option A: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Using PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option C: Using OpenSSL**
```bash
openssl rand -hex 32
```

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:9002/admin and you'll be prompted to login.

---

## 🔑 Default Credentials

**Development Only** (already in .env.local):
```
Username: admin
Password: ManUtd2025!
```

⚠️ **IMPORTANT:** Change these before deploying to production!

---

## 📝 API Endpoints

### `POST /api/admin/login`
Authenticate admin user and create session.

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid username or password"
}
```

### `POST /api/admin/logout`
Clear admin session and logout.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🛡️ Security Features

### 1. JWT Token Security
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Expiration:** 7 days
- **Signed with:** SESSION_SECRET environment variable
- **Payload:** `{ isAdmin: true }`

### 2. Cookie Security
```javascript
{
  httpOnly: true,              // JavaScript cannot access
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',            // CSRF protection
  maxAge: 604800,             // 7 days in seconds
  path: '/'                   // Available site-wide
}
```

### 3. Brute Force Protection
- **1-second delay** on failed login attempts
- Prevents rapid password guessing

### 4. Environment Variable Protection
- Credentials never stored in code
- `.env.local` excluded from git
- Different credentials per environment

---

## 🚢 Production Deployment (Vercel)

### 1. Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `ADMIN_USERNAME` | `your_production_username` | Production |
| `ADMIN_PASSWORD` | `your_strong_production_password` | Production |
| `SESSION_SECRET` | `your_generated_secret_key` | Production |

### 2. Use Strong Credentials

Production password should have:
- ✅ At least 16 characters
- ✅ Mix of uppercase, lowercase, numbers, symbols
- ✅ No dictionary words
- ✅ Unique (not used elsewhere)

**Example Generator:**
```bash
openssl rand -base64 24
# Output: aBc123XyZ!@#$abcdefghijklmnop
```

### 3. Deploy

```bash
git push origin main
```

Vercel will automatically deploy with your environment variables.

---

## 🔄 Changing Credentials

### Development
1. Edit `.env.local`
2. Restart dev server: `npm run dev`

### Production (Vercel)
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update `ADMIN_USERNAME` and/or `ADMIN_PASSWORD`
3. Redeploy: Settings → Deployments → Redeploy

⚠️ **Note:** Changing credentials will log out all current admin sessions.

---

## 🧪 Testing Authentication

### Test Login (Development)
```bash
curl -X POST http://localhost:9002/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ManUtd2025!"}'
```

### Test Protected Route
```bash
# Without cookie (should fail)
curl http://localhost:9002/admin

# With cookie (should succeed)
curl http://localhost:9002/admin \
  -H "Cookie: admin_session=YOUR_JWT_TOKEN"
```

---

## 📂 File Structure

```
src/
├── lib/
│   └── auth.ts                    # Auth utility functions
├── app/
│   ├── api/
│   │   └── admin/
│   │       ├── login/
│   │       │   └── route.ts       # Login endpoint
│   │       └── logout/
│   │           └── route.ts       # Logout endpoint
│   └── admin/
│       ├── layout.tsx             # Protected layout with auth check
│       └── login/
│           ├── layout.tsx         # Bypass auth for login page
│           └── page.tsx           # Login form UI
└── components/
    └── layout/
        └── admin-nav.tsx          # Admin nav with logout button
```

---

## 🔧 Utility Functions (`src/lib/auth.ts`)

### `setAdminSession()`
Create admin session and set cookie.

```typescript
await setAdminSession();
```

### `getAdminSession()`
Get current admin session from cookie.

```typescript
const session = await getAdminSession();
// Returns: { isAdmin: true } or null
```

### `clearAdminSession()`
Delete admin session cookie.

```typescript
await clearAdminSession();
```

### `verifyAdminCredentials(username, password)`
Check if credentials are valid.

```typescript
const isValid = verifyAdminCredentials('admin', 'password123');
// Returns: boolean
```

### `isAuthenticated()`
Check if current request is authenticated (for Server Components).

```typescript
const authenticated = await isAuthenticated();
// Returns: boolean
```

---

## 🐛 Troubleshooting

### Problem: "SESSION_SECRET environment variable is not set"
**Solution:** Add `SESSION_SECRET` to `.env.local`

### Problem: Login redirects to login page again
**Solution:** 
1. Check `.env.local` credentials match what you're entering
2. Clear browser cookies
3. Restart dev server

### Problem: "Authorization required" in production
**Solution:**
1. Verify environment variables are set in Vercel
2. Check Vercel deployment logs for errors
3. Ensure SESSION_SECRET is at least 32 characters

### Problem: Session expires too quickly
**Solution:** Edit `SESSION_DURATION` in `src/lib/auth.ts`:
```typescript
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days
```

### Problem: Can't access admin after logout
**Solution:** This is expected. Go to `/admin/login` to log back in.

---

## 🔐 Best Practices

### ✅ DO
- Use strong, unique passwords in production
- Keep SESSION_SECRET private and secure
- Rotate credentials periodically
- Use HTTPS in production (automatic with Vercel)
- Monitor failed login attempts

### ❌ DON'T
- Commit `.env.local` to git (it's already in `.gitignore`)
- Use the default development credentials in production
- Share credentials via insecure channels (email, Slack)
- Reuse passwords from other services
- Hardcode credentials in code

---

## 🔄 Rotating Credentials

To rotate admin credentials safely:

1. **Create new credentials**
   ```bash
   NEW_PASSWORD=$(openssl rand -base64 24)
   echo $NEW_PASSWORD  # Save this securely
   ```

2. **Update environment variables**
   - Development: Update `.env.local`
   - Production: Update in Vercel dashboard

3. **Redeploy** (production only)

4. **Test login** with new credentials

5. **Notify team** (if multiple admins)

---

## 📞 Support

### Common Questions

**Q: Can I have multiple admin accounts?**
A: Currently no. This system is designed for single admin access. For multiple admins, consider implementing a database-backed user system.

**Q: Can I change the session duration?**
A: Yes, edit `SESSION_DURATION` in `src/lib/auth.ts`.

**Q: Is this secure enough for production?**
A: Yes, for a fan site with basic admin needs. For high-security requirements, consider adding:
- Two-factor authentication (2FA)
- Rate limiting
- Login attempt monitoring
- IP whitelisting

**Q: What happens if someone steals my SESSION_SECRET?**
A: They could forge admin sessions. Immediately rotate your SESSION_SECRET if compromised.

---

## 🚀 Next Steps

Now that authentication is set up:

1. ✅ Test login at `/admin/login`
2. ✅ Change default credentials
3. ✅ Set up production environment variables in Vercel
4. ✅ Continue with admin feature development

---

**Last Updated:** 2025-10-08  
**Version:** 1.0.0

