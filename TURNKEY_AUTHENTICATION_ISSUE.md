# Turnkey Authentication Issue - Root Cause & Solution

## 🚨 Root Cause Identified

The Turnkey authentication modal is not showing authentication options (passkey/email) because:

### **Missing Environment Variables**

The project has `.env.example` but **no `.env.local` file** with actual Turnkey credentials.

```bash
# Current state
ls -la .env*
-rw-r--r-- 1 codespace root 510 Oct 12 22:10 .env.example        # ✅ Exists
-rw-r--r-- 1 codespace root 462 Oct 12 22:10 .env.local.example  # ✅ Exists
# ❌ .env.local is MISSING!
```

## 🔍 Why This Causes Issues

### 1. Modal Appears But Empty

Without environment variables:
- `handleLogin()` is called
- Turnkey tries to initialize
- **No Organization ID** → Can't fetch auth config
- **No Auth Proxy Config ID** → Can't show auth options
- Modal appears but with no content or broken UI

### 2. No Redirect After Authentication

Even if authentication somehow succeeds:
- Turnkey can't create wallets without proper org context
- Auth state might not update correctly
- Dashboard redirect fails

## ✅ Solution

### Step 1: Create `.env.local`

```bash
cp .env.example .env.local
```

### Step 2: Get Turnkey Credentials

You need to obtain these from [Turnkey Dashboard](https://app.turnkey.com):

1. **Sign up / Login** to Turnkey
2. **Create Organization** (if you haven't)
3. **Get Organization ID** from settings
4. **Create Auth Proxy Config**:
   - Go to Auth Proxy section
   - Click "Create New Config"
   - Enable authentication methods:
     - ✅ **Passkey** (recommended)
     - ✅ **Email** (optional fallback)
   - Add allowed domains:
     - `localhost:3000` (for development)
     - Your production domain (when deploying)
   - Save and copy the **Auth Proxy Config ID**

### Step 3: Update `.env.local`

```bash
# .env.local
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your-actual-org-id-here
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=your-actual-auth-proxy-config-id-here

# Other variables (optional for now)
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
```

**Important**:
- Replace `your-actual-org-id-here` with your real Organization ID
- Replace `your-actual-auth-proxy-config-id-here` with your real Auth Proxy Config ID
- IDs are typically UUIDs (format: `01234567-89ab-cdef-0123-456789abcdef`)

### Step 4: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🎯 Expected Behavior After Fix

### 1. Environment Check

When you open the app, you should see in browser console:

```
🔧 Turnkey Configuration: {
  organizationId: '✅ Set',
  authProxyConfigId: '✅ Set'
}
```

### 2. Authentication Flow

When you click "Sign In / Sign Up":

```
🔐 Starting Turnkey authentication...
📋 Environment check: { orgId: '✅ Set', authProxyId: '✅ Set' }
[Turnkey modal appears with authentication options]
```

### 3. Modal Content

The modal should display:
- ✅ "Continue with Passkey" button (if enabled)
- ✅ "Continue with Email" option (if enabled)
- ✅ OAuth providers (if configured)
- ✅ Clean, professional UI

### 4. After Authentication

```
✅ User authenticated: { session: {...} }
🔄 Auto-creating Stacks wallet after authentication...
✅ Wallet created successfully: wallet-id-here
[Redirect to Dashboard]
```

## 🛠️ Improvements Made

### 1. Added Environment Variable Checks

**File**: `src/components/WalletSetup.tsx`

```typescript
// Check if environment variables are set
const hasOrgId = !!process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID;
const hasAuthProxyId = !!process.env.NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID;
const isConfigured = hasOrgId && hasAuthProxyId;
```

### 2. Visual Warning for Missing Config

If environment variables are missing, users now see:

```
⚠️ Configuration Required

Turnkey environment variables are not set:
❌ NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID
❌ NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID

See ENVIRONMENT_SETUP.md for setup instructions.
```

### 3. Disabled Button When Not Configured

The "Sign In / Sign Up" button is disabled until environment variables are set.

### 4. Enhanced Logging

Added detailed console logs to help debug:
- Environment variable status
- Authentication flow steps
- Error messages with context

## 📋 Verification Checklist

Before testing:

- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID` is set with actual value
- [ ] `NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID` is set with actual value
- [ ] Values are real UUIDs from Turnkey dashboard (not example values)
- [ ] Development server restarted after creating `.env.local`

After setup:

- [ ] Open browser console (F12)
- [ ] See "✅ Set" for both environment variables
- [ ] Click "Sign In / Sign Up"
- [ ] Modal appears with authentication options
- [ ] Can authenticate with passkey or email
- [ ] Wallet is created automatically
- [ ] Redirected to dashboard

## 🐛 Troubleshooting

### Issue: Still no authentication options in modal

**Check**:
1. Environment variables are actually set (check console logs)
2. Turnkey Auth Proxy Config has authentication methods enabled
3. Domain `localhost:3000` is in allowed domains list
4. Browser supports WebAuthn (for passkey)

**Solution**:
1. Go to Turnkey dashboard
2. Edit your Auth Proxy Config
3. Ensure at least one method is enabled (Passkey or Email)
4. Add `localhost:3000` to allowed domains
5. Save changes
6. Restart your app

### Issue: "Invalid organization" error

**Check**:
1. Organization ID is correct
2. Organization is active in Turnkey dashboard
3. No typos in `.env.local`

**Solution**:
1. Copy Organization ID directly from Turnkey dashboard
2. Paste into `.env.local` without quotes
3. Restart server

### Issue: "Invalid auth proxy config" error

**Check**:
1. Auth Proxy Config ID is correct
2. Config is active in Turnkey dashboard
3. No typos in `.env.local`

**Solution**:
1. Copy Auth Proxy Config ID directly from Turnkey dashboard
2. Paste into `.env.local` without quotes
3. Restart server

## 📚 Documentation

Created comprehensive guides:

1. **ENVIRONMENT_SETUP.md** - Complete environment setup guide
2. **TURNKEY_AUTHENTICATION_ISSUE.md** - This document
3. **TURNKEY_MODAL_FIX.md** - Modal styling fix
4. **TURNKEY_MODAL_SUMMARY.md** - Complete modal implementation

## 🎓 Key Learnings

1. **Environment variables are critical** - Turnkey can't work without them
2. **Check configuration first** - Most issues are due to missing/incorrect config
3. **Use console logs** - They help identify issues quickly
4. **Visual feedback helps** - Show users when config is missing
5. **Documentation matters** - Clear setup instructions prevent issues

## 🚀 Next Steps

1. **Create `.env.local`** with your Turnkey credentials
2. **Restart development server**
3. **Test authentication flow**
4. **Verify wallet creation**
5. **Confirm dashboard access**

## 📞 Getting Help

If you still have issues after following this guide:

1. Check browser console for specific error messages
2. Verify all steps in ENVIRONMENT_SETUP.md
3. Ensure Turnkey dashboard configuration is complete
4. Try with a different browser
5. Check Turnkey status page for service issues

## ✨ Summary

**Problem**: No authentication options in Turnkey modal
**Root Cause**: Missing `.env.local` file with Turnkey credentials
**Solution**: Create `.env.local` with Organization ID and Auth Proxy Config ID
**Result**: Modal displays authentication options, users can login, wallet auto-creates, dashboard loads

---

**Remember**: The Turnkey modal needs valid credentials to fetch and display authentication options. Without them, it can't show passkey or email authentication!
