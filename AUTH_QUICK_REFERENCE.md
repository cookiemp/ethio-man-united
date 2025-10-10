# 🔐 Authentication Quick Reference

## 📝 Default Login Credentials

```
URL:      http://localhost:9002/admin
Username: admin
Password: ManUtd2025!
```

---

## 🚀 Quick Commands

```bash
# Start dev server
npm run dev

# Generate new session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate strong password
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Auth utilities |
| `src/app/api/admin/login/route.ts` | Login API |
| `src/app/api/admin/logout/route.ts` | Logout API |
| `src/app/admin/login/page.tsx` | Login UI |
| `src/app/admin/layout.tsx` | Protected layout |
| `.env.local` | Local credentials |

---

## 🔑 Environment Variables

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ManUtd2025!
SESSION_SECRET=ethio_man_united_secret_key_change_in_production_2025
```

**⚠️ Change SESSION_SECRET to 32+ random characters in production!**

---

## 🛠️ Common Functions

```typescript
// Check if authenticated (Server Component)
const authenticated = await isAuthenticated();

// Get session
const session = await getAdminSession();
// Returns: { isAdmin: true } or null

// Verify credentials
const isValid = verifyAdminCredentials(username, password);
```

---

## 🧪 Test Checklist

- [ ] Visit `/admin` redirects to `/admin/login`
- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Protected routes accessible when logged in
- [ ] Logout redirects to login page
- [ ] Session persists after browser close (7 days)

---

## 🚢 Vercel Deployment

1. Set environment variables in Vercel Dashboard
2. Push to GitHub: `git push origin main`
3. Vercel auto-deploys

**Required Vercel Env Vars:**
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`  
- `SESSION_SECRET`

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Check `.env.local` exists, restart server |
| SESSION_SECRET error | Add to `.env.local` |
| Redirect loop | Clear cookies, restart server |
| Not staying logged in | Check cookie not being blocked |

---

## 📖 Full Documentation

- **Setup Guide**: `AUTH_SETUP.md`
- **Architecture**: `AUTHENTICATION_PLAN.md`
- **Implementation**: `AUTH_IMPLEMENTATION_SUMMARY.md`

---

**Session Duration:** 7 days  
**Cookie Type:** HttpOnly, Secure (production)  
**Token Type:** JWT (HS256)  
**Auth Type:** Environment variable credentials  
**Cost:** $0

