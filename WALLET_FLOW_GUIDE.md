# Turnkey Embedded Wallet Flow Guide

## Overview

StacksLend uses **Turnkey's Embedded Wallet** system where:
- **Sign Up** = Create new embedded wallet
- **Login** = Import existing embedded wallet
- **Export** = Backup wallet for future login

No browser extensions needed. Everything managed securely by Turnkey.

---

## 🆕 Sign Up Flow (New Users)

### Step 1: Choose "Sign Up"
```
User clicks "Sign Up" tab
```

### Step 2: Authenticate
```
Click "Create New Wallet"
→ Turnkey authentication modal appears
→ Choose auth method:
  - Email OTP
  - Passkey (biometric)
  - OAuth (Google, Apple, etc.)
→ Complete authentication
```

### Step 3: Wallet Created
```
After authentication:
→ createWallet() called with Stacks account config
→ Turnkey creates embedded wallet
→ Stacks account generated (m/44'/5757'/0'/0/0)
→ Stacks address derived (ST... format)
→ Dashboard loads
```

**Technical Details:**
```typescript
const { createWallet } = useTurnkey();

await createWallet({
  walletName: 'StacksLend Wallet',
  accounts: [{
    curve: 'CURVE_SECP256K1',
    pathFormat: 'PATH_FORMAT_BIP32',
    path: "m/44'/5757'/0'/0/0",
    addressFormat: 'ADDRESS_FORMAT_COMPRESSED',
  }],
});
```

### Step 4: ⚠️ EXPORT WALLET (Critical!)
```
Yellow banner appears: "Don't forget to backup your wallet!"
→ Click "Export Now"
→ Turnkey export modal appears
→ Choose export format:
  - Encrypted Bundle (recommended)
  - Mnemonic Phrase
  - Private Key
→ Save securely
```

**Why Export?**
- This is your ONLY way to login again later
- Without export, you lose access if you logout
- Export = your wallet backup

---

## 🔑 Login Flow (Returning Users)

### Step 1: Choose "Login"
```
User clicks "Login" tab
```

### Step 2: Import Wallet
```
Click "Import Existing Wallet"
→ Turnkey authentication modal appears
→ Authenticate (same method as sign up)
→ After auth, import modal appears
→ Choose import method:
  - Upload encrypted bundle
  - Enter mnemonic phrase
  - Enter private key
→ Wallet imported
→ Dashboard loads
```

**Technical Details:**
```typescript
const { handleLogin, handleImportWallet } = useTurnkey();

// Authenticate first
await handleLogin();

// Then import wallet
await handleImportWallet();
```

**What Happens:**
- Turnkey authenticates you
- You import your previously exported wallet
- Same Stacks address restored
- Access to your funds

---

## 📤 Export Flow (Backup Wallet)

### When to Export

**Must Export:**
- ✅ Immediately after sign up
- ✅ Before logging out
- ✅ Before clearing browser data

**Optional Export:**
- 📋 As regular backup
- 📋 To use on another device

### How to Export

**From Dashboard:**
```
Click "🔑 Export Wallet" button (top right)
→ Turnkey export modal appears
→ Choose format
→ Save securely
```

**From Banner:**
```
Yellow warning banner shows after sign up
→ Click "Export Now"
→ Same export modal
```

**Technical Details:**
```typescript
const { handleExportWallet, wallets } = useTurnkey();

await handleExportWallet({
  walletId: wallets[0].walletId,
});
```

### Export Formats

**1. Encrypted Bundle (Recommended)**
```
✅ Most secure
✅ Password protected
✅ Easy to import
📁 Saves as .json file
```

**2. Mnemonic Phrase**
```
✅ 12 or 24 words
✅ Industry standard
⚠️ Write down carefully
⚠️ Store securely
```

**3. Private Key**
```
⚠️ Most sensitive
⚠️ Use with caution
⚠️ Never share
🔐 Hex string format
```

---

## 🔄 Complete User Journey

### First Time User

```
1. Visit StacksLend
2. Click "Sign Up"
3. Click "Create New Wallet"
4. Authenticate (email OTP)
5. ✅ Wallet created
6. ⚠️ Export wallet (CRITICAL!)
7. Get testnet STX from faucet
8. Start lending/borrowing
9. Logout when done
```

### Returning User

```
1. Visit StacksLend
2. Click "Login"
3. Click "Import Existing Wallet"
4. Authenticate (same method)
5. Import wallet (upload backup)
6. ✅ Wallet restored
7. Continue lending/borrowing
```

---

## 🔐 Security Best Practices

### For Users

**DO:**
- ✅ Export wallet immediately after sign up
- ✅ Store backup in secure location
- ✅ Use strong authentication (passkey > email OTP)
- ✅ Keep multiple backups
- ✅ Test import before relying on it

**DON'T:**
- ❌ Skip wallet export
- ❌ Share private key/mnemonic
- ❌ Store backup in plain text
- ❌ Email backup to yourself
- ❌ Screenshot private key

### Storage Recommendations

**Encrypted Bundle:**
```
✅ Password manager (1Password, Bitwarden)
✅ Encrypted cloud storage
✅ USB drive (encrypted)
```

**Mnemonic Phrase:**
```
✅ Paper backup (fireproof safe)
✅ Metal backup (Cryptosteel)
✅ Split across locations
```

**Private Key:**
```
✅ Hardware security module
✅ Encrypted file
⚠️ Never in plain text
```

---

## 🎯 Key Differences from Traditional Wallets

### Traditional Wallet (MetaMask, Leather)

```
User installs browser extension
→ Extension manages keys
→ User signs in extension
→ Keys stored in browser
→ Backup = seed phrase
```

### Turnkey Embedded Wallet

```
No extension needed
→ Turnkey manages keys (secure enclaves)
→ User authenticates (email/passkey/OAuth)
→ Keys never in browser
→ Backup = export wallet
```

**Advantages:**
- ✅ Better UX (no extension)
- ✅ More secure (HSM storage)
- ✅ Multiple auth methods
- ✅ Cross-device support
- ✅ No seed phrase to memorize

**Trade-offs:**
- ⚠️ Must export for backup
- ⚠️ Depends on Turnkey service
- ⚠️ Different from traditional flow

---

## 🧪 Testing the Flow

### Test Sign Up

```bash
1. Open app in incognito window
2. Click "Sign Up"
3. Create wallet with email OTP
4. Verify wallet created
5. Export wallet
6. Save backup file
7. Logout
```

### Test Login

```bash
1. Open app in new incognito window
2. Click "Login"
3. Import wallet
4. Upload backup file
5. Verify same address restored
6. Check balance matches
```

### Test Export

```bash
1. After sign up, click "Export Now"
2. Choose "Encrypted Bundle"
3. Set password
4. Download file
5. Verify file saved
6. Test import in new session
```

---

## 🐛 Troubleshooting

### "No wallet found after authentication"

**Cause:** Wallet creation failed  
**Solution:**
```
1. Check browser console for errors
2. Refresh page
3. Try authenticating again
4. Check Turnkey dashboard for wallet
```

### "Import failed"

**Cause:** Wrong backup file or password  
**Solution:**
```
1. Verify correct backup file
2. Check password (case-sensitive)
3. Try different import method
4. Check file not corrupted
```

### "Lost wallet backup"

**Cause:** Didn't export or lost file  
**Solution:**
```
❌ Cannot recover without backup
✅ Prevention: Always export immediately
✅ Keep multiple backups
✅ Test import before relying on it
```

### "Export button not working"

**Cause:** Wallet not fully loaded  
**Solution:**
```
1. Wait for wallet to load
2. Check console for errors
3. Refresh page
4. Try again
```

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    StacksLend Entry                      │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         ┌──────▼──────┐         ┌─────▼──────┐
         │   Sign Up   │         │   Login    │
         └──────┬──────┘         └─────┬──────┘
                │                      │
         ┌──────▼──────┐         ┌─────▼──────┐
         │ Authenticate│         │Authenticate│
         └──────┬──────┘         └─────┬──────┘
                │                      │
         ┌──────▼──────┐         ┌─────▼──────┐
         │Create Wallet│         │Import Wallet│
         └──────┬──────┘         └─────┬──────┘
                │                      │
                └──────────┬───────────┘
                           │
                    ┌──────▼──────┐
                    │  Dashboard  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │⚠️ Export!   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │Use Platform │
                    └─────────────┘
```

---

## 💡 Pro Tips

### For New Users

1. **Export Immediately**
   - Don't skip the export step
   - Do it before doing anything else
   - Test the import right away

2. **Multiple Backups**
   - Export to encrypted bundle
   - Also write down mnemonic
   - Store in different locations

3. **Test Import**
   - Before relying on backup
   - Try importing in new session
   - Verify address matches

### For Developers

1. **Remind Users**
   - Show export banner prominently
   - Don't let them dismiss easily
   - Require export before first transaction

2. **Make Export Easy**
   - One-click export button
   - Clear instructions
   - Multiple format options

3. **Handle Errors**
   - Clear error messages
   - Retry mechanisms
   - Support contact info

---

## 📞 Support

### User Issues

**Lost Backup:**
- ❌ Cannot recover without backup
- Contact support for guidance
- Learn from mistake, export next time

**Import Problems:**
- Check file format
- Verify password
- Try different browser
- Contact Turnkey support

**Authentication Issues:**
- Check email for OTP
- Try different auth method
- Clear browser cache
- Contact Turnkey support

### Developer Resources

- **Turnkey Docs:** https://docs.turnkey.com/sdks/react
- **Turnkey Dashboard:** https://app.turnkey.com/dashboard
- **Turnkey Slack:** https://join.slack.com/t/clubturnkey/...

---

## ✅ Checklist

### For Users

- [ ] Understand sign up = create wallet
- [ ] Understand login = import wallet
- [ ] Know to export immediately
- [ ] Have secure storage for backup
- [ ] Tested import before relying on it
- [ ] Have multiple backups
- [ ] Never share private key

### For Developers

- [ ] Sign up flow implemented
- [ ] Login flow implemented
- [ ] Export reminder shown
- [ ] Export button prominent
- [ ] Import tested
- [ ] Error handling in place
- [ ] User documentation clear

---

**Remember:** Export your wallet immediately after sign up. This is your only way to login again!

**Status:** ✅ Implemented and ready for testing  
**Last Updated:** 2025-10-10
