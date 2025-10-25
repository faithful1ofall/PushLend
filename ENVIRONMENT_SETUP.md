# Environment Setup Guide

## 🚨 Critical: Environment Variables Required

The Turnkey authentication modal **will not work** without proper environment variables. This is the most common issue!

## ⚡ Quick Setup

### 1. Create `.env.local` file

```bash
cp .env.example .env.local
```

### 2. Get Your Turnkey Credentials

You need to get these from your Turnkey dashboard:

1. Go to [Turnkey Dashboard](https://app.turnkey.com)
2. Sign in or create an account
3. Create a new organization (if you haven't already)
4. Get your credentials:
   - **Organization ID**: Found in your organization settings
   - **Auth Proxy Config ID**: Created in the Auth Proxy section

### 3. Update `.env.local`

```bash
# Turnkey Configuration
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your-actual-org-id-here
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=your-actual-auth-proxy-config-id-here

# Stacks Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so

# Smart Contract Configuration (optional for now)
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address-here

# sBTC Token Contract (testnet)
NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_SBTC_CONTRACT_NAME=sbtc-token
```

### 4. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 📋 Detailed Turnkey Setup

### Step 1: Create Turnkey Account

1. Visit [https://app.turnkey.com](https://app.turnkey.com)
2. Click "Sign Up" or "Get Started"
3. Complete the registration process
4. Verify your email

### Step 2: Create Organization

1. After login, you'll be prompted to create an organization
2. Give it a name (e.g., "StacksLend Development")
3. Complete the setup wizard
4. **Copy your Organization ID** - you'll need this!

### Step 3: Create Auth Proxy Config

1. In your Turnkey dashboard, navigate to "Auth Proxy"
2. Click "Create New Config" or "Add Configuration"
3. Configure authentication methods:
   - ✅ **Passkey** (recommended - enable this!)
   - ✅ **Email** (optional - enable for fallback)
   - ⬜ **OAuth** (optional - Google, Apple, etc.)
4. Set allowed domains:
   - Add `localhost:3000` for development
   - Add your production domain when deploying
5. Click "Create" or "Save"
6. **Copy your Auth Proxy Config ID** - you'll need this!

### Step 4: Configure Environment Variables

Create `.env.local` with your actual values:

```bash
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=01234567-89ab-cdef-0123-456789abcdef
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=98765432-10fe-dcba-9876-543210fedcba
```

**Important**: 
- These are example IDs - use your actual IDs from Turnkey dashboard
- IDs are typically in UUID format (8-4-4-4-12 characters)
- Don't use quotes around the values

## 🔍 Verify Setup

### Check Environment Variables

Add this to your component to verify:

```typescript
console.log('Environment Check:', {
  orgId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID ? '✅ Set' : '❌ Missing',
  authProxyId: process.env.NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID ? '✅ Set' : '❌ Missing',
});
```

### Expected Console Output

When you click "Sign In / Sign Up", you should see:

```
🔐 Starting Turnkey authentication...
📋 Environment check: { orgId: '✅ Set', authProxyId: '✅ Set' }
🔧 Turnkey Configuration: { organizationId: '✅ Set', authProxyConfigId: '✅ Set' }
```

### If Variables Are Missing

You'll see:

```
📋 Environment check: { orgId: '❌ Missing', authProxyId: '❌ Missing' }
❌ Turnkey error: [Error details]
```

**Solution**: Create `.env.local` with proper values and restart server.

## 🐛 Troubleshooting

### Issue: Modal doesn't appear

**Symptoms**:
- Click "Sign In / Sign Up"
- Nothing happens
- No modal appears

**Causes**:
1. ❌ Environment variables not set
2. ❌ Invalid Organization ID
3. ❌ Invalid Auth Proxy Config ID
4. ❌ Domain not whitelisted in Turnkey

**Solutions**:
1. Create `.env.local` with correct values
2. Verify IDs in Turnkey dashboard
3. Restart development server
4. Check browser console for errors

### Issue: Modal appears but no authentication options

**Symptoms**:
- Modal appears
- No "Continue with Passkey" button
- No "Continue with Email" option
- Empty or broken UI

**Causes**:
1. ❌ Auth Proxy Config not properly set up
2. ❌ No authentication methods enabled
3. ❌ Domain not whitelisted

**Solutions**:
1. Go to Turnkey dashboard → Auth Proxy
2. Edit your Auth Proxy Config
3. Enable at least one authentication method:
   - ✅ Passkey (recommended)
   - ✅ Email (fallback)
4. Add `localhost:3000` to allowed domains
5. Save changes
6. Restart your app

### Issue: Authentication fails

**Symptoms**:
- Modal appears with options
- Click "Continue with Passkey" or "Continue with Email"
- Error message appears
- Authentication fails

**Causes**:
1. ❌ Browser doesn't support WebAuthn (for passkey)
2. ❌ Domain mismatch
3. ❌ Network issues
4. ❌ Turnkey service issues

**Solutions**:
1. Use a modern browser (Chrome, Firefox, Safari, Edge)
2. Verify domain is whitelisted in Turnkey
3. Check network connection
4. Check Turnkey status page

### Issue: Authenticated but no redirect

**Symptoms**:
- Authentication succeeds
- Modal closes
- Still on login page
- Not redirected to dashboard

**Causes**:
1. ❌ Auth state not updating
2. ❌ Wallet creation failing
3. ❌ React state issues

**Solutions**:
1. Check browser console for errors
2. Look for wallet creation logs
3. Verify `authState` is updating
4. Check `wallets` array is populated

## 📝 Example `.env.local`

```bash
# Turnkey Configuration (REQUIRED)
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=01234567-89ab-cdef-0123-456789abcdef
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=98765432-10fe-dcba-9876-543210fedcba

# Stacks Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so

# Smart Contract Configuration (optional)
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.stackslend

# sBTC Token Contract (testnet)
NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_SBTC_CONTRACT_NAME=sbtc-token
```

## ✅ Verification Checklist

Before testing authentication:

- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID` is set
- [ ] `NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID` is set
- [ ] Values are actual UUIDs from Turnkey dashboard
- [ ] No quotes around values
- [ ] Development server restarted after creating `.env.local`
- [ ] Browser console shows "✅ Set" for both variables
- [ ] Turnkey Auth Proxy has passkey or email enabled
- [ ] `localhost:3000` is in allowed domains list

## 🚀 Testing

After setup:

1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Open browser console (F12)
4. Click "Sign In / Sign Up"
5. Check console for environment check logs
6. Verify modal appears with authentication options
7. Test authentication with passkey or email
8. Verify redirect to dashboard after success

## 📚 Additional Resources

- [Turnkey Documentation](https://docs.turnkey.com)
- [Turnkey Dashboard](https://app.turnkey.com)
- [Getting Started Guide](https://docs.turnkey.com/sdks/react/getting-started)
- [Auth Proxy Setup](https://docs.turnkey.com/features/auth-proxy)

## 🆘 Still Having Issues?

1. Check browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Turnkey dashboard configuration is complete
4. Try with a different browser
5. Clear browser cache and cookies
6. Restart development server

---

**Remember**: The most common issue is missing or incorrect environment variables. Always check `.env.local` first!
