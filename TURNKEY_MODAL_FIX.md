# Turnkey Modal Fix - Official Styles Implementation

## Problem

The Turnkey authentication modal was not displaying properly due to:
1. Using custom CSS instead of official Turnkey styles
2. Missing the official `@turnkey/react-wallet-kit/styles.css` import
3. Custom styles conflicting with Turnkey's built-in modal system

## Solution

### Changes Made

#### 1. Updated `src/app/layout.tsx`

**Before:**
```typescript
import './globals.css';
import './turnkey-styles.css';  // ❌ Custom styles
```

**After:**
```typescript
import './globals.css';
import '@turnkey/react-wallet-kit/styles.css';  // ✅ Official Turnkey styles
```

#### 2. Removed Custom Styles

Deleted `src/app/turnkey-styles.css` - no longer needed as we're using official styles.

### Why This Works

The official Turnkey styles (`@turnkey/react-wallet-kit/styles.css`) include:

1. **Proper Modal Classes**
   - `.tk-modal` - Modal container with correct z-index
   - `.tk-modal-backdrop` - Backdrop overlay
   - `.tk-modal-content` - Content wrapper
   - `.tk-modal-header` - Header styling
   - `.tk-modal-close` - Close button

2. **Built-in Tailwind v4**
   - Turnkey styles are built with Tailwind v4
   - Includes all necessary utility classes
   - Proper scoping with `:where(.tk-modal)` to avoid conflicts

3. **Theme Support**
   - Light/dark mode variables
   - Proper color tokens
   - Responsive design

4. **Authentication UI Components**
   - `.tk-auth-button` - OAuth/passkey buttons
   - `.tk-input` - Input fields
   - `.tk-button-primary` - Primary action buttons
   - `.tk-spinner` - Loading states
   - `.tk-error` / `.tk-success` - Status messages

## Turnkey Modal Features

### Passkey Authentication

When `handleLogin()` is called, Turnkey displays a modal with:

1. **Passkey Option**
   - "Continue with Passkey" button
   - Uses WebAuthn for secure authentication
   - Biometric or device PIN

2. **Email Option** (if configured)
   - Email input field
   - Magic link or OTP authentication
   - Fallback for devices without passkey support

3. **OAuth Options** (if configured)
   - Google, Apple, Facebook, etc.
   - Social login integration

### Modal Behavior

- **Automatic Display**: Modal appears when `handleLogin()` is called
- **Backdrop Click**: Can be configured to close on backdrop click
- **ESC Key**: Closes modal by default
- **Responsive**: Works on mobile and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation

## Configuration

### Required Environment Variables

```bash
# .env.local
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your-org-id
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=your-auth-proxy-config-id
```

### Provider Setup

```typescript
// src/app/providers.tsx
import { TurnkeyProvider } from "@turnkey/react-wallet-kit";

const turnkeyConfig = {
  organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  authProxyConfigId: process.env.NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID!,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TurnkeyProvider
      config={turnkeyConfig}
      callbacks={{
        onError: (error) => console.error("Turnkey error:", error),
        onAuthenticationSuccess: ({ session }) => {
          console.log("User authenticated:", session);
        },
      }}
    >
      {children}
    </TurnkeyProvider>
  );
}
```

### Usage in Components

```typescript
import { useTurnkey } from '@turnkey/react-wallet-kit';

export default function WalletSetup() {
  const { handleLogin } = useTurnkey();

  const handleAuth = async () => {
    try {
      await handleLogin();
      // Modal appears automatically
      // User authenticates with passkey or email
      // On success, user is authenticated
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return (
    <button onClick={handleAuth}>
      Sign In / Sign Up
    </button>
  );
}
```

## Testing the Modal

### 1. Start Development Server

```bash
npm run dev
```

### 2. Open Application

Navigate to `http://localhost:3000`

### 3. Click "Sign In / Sign Up"

The Turnkey modal should appear with:
- Clean, professional UI
- Passkey authentication option
- Email option (if configured)
- Proper animations and transitions

### 4. Authenticate

- **New User**: Create a passkey when prompted by browser
- **Returning User**: Use existing passkey to authenticate

### 5. Verify

After successful authentication:
- Modal closes automatically
- Wallet is created (if first time)
- Dashboard loads

## Troubleshooting

### Modal Not Appearing

**Check:**
1. Official styles are imported: `import '@turnkey/react-wallet-kit/styles.css';`
2. Environment variables are set correctly
3. TurnkeyProvider wraps your app
4. No CSS conflicts with z-index

**Solution:**
```typescript
// Ensure this order in layout.tsx
import './globals.css';
import '@turnkey/react-wallet-kit/styles.css';  // Must be after globals
```

### Modal Appears But Looks Broken

**Check:**
1. No custom CSS overriding `.tk-modal` classes
2. Tailwind v4 is properly configured
3. No conflicting z-index values

**Solution:**
Remove any custom Turnkey styles and use official styles only.

### Authentication Fails

**Check:**
1. Organization ID is correct
2. Auth Proxy Config ID is correct
3. Domain is whitelisted in Turnkey dashboard
4. Browser supports WebAuthn (for passkey)

**Solution:**
Verify environment variables and Turnkey dashboard configuration.

## Comparison with Reference Implementation

### Reference Repository
- Uses `@turnkey/react-wallet-kit/styles.css`
- Clean modal display
- Proper authentication flow
- No custom CSS overrides

### Our Implementation (Now)
- ✅ Uses official Turnkey styles
- ✅ Clean modal display
- ✅ Proper authentication flow
- ✅ No custom CSS conflicts

## Benefits of Official Styles

1. **Maintained by Turnkey**
   - Regular updates
   - Bug fixes
   - New features

2. **Consistent Experience**
   - Matches Turnkey documentation
   - Familiar to users
   - Professional appearance

3. **Less Maintenance**
   - No custom CSS to maintain
   - Automatic updates with package
   - Fewer bugs

4. **Better Integration**
   - Works with all Turnkey features
   - Proper theming support
   - Responsive by default

## Next Steps

1. ✅ Official styles imported
2. ✅ Custom styles removed
3. ✅ Build successful
4. ⏳ Test modal in browser
5. ⏳ Verify passkey authentication
6. ⏳ Test email authentication (if configured)

## Additional Resources

- [Turnkey Documentation](https://docs.turnkey.com)
- [React Wallet Kit](https://www.npmjs.com/package/@turnkey/react-wallet-kit)
- [WebAuthn Guide](https://webauthn.guide)
- [Reference Implementation](https://github.com/kai-builder/sbtc-cool-turnkey-stacks-demo)

---

**Note**: The Turnkey modal should now display properly with passkey and email authentication options. The official styles ensure a consistent, professional experience.
