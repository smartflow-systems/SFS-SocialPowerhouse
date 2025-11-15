# Social Media OAuth Setup Guide

This guide will help you set up secure OAuth authentication for all supported social media platforms in the SFS Social Powerhouse application.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Initial Setup](#initial-setup)
3. [Platform-Specific Setup](#platform-specific-setup)
4. [Testing OAuth Flows](#testing-oauth-flows)
5. [Token Management](#token-management)
6. [Troubleshooting](#troubleshooting)

---

## Security Overview

### Encryption Architecture

SFS Social Powerhouse uses **AES-256-GCM** encryption to protect OAuth tokens in the database:

- **Algorithm**: AES-256-GCM (Galois/Counter Mode) - provides authenticated encryption
- **Key Derivation**: PBKDF2 with 100,000 iterations using SHA-256
- **Random Salt**: Each token is encrypted with a unique 256-bit salt
- **Initialization Vector**: Random 128-bit IV per encryption operation
- **Authentication Tag**: 128-bit tag to verify data integrity

### Token Flow

1. **User connects account** → OAuth flow initiated
2. **Platform returns tokens** → Tokens received from social platform
3. **Tokens encrypted** → AES-256-GCM encryption with random salt/IV
4. **Stored in database** → Only encrypted tokens stored in PostgreSQL
5. **Retrieved when needed** → Decrypted on-the-fly when publishing content
6. **Auto-refresh** → Background job refreshes tokens before expiration

### User Isolation

- Each user can **only** access their own social accounts
- All API routes verify user ownership before any operation
- Session-based authentication with CSRF protection
- OAuth state parameter prevents authorization hijacking

---

## Initial Setup

### 1. Generate Encryption Key

The encryption key must be exactly 32 bytes (256 bits) encoded in base64.

**Generate a secure key:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using OpenSSL
openssl rand -base64 32
```

**Add to `.env` file:**

```env
ENCRYPTION_KEY=your_generated_key_here
```

**⚠️ CRITICAL SECURITY NOTES:**

- **NEVER** commit the encryption key to version control
- **NEVER** share the encryption key publicly
- **NEVER** change the key after encrypting tokens (all existing tokens will become unreadable)
- **Store backups** of the key in a secure location (password manager, secrets vault)
- **Use different keys** for development, staging, and production environments

### 2. Set Frontend URL

Set the frontend URL for OAuth callbacks:

```env
FRONTEND_URL=http://localhost:5173  # Development
# FRONTEND_URL=https://yourdomain.com  # Production
```

### 3. Database Setup

Ensure your database is configured:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

Run migrations to create the `social_accounts` table:

```bash
npm run db:push
```

---

## Platform-Specific Setup

### Facebook & Instagram

**Note:** Instagram uses Facebook's OAuth system. The same app credentials work for both.

#### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** → **Consumer**
4. Fill in app details and create

#### 2. Configure OAuth Settings

1. In your app dashboard, go to **Settings** → **Basic**
2. Add **App Domains**: `localhost` (dev) or your domain (prod)
3. Go to **Facebook Login** → **Settings**
4. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5173/api/social/oauth/facebook/callback
   http://localhost:5173/api/social/oauth/instagram/callback
   ```

#### 3. Add Required Permissions

Go to **App Review** → **Permissions and Features**, request:

- `pages_manage_posts` - Publish to Facebook Pages
- `pages_read_engagement` - Read page insights
- `pages_show_list` - Get list of pages
- `instagram_basic` - Instagram basic profile
- `instagram_content_publish` - Publish to Instagram
- `public_profile` - Basic profile info

#### 4. Add Environment Variables

```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Instagram uses same credentials
INSTAGRAM_CLIENT_ID=your_facebook_app_id
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret
```

---

### Twitter / X

#### 1. Create Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Enable **OAuth 2.0**

#### 2. Configure OAuth Settings

1. In **User authentication settings**, enable **OAuth 2.0**
2. Set **Type of App**: Web App
3. Add **Callback URI**:
   ```
   http://localhost:5173/api/social/oauth/twitter/callback
   ```
4. Add **Website URL**: Your app URL

#### 3. Set Permissions

Select the following scopes:
- `tweet.read` - Read tweets
- `tweet.write` - Create tweets
- `users.read` - Read user profile
- `offline.access` - Refresh token support

#### 4. Add Environment Variables

```env
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

---

### LinkedIn

#### 1. Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create App**
3. Fill in required information

#### 2. Configure OAuth Settings

1. Go to **Auth** tab
2. Add **Redirect URLs**:
   ```
   http://localhost:5173/api/social/oauth/linkedin/callback
   ```

#### 3. Add Products

Request access to:
- **Sign In with LinkedIn** - Basic authentication
- **Share on LinkedIn** - Post content

#### 4. Add Environment Variables

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

---

### TikTok

#### 1. Register TikTok Developer Account

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Register as a developer
3. Create a new app

#### 2. Configure OAuth Settings

1. In app settings, add **Redirect URI**:
   ```
   http://localhost:5173/api/social/oauth/tiktok/callback
   ```

#### 3. Request Scopes

Add the following scopes:
- `user.info.basic` - Basic profile info
- `video.publish` - Upload videos
- `video.list` - List user videos

#### 4. Add Environment Variables

```env
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

---

### YouTube (Google)

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **YouTube Data API v3**

#### 2. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure consent screen if prompted
4. Application type: **Web application**
5. Add **Authorized redirect URIs**:
   ```
   http://localhost:5173/api/social/oauth/youtube/callback
   ```

#### 3. Add Environment Variables

```env
YOUTUBE_CLIENT_ID=your_google_client_id
YOUTUBE_CLIENT_SECRET=your_google_client_secret
```

---

### Pinterest

#### 1. Create Pinterest App

1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Create a new app
3. Fill in app details

#### 2. Configure OAuth Settings

1. In app settings, add **Redirect URI**:
   ```
   http://localhost:5173/api/social/oauth/pinterest/callback
   ```

#### 3. Request Scopes

Select:
- `boards:read` - Read boards
- `pins:read` - Read pins
- `pins:write` - Create pins
- `user_accounts:read` - Read user profile

#### 4. Add Environment Variables

```env
PINTEREST_APP_ID=your_pinterest_app_id
PINTEREST_APP_SECRET=your_pinterest_app_secret
```

---

## Testing OAuth Flows

### 1. Start the Application

```bash
npm run dev
```

### 2. Check Configured Platforms

```bash
curl http://localhost:5000/api/social/platforms \
  -H "Cookie: connect.sid=your_session_cookie"
```

This returns platforms with valid credentials.

### 3. Test OAuth Connection

1. Navigate to **Accounts** page in the app
2. Click **Connect** for a platform
3. Authorize the app on the platform
4. You should be redirected back with success

### 4. Verify Database Encryption

```sql
-- Tokens should look like encrypted strings
SELECT id, platform, account_name,
       LEFT(access_token, 50) as token_preview
FROM social_accounts;

-- Should return something like:
-- "Kx3mP9...wE4fQ==:yH7nR2...sL8bA==:..."
```

---

## Token Management

### Automatic Token Refresh

The system automatically refreshes tokens before they expire:

- **Schedule**: Runs every 6 hours
- **Criteria**: Refreshes tokens expiring within 24 hours
- **Failure Handling**: Deactivates accounts if refresh fails 3 times
- **Logs**: Check server logs for `[Token Refresher]` messages

### Manual Token Refresh

```bash
curl -X POST http://localhost:5000/api/social/accounts/{account_id}/refresh \
  -H "Cookie: connect.sid=your_session_cookie"
```

### Token Expiration Times

| Platform | Access Token | Refresh Token |
|----------|--------------|---------------|
| Facebook | 60 days | Long-lived |
| Instagram | 60 days | Long-lived |
| Twitter | 2 hours | 6 months |
| LinkedIn | 60 days | 1 year |
| TikTok | 24 hours | Until revoked |
| YouTube | 1 hour | Until revoked |
| Pinterest | 30 days | Until revoked |

### Revoking Access

Users can disconnect accounts in the app, which:
1. Deletes tokens from database
2. Optionally revokes app access on platform (manual for now)

---

## Troubleshooting

### "OAuth not configured" Error

**Problem**: Platform credentials missing from `.env`

**Solution**:
```bash
# Check if environment variables are loaded
node -e "console.log(process.env.FACEBOOK_APP_ID)"

# Ensure .env file exists and is loaded
# Restart the server after adding variables
```

### "State mismatch" Error

**Problem**: CSRF protection failed or session expired

**Solution**:
- Session might have expired (10 minute timeout)
- Try connecting again
- Clear browser cookies and retry

### "Token exchange failed" Error

**Problem**: OAuth callback failed to exchange code for token

**Solution**:
1. Check redirect URI matches exactly (including trailing slash)
2. Verify client ID and secret are correct
3. Check platform API status
4. Review server logs for detailed error

### "Decryption failed" Error

**Problem**: `ENCRYPTION_KEY` changed or corrupted data

**Solution**:
- **DO NOT change** `ENCRYPTION_KEY` after encrypting data
- If key is lost, all tokens must be re-authorized
- Delete affected accounts and reconnect

### Tokens Not Refreshing

**Problem**: Background job not running or failing

**Solution**:
```bash
# Check server logs for token refresher
grep "Token Refresher" logs/server.log

# Verify accounts have refresh tokens
# Manually trigger refresh via API
```

---

## Security Best Practices

### Production Deployment

1. **Use HTTPS only** - OAuth callbacks must use HTTPS in production
2. **Rotate encryption key periodically** - Plan for key rotation strategy
3. **Monitor token refresh failures** - Set up alerts for repeated failures
4. **Limit token scopes** - Only request necessary permissions
5. **Use environment-specific keys** - Different keys for dev/staging/prod
6. **Secure session storage** - Use Redis or PostgreSQL for sessions
7. **Enable rate limiting** - Protect OAuth endpoints from abuse
8. **Log security events** - Monitor for suspicious OAuth activity

### Compliance

- **GDPR**: Users can delete their connected accounts
- **Data retention**: Tokens deleted when account disconnected
- **Access control**: Users can only access their own accounts
- **Audit logs**: Track OAuth connections and token refreshes

---

## API Reference

### Get Connected Accounts

```
GET /api/social/accounts
Authorization: Required (session cookie)

Response:
{
  "accounts": [
    {
      "id": "uuid",
      "platform": "facebook",
      "accountName": "My Page",
      "accountId": "123456789",
      "profileData": { ... },
      "isActive": true,
      "expiresAt": "2024-12-31T23:59:59Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Initiate OAuth Connection

```
GET /api/social/oauth/{platform}/connect
Authorization: Required

Response:
{
  "authUrl": "https://platform.com/oauth/authorize?..."
}
```

### Disconnect Account

```
DELETE /api/social/accounts/{id}
Authorization: Required

Response:
{
  "message": "Account disconnected successfully"
}
```

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review server logs for detailed errors
3. Verify environment variables are set correctly
4. Test OAuth flows in developer consoles

---

**Last Updated**: 2024
**Version**: 1.0.0
