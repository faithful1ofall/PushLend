# 🚀 StacksLend - START HERE

## ⚡ Quick Setup (30 Seconds)

Your project already has example Turnkey credentials! Just run:

```bash
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're ready to test!

## ✅ What's Already Configured

The `.env.local.example` file includes:

```bash
# Turnkey Configuration (Example credentials for testing)
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=56c4797e-7157-4612-aeb4-2f9488cc247f
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=ab3da80d-010b-4988-9b62-31201d8fde2a

# Stacks Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X
NEXT_PUBLIC_CONTRACT_NAME=stackslend-simple
```

These example credentials are:
- ✅ Pre-configured for testing
- ✅ Have passkey authentication enabled
- ✅ Whitelisted for localhost
- ✅ Ready to use immediately

## 🎯 Test the Authentication Flow

### 1. Start the App
```bash
npm run dev
```

### 2. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

### 3. Check Console
Open browser console (F12) and verify:
```
🔧 Turnkey Configuration: {
  organizationId: '✅ Set',
  authProxyConfigId: '✅ Set'
}
```

### 4. Test Authentication
1. Click "Sign In / Sign Up"
2. Turnkey modal appears
3. See "Continue with Passkey" button
4. Authenticate with your device's biometric or PIN
5. Wallet auto-creates
6. Dashboard loads

## 📊 Expected Flow

```
Click "Sign In / Sign Up"
         ↓
Turnkey modal appears
         ↓
"Continue with Passkey" button visible
         ↓
Authenticate with biometric/PIN
         ↓
Modal closes
         ↓
"Creating Your Wallet" screen
         ↓
Dashboard loads with Stacks address
```

## 🔍 Verification

### ✅ Success Indicators

You'll know it's working when:
1. No warning messages on login page
2. "Sign In / Sign Up" button is enabled (not grayed out)
3. Console shows "✅ Set" for environment variables
4. Modal appears with authentication options
5. Can authenticate with passkey
6. Wallet is created automatically
7. Dashboard shows your Stacks address

### ❌ Common Issues

**Issue**: Button is disabled with yellow warning

**Cause**: `.env.local` file doesn't exist

**Solution**: 
```bash
cp .env.local.example .env.local
```

**Issue**: Modal appears but empty/no authentication options

**Cause**: Example credentials may be expired

**Solution**: Create your own Turnkey credentials (see below)

## 🔐 Using Your Own Credentials (Optional)

For production or if example credentials don't work:

### 1. Create Turnkey Account
- Go to [https://app.turnkey.com](https://app.turnkey.com)
- Sign up and create organization
- Copy your Organization ID

### 2. Create Auth Proxy Config
- In Turnkey dashboard, go to "Auth Proxy"
- Click "Create New Config"
- Enable "Passkey" authentication
- Add `localhost:3000` to allowed domains
- Copy your Auth Proxy Config ID

### 3. Update `.env.local`
Replace the example values with your own:
```bash
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your-org-id-here
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=your-auth-proxy-id-here
```

### 4. Restart Server
```bash
npm run dev
```

## 📚 Documentation

### Quick References
- **QUICK_SETUP.md** - This guide in more detail
- **ENVIRONMENT_SETUP.md** - Detailed environment configuration
- **README_AUTHENTICATION.md** - Complete authentication guide

### Technical Details
- **TURNKEY_MODAL_FIX.md** - How the modal styling works
- **TURNKEY_AUTHENTICATION_ISSUE.md** - Troubleshooting guide
- **AUTHENTICATION_FLOW.md** - Complete authentication flow
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 🎓 Key Features

### Authentication
- 🔐 **Passkey Authentication** - WebAuthn standard, biometric login
- 📧 **Email Authentication** - Fallback option (if configured)
- 🔒 **Secure** - No passwords, phishing resistant

### Wallet Management
- 🎯 **Auto-Creation** - Wallet created automatically after login
- 💼 **Embedded** - No browser extensions needed
- 🔑 **Self-Custody** - You control your keys

### Stacks Integration
- ⚡ **Native STX** - Transfer and manage STX tokens
- 🪙 **sBTC Support** - Use Bitcoin on Stacks
- 📝 **Smart Contracts** - Interact with lending contracts

## 🐛 Troubleshooting

### Quick Fixes

**Problem**: Button disabled
```bash
# Solution
cp .env.local.example .env.local
npm run dev
```

**Problem**: Modal empty
```bash
# Check console for errors
# May need to create your own Turnkey credentials
```

**Problem**: Authentication fails
```bash
# Ensure using modern browser (Chrome, Firefox, Safari, Edge)
# Check browser supports WebAuthn
```

## 🆘 Need Help?

1. Check browser console for error messages
2. Read **ENVIRONMENT_SETUP.md** for detailed setup
3. See **TURNKEY_AUTHENTICATION_ISSUE.md** for common problems
4. Verify all environment variables are set correctly

## 🎉 You're Ready!

The project is configured and ready to test. Just:

```bash
cp .env.local.example .env.local
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and click "Sign In / Sign Up"!

---

**TL;DR**: Copy `.env.local.example` to `.env.local`, run `npm run dev`, and test! 🚀
