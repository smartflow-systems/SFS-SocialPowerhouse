# SFS Social PowerHouse - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy example environment file
cp .env.example .env

# Generate secure secrets
openssl rand -base64 32  # Copy this for SESSION_SECRET
openssl rand -hex 32     # Copy this for ENCRYPTION_KEY
```

Edit `.env` and add:
```env
DATABASE_URL=your_neon_postgres_url
SESSION_SECRET=<paste_32_char_secret>
ENCRYPTION_KEY=<paste_64_hex_key>
```

### 3. Initialize Database
```bash
npm run db:push
```

### 4. Run Tests (Verify Setup)
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:5000

---

## 📝 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run tests
npm run test:watch       # Test watch mode
npm run test:coverage    # Coverage report

# Database
npm run db:push          # Apply schema changes
npm run db:studio        # Open Drizzle Studio

# Testing
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

---

## 🔐 Environment Variables (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `SESSION_SECRET` | Session encryption key (≥32 chars) | Generate with openssl |
| `ENCRYPTION_KEY` | Token encryption key (64 hex) | Generate with openssl |
| `OPENAI_API_KEY` | OpenAI API key (optional) | `sk-...` |

---

## ✅ Recent Improvements

We've just completed critical improvements:

1. ✅ **Testing Infrastructure** - Jest configured and ready
2. ✅ **PostgreSQL Sessions** - Production-ready session storage
3. ✅ **Environment Validation** - Catches config errors on startup
4. ✅ **Strong Passwords** - 12+ chars with complexity requirements
5. ✅ **Database Indexes** - 11 indexes for better performance

**Production Readiness: 65/100** (+20 from before)

See `IMPROVEMENTS_COMPLETED.md` for full details.

---

## 🐛 Troubleshooting

### Environment Validation Errors
```
❌ Environment variable validation failed:
  - SESSION_SECRET: String must contain at least 32 character(s)
```
**Fix:** Generate a longer secret: `openssl rand -base64 32`

### Database Connection Failed
**Fix:** Check your `DATABASE_URL` is correct and database is accessible

### Tests Failing
```bash
# Clear cache and retry
rm -rf node_modules
npm install
npm test
```

---

## 📚 Next Steps

1. **Configure Social Platforms** - Add API keys for platforms you want to use
2. **Write Your First Test** - Add tests in `server/__tests__/`
3. **Explore the Dashboard** - Login and explore the UI
4. **Read the Docs** - Check `IMPROVEMENTS_COMPLETED.md` for details

---

## 🚨 Known Limitations

⚠️ **Social Media Publishing is Currently MOCK**
- Posts are simulated, not actually published
- Real platform integration coming soon

⚠️ **No Tests Yet**
- Infrastructure is ready
- Tests need to be written

See the roadmap in `IMPROVEMENTS_COMPLETED.md` for planned fixes.

---

## 💡 Tips

- Use `npm run test:watch` during development
- Check startup logs for configuration status
- Enable PostgreSQL sessions with `USE_PG_SESSIONS=true` in .env
- Run `npm run db:push` after schema changes

---

**Need Help?** Check `IMPROVEMENTS_COMPLETED.md` for detailed documentation.
