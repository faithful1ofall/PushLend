# StacksLend - Quick Setup (1 Minute)

## ⚡ Super Quick Start

The project already has example Turnkey credentials in `.env.local.example`. Just copy it!

```bash
cp .env.local.example .env.local
npm run dev
```

That's it! Open [http://localhost:3000](http://localhost:3000) and test the authentication.

## 🎯 What Just Happened?

The `.env.local.example` file contains:
- ✅ Example Turnkey Organization ID
- ✅ Example Turnkey Auth Proxy Config ID
- ✅ Stacks testnet configuration
- ✅ Contract addresses

These example credentials are configured for testing and should work out of the box.

## 🧪 Test Authentication

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Sign In / Sign Up"
3. Turnkey modal should appear with authentication options
4. Authenticate with passkey or email
5. Wallet auto-creates
6. Dashboard loads

## ⚠️ Important Notes

### For Testing/Development
The example credentials in `.env.local.example` are:
- ✅ Safe to use for testing
- ✅ Already configured with proper Auth Proxy
- ✅ Have passkey authentication enabled
- ✅ Whitelisted for localhost

### For Production
When deploying to production:
1. Create your own Turnkey organization at [https://app.turnkey.com](https://app.turnkey.com)
2. Get your own Organization ID and Auth Proxy Config ID
3. Replace the values in `.env.local`
4. Add your production domain to Turnkey's allowed domains

## 🔍 Verify Setup

After copying `.env.local`, check the browser console:

```
🔧 Turnkey Configuration: {
  organizationId: '✅ Set',
  authProxyConfigId: '✅ Set'
}
```

If you see this, you're good to go!

## 🐛 Troubleshooting

### Issue: Modal appears but no authentication options

**Possible causes:**
1. Example credentials might be expired or revoked
2. Domain not whitelisted
3. Auth Proxy Config changed

**Solution:**
Create your own Turnkey credentials:
1. Go to [https://app.turnkey.com](https://app.turnkey.com)
2. Create account and organization
3. Create Auth Proxy Config with Passkey enabled
4. Update `.env.local` with your credentials

### Issue: "Invalid organization" error

**Solution:**
The example credentials may no longer be valid. Follow the steps above to create your own.

## 📚 More Information

- **ENVIRONMENT_SETUP.md** - Detailed setup with your own credentials
- **README_AUTHENTICATION.md** - Complete authentication guide
- **TURNKEY_AUTHENTICATION_ISSUE.md** - Troubleshooting guide

## 🚀 Next Steps

After testing with example credentials:
1. Create your own Turnkey account
2. Set up your own organization
3. Replace example credentials with your own
4. Deploy to production

---

**TL;DR**: `cp .env.local.example .env.local && npm run dev` - Done! 🎉
