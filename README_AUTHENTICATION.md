# StacksLend - Turnkey Authentication Setup

## 🚨 **IMPORTANT: Read This First!**

The Turnkey authentication modal **will not work** without proper environment configuration. This is the #1 issue users encounter.

## ⚡ Quick Start (3 Steps)

### 1. Get Turnkey Credentials

Visit [Turnkey Dashboard](https://app.turnkey.com) and:
- Create an account (if you don't have one)
- Create an organization
- Copy your **Organization ID**
- Create an Auth Proxy Config
- Enable **Passkey** authentication
- Add `localhost:3000` to allowed domains
- Copy your **Auth Proxy Config ID**

### 2. Set Up Environment

**Option A: Use the setup script**
```bash
./setup-env.sh
```

**Option B: Manual setup**
```bash
cp .env.example .env.local
# Edit .env.local with your actual Turnkey credentials
```

### 3. Start Development Server

```bash
npm run dev
```

## 🎯 What You Should See

### ✅ Correct Setup

**In Browser Console:**
```
🔧 Turnkey Configuration: {
  organizationId: '✅ Set',
  authProxyConfigId: '✅ Set'
}
```

**In UI:**
- "Sign In / Sign Up" button is enabled
- No warning messages
- Clicking button opens modal with authentication options

### ❌ Incorrect Setup

**In Browser Console:**
```
🔧 Turnkey Configuration: {
  organizationId: '❌ Missing',
  authProxyConfigId: '❌ Missing'
}
```

**In UI:**
- Yellow warning box appears
- "Sign In / Sign Up" button is disabled
- Message: "Configuration Required"

## 🔍 Understanding the Issue

### Why Modal Shows No Authentication Options

The Turnkey modal needs to fetch your authentication configuration from Turnkey's servers. Without valid credentials:

1. **No Organization ID** → Can't identify your Turnkey organization
2. **No Auth Proxy Config ID** → Can't fetch authentication methods
3. **Result**: Empty or broken modal

### Why No Redirect After Login

Even if authentication somehow works:
- Turnkey can't create wallets without organization context
- Auth state doesn't update properly
- Dashboard redirect fails

## 📋 Complete Setup Guide

### Step 1: Turnkey Account Setup

1. Go to [https://app.turnkey.com](https://app.turnkey.com)
2. Click "Sign Up" or "Get Started"
3. Complete registration and verify email
4. You'll be prompted to create an organization

### Step 2: Create Organization

1. Give your organization a name (e.g., "StacksLend Dev")
2. Complete the setup wizard
3. **Important**: Copy your Organization ID
   - Format: `01234567-89ab-cdef-0123-456789abcdef`
   - Save it somewhere safe

### Step 3: Create Auth Proxy Config

1. In Turnkey dashboard, go to "Auth Proxy"
2. Click "Create New Config" or "Add Configuration"
3. Configure authentication methods:
   - ✅ **Enable Passkey** (recommended)
   - ✅ **Enable Email** (optional, for fallback)
   - ⬜ OAuth (optional, for social login)
4. Set allowed domains:
   - Add `localhost:3000` for development
   - Add `127.0.0.1:3000` as backup
   - Add your production domain when deploying
5. Click "Create" or "Save"
6. **Important**: Copy your Auth Proxy Config ID
   - Format: `98765432-10fe-dcba-9876-543210fedcba`
   - Save it somewhere safe

### Step 4: Create `.env.local`

Create a file named `.env.local` in your project root:

```bash
# Turnkey Configuration (REQUIRED)
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=01234567-89ab-cdef-0123-456789abcdef
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=98765432-10fe-dcba-9876-543210fedcba

# Stacks Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so

# Smart Contract Configuration (optional)
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address-here

# sBTC Token Contract (testnet)
NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_SBTC_CONTRACT_NAME=sbtc-token
```

**Important**:
- Replace the example IDs with your actual IDs from Turnkey
- Don't use quotes around the values
- Don't commit this file to git (it's in `.gitignore`)

### Step 5: Restart Development Server

```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

## 🧪 Testing

### 1. Open Application

Navigate to `http://localhost:3000`

### 2. Check Console

Open browser console (F12) and verify:
```
🔧 Turnkey Configuration: {
  organizationId: '✅ Set',
  authProxyConfigId: '✅ Set'
}
```

### 3. Test Authentication

1. Click "Sign In / Sign Up"
2. Modal should appear with:
   - "Continue with Passkey" button
   - "Continue with Email" option (if enabled)
   - Clean, professional UI
3. Click "Continue with Passkey"
4. Browser prompts for biometric or PIN
5. Authenticate
6. Modal closes
7. See "Creating Your Wallet" screen
8. Automatically redirected to Dashboard

### 4. Verify Wallet Creation

In console, you should see:
```
✅ User authenticated: { session: {...} }
🔄 Auto-creating Stacks wallet after authentication...
✅ Wallet created successfully: wallet-id-here
```

## 🐛 Troubleshooting

### Issue: Button is Disabled

**Symptoms**: "Sign In / Sign Up" button is grayed out

**Cause**: Environment variables not set

**Solution**:
1. Check if `.env.local` exists
2. Verify it contains both required variables
3. Restart development server
4. Refresh browser

### Issue: Modal Appears But Empty

**Symptoms**: Modal opens but shows no authentication options

**Causes**:
1. Invalid Organization ID
2. Invalid Auth Proxy Config ID
3. Auth Proxy Config has no authentication methods enabled
4. Domain not whitelisted

**Solutions**:
1. Verify IDs in Turnkey dashboard
2. Check Auth Proxy Config has Passkey or Email enabled
3. Ensure `localhost:3000` is in allowed domains
4. Restart app after making changes

### Issue: "Invalid Organization" Error

**Symptoms**: Error message about invalid organization

**Cause**: Organization ID is incorrect or organization is inactive

**Solution**:
1. Go to Turnkey dashboard
2. Copy Organization ID directly
3. Paste into `.env.local`
4. Ensure no extra spaces or quotes
5. Restart server

### Issue: Authentication Succeeds But No Redirect

**Symptoms**: Modal closes after auth but stays on login page

**Causes**:
1. Wallet creation failing
2. Auth state not updating
3. JavaScript errors

**Solutions**:
1. Check browser console for errors
2. Look for wallet creation logs
3. Verify `authState` is `Authenticated`
4. Check `wallets` array is populated

## 📚 Documentation

- **ENVIRONMENT_SETUP.md** - Detailed environment setup guide
- **TURNKEY_AUTHENTICATION_ISSUE.md** - Root cause analysis
- **TURNKEY_MODAL_FIX.md** - Modal styling implementation
- **QUICK_START_GUIDE.md** - General quick start guide

## 🔗 Resources

- [Turnkey Dashboard](https://app.turnkey.com)
- [Turnkey Documentation](https://docs.turnkey.com)
- [Getting Started Guide](https://docs.turnkey.com/sdks/react/getting-started)
- [Auth Proxy Setup](https://docs.turnkey.com/features/auth-proxy)
- [WebAuthn Guide](https://webauthn.guide)

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID` is set with real UUID
- [ ] `NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID` is set with real UUID
- [ ] Values are from Turnkey dashboard (not example values)
- [ ] No quotes around values in `.env.local`
- [ ] Development server restarted after creating `.env.local`
- [ ] Browser console shows "✅ Set" for both variables
- [ ] Turnkey Auth Proxy has Passkey or Email enabled
- [ ] `localhost:3000` is in allowed domains list
- [ ] Using a modern browser (Chrome, Firefox, Safari, Edge)

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ No warning messages on login page
2. ✅ "Sign In / Sign Up" button is enabled
3. ✅ Console shows environment variables are set
4. ✅ Modal appears with authentication options
5. ✅ Can authenticate with passkey or email
6. ✅ Wallet is created automatically
7. ✅ Redirected to dashboard
8. ✅ Can see Stacks address and balances

## 🆘 Still Having Issues?

1. Read **ENVIRONMENT_SETUP.md** for detailed instructions
2. Check **TURNKEY_AUTHENTICATION_ISSUE.md** for common problems
3. Verify all steps in this guide
4. Check browser console for specific errors
5. Ensure Turnkey dashboard configuration is complete
6. Try with a different browser
7. Clear browser cache and cookies

---

**Remember**: 99% of authentication issues are due to missing or incorrect environment variables. Always check `.env.local` first!
