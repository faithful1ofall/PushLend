# PushLend Troubleshooting Guide

## Wallet Connection Issues

### Issue: "Wallet creation not working" or "Connection fails"

#### Quick Fixes

1. **Clear Browser Cache**
   ```
   - Chrome: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Select "Cached images and files"
   - Clear data and refresh page
   ```

2. **Check Browser Console**
   ```
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for error messages (red text)
   - Share errors if asking for help
   ```

3. **Try Different Login Method**
   - If email fails → Try Google login
   - If Google fails → Try wallet connection
   - If wallet fails → Try email

4. **Disable Browser Extensions**
   - Ad blockers can interfere
   - Privacy extensions may block connections
   - Try in Incognito/Private mode

5. **Check Network Connection**
   - Ensure stable internet
   - Try refreshing the page
   - Check if Push Network is accessible

---

## Common Issues & Solutions

### 1. Email OTP Not Received

**Problem:** Email verification code doesn't arrive

**Solutions:**
- Check spam/junk folder
- Wait 2-3 minutes (can be delayed)
- Try resending the code
- Use a different email provider (Gmail recommended)
- Try Google login instead

### 2. Google Login Fails

**Problem:** Google authentication doesn't complete

**Solutions:**
- Allow popups in browser settings
- Disable popup blockers
- Try in a different browser
- Clear cookies and try again
- Use email OTP instead

### 3. Wallet Connection Fails

**Problem:** MetaMask or other wallet won't connect

**Solutions:**
- Ensure wallet extension is installed
- Unlock your wallet
- Refresh the page
- Try connecting to Push Network manually first
- Check if wallet supports the network

### 4. "Account Not Created" Error

**Problem:** Connection succeeds but account isn't created

**Solutions:**
- Wait 30 seconds and refresh
- Check browser console for errors
- Try disconnecting and reconnecting
- Clear site data and try again

### 5. Transactions Fail

**Problem:** Transactions don't go through

**Solutions:**
- Ensure you have PC tokens (get from faucet)
- Check your balance
- Wait for previous transaction to complete
- Increase gas if prompted
- Try again after a few minutes

---

## Step-by-Step Connection Guide

### Method 1: Email Login (Recommended for First-Time Users)

1. Click "Connect Wallet" button
2. Select "Email" option
3. Enter your email address
4. Check email for verification code
5. Enter the 6-digit code
6. Wait for account creation (30 seconds)
7. You're connected! ✅

### Method 2: Google Login

1. Click "Connect Wallet" button
2. Select "Google" option
3. Choose your Google account
4. Authorize the connection
5. Wait for account creation
6. You're connected! ✅

### Method 3: Web3 Wallet (MetaMask, Phantom, etc.)

1. Install wallet extension if needed
2. Click "Connect Wallet" button
3. Select "Wallet" option
4. Choose your wallet from the list
5. Approve connection in wallet popup
6. Add Push Network if prompted
7. You're connected! ✅

---

## Network Configuration

If you need to manually add Push Network to your wallet:

### MetaMask Configuration

```
Network Name: Push Chain Donut Testnet
RPC URL: https://evm.rpc-testnet-donut-node1.push.org/
Chain ID: 42101
Currency Symbol: PC
Block Explorer: https://donut.push.network
```

### Steps to Add Network

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Click "Add a network manually"
5. Enter details above
6. Click "Save"

---

## Getting Test Tokens

### Push Network Faucet

1. Visit: https://faucet.push.org
2. Connect your wallet
3. Click "Request Tokens"
4. Wait for transaction
5. Check balance in app

**Note:** You need PC tokens to:
- Create loan offers
- Accept loan offers (as collateral)
- Create loan requests (as collateral)
- Repay loans
- Any transaction on the platform

---

## Browser Compatibility

### Recommended Browsers
- ✅ Chrome (latest version)
- ✅ Firefox (latest version)
- ✅ Brave (latest version)
- ✅ Edge (latest version)

### Not Recommended
- ❌ Internet Explorer
- ❌ Very old browser versions
- ❌ Browsers with strict privacy settings

---

## Debug Mode

### Enable Detailed Logging

1. Open browser console (F12)
2. Look for these messages:
   ```
   🚀 PushLend Universal App initialized
   📊 Connection Status: ...
   🔗 Push Chain Client: ...
   📍 Address: ...
   ```

3. If you see errors, note them down

### Common Console Messages

**Good Signs:**
```
✅ Connection Status: CONNECTED
✅ Push Chain Client: Available
✅ Address: 0x...
```

**Problem Signs:**
```
❌ Push Wallet Error: ...
❌ Connection Status: DISCONNECTED
❌ Push Chain Client: Not available
```

---

## Still Having Issues?

### Before Asking for Help

1. ✅ Tried all quick fixes above
2. ✅ Checked browser console for errors
3. ✅ Tried different login method
4. ✅ Tested in incognito mode
5. ✅ Have stable internet connection

### Where to Get Help

1. **GitHub Issues**
   - Repository: https://github.com/faithful1ofall/PushLend
   - Create new issue with:
     - Browser and version
     - Login method tried
     - Error messages from console
     - Steps to reproduce

2. **Push Network Discord**
   - Join: https://discord.com/invite/pushchain
   - Ask in #support channel
   - Provide error details

3. **Push Network Docs**
   - Visit: https://pushchain.github.io/push-chain-website/pr-preview/pr-1067/docs/
   - Check UI Kit documentation
   - Review troubleshooting guides

---

## Known Limitations

### Current Testnet Limitations

- ⚠️ Testnet only (no real money)
- ⚠️ Occasional network delays
- ⚠️ Faucet rate limits
- ⚠️ Some features in beta

### Browser Limitations

- ⚠️ Requires modern browser
- ⚠️ JavaScript must be enabled
- ⚠️ Cookies must be allowed
- ⚠️ Popups must be allowed for some logins

---

## Performance Tips

### For Best Experience

1. **Use Chrome or Firefox**
   - Best compatibility
   - Fastest performance

2. **Stable Internet**
   - Minimum 1 Mbps
   - Low latency preferred

3. **Keep Browser Updated**
   - Latest version recommended
   - Security patches important

4. **Disable Unnecessary Extensions**
   - Can slow down page
   - May interfere with wallet

---

## Security Notes

### Safe Practices

✅ **DO:**
- Use testnet only
- Keep browser updated
- Use strong passwords
- Enable 2FA when available
- Backup wallet if using Web3

❌ **DON'T:**
- Share private keys
- Use on public WiFi without VPN
- Click suspicious links
- Share verification codes
- Use real money on testnet

---

## FAQ

### Q: Do I need a wallet to use PushLend?
**A:** No! You can use email or Google login. No wallet required.

### Q: Which chains can I connect from?
**A:** Any chain! Ethereum, Solana, Polygon, etc. All work.

### Q: Is my data secure?
**A:** Yes. Push UI Kit uses secure authentication. No private keys stored in browser.

### Q: How long does connection take?
**A:** Usually 10-30 seconds. First time may take longer.

### Q: Can I use multiple accounts?
**A:** Yes, but use different emails or wallets for each.

### Q: What if I lose access?
**A:** For email/social: Use account recovery. For wallet: Use wallet recovery phrase.

### Q: Is this real money?
**A:** No! Testnet only. PC tokens have no real value.

### Q: Can I switch chains after connecting?
**A:** Yes, disconnect and reconnect with different wallet/chain.

---

## Emergency Reset

### If Nothing Works

1. **Complete Reset:**
   ```
   - Clear all browser data
   - Restart browser
   - Visit site in incognito
   - Try fresh connection
   ```

2. **Alternative Access:**
   ```
   - Try different browser
   - Try different device
   - Try different network
   - Try mobile if on desktop
   ```

3. **Last Resort:**
   ```
   - Wait 24 hours
   - Network may be under maintenance
   - Check Push Network status
   - Try again later
   ```

---

## Contact & Support

### Quick Links

- **Live App:** https://3000--019a1b2a-8808-7875-b580-6c9e05958938.eu-central-1-01.gitpod.dev
- **Contract:** https://donut.push.network/address/0x368831E75187948d722e3648C02C8D50d668a46c
- **Faucet:** https://faucet.push.org
- **Explorer:** https://donut.push.network
- **Docs:** https://pushchain.github.io/push-chain-website/pr-preview/pr-1067/docs/

### Community

- **Discord:** https://discord.com/invite/pushchain
- **GitHub:** https://github.com/faithful1ofall/PushLend
- **Push Network:** https://push.org

---

**Remember:** This is a testnet application for testing purposes only. No real money involved! 🎮
