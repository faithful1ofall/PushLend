# Tailwind CSS v3 Compatibility Fix

## Issue

Turnkey's `@turnkey/react-wallet-kit` package includes CSS built with Tailwind v4, which uses `@layer` directives that conflict with Tailwind v3 (used in this project).

**Error:**
```
Syntax error: `@layer utilities` is used but no matching `@tailwind utilities` directive is present.
```

## Final Solution

We resolved the conflict by configuring webpack to handle Turnkey's CSS separately from Tailwind:

1. **Installed webpack loaders**: `style-loader` and `css-loader`
2. **Updated `next.config.js`**: Added webpack rule to process Turnkey CSS independently
3. **Import Turnkey styles**: In `providers.tsx` (client component)
4. **Keep custom styles**: `turnkey-styles.css` as fallback/enhancement

This approach allows Turnkey's Tailwind v4 CSS to coexist with our Tailwind v3 setup.

### Changes Made

1. **Installed webpack loaders**
   ```bash
   npm install style-loader css-loader postcss-import --save-dev
   ```

2. **Updated `next.config.js`**
   - Added webpack rule to process Turnkey CSS with style-loader and css-loader
   - Bypasses Tailwind processing for Turnkey styles
   - Prevents @layer directive conflicts

3. **Updated `src/app/providers.tsx`**
   - Import Turnkey styles in client component
   - Webpack handles the CSS separately

4. **Updated `postcss.config.js`**
   - Added `postcss-import` plugin for CSS imports

5. **Updated `src/app/globals.css`**
   - Added empty `@layer utilities` block for compatibility

6. **Created `src/app/turnkey-styles.css`**
   - Custom fallback/enhancement CSS
   - Compatible with Tailwind v3

7. **Updated `tailwind.config.js`**
   - Added Turnkey package to content paths

### Custom Styles Included

- Modal backdrop and container
- Authentication buttons
- Input fields
- Primary/secondary buttons
- Loading spinners
- Error/success messages
- OAuth icons
- Iframe containers for export/import

### Alternative Solutions Considered

1. **Upgrade to Tailwind v4** ❌
   - Would require rewriting all existing styles
   - Breaking changes in v4
   - Not recommended for existing projects

2. **Import Turnkey CSS directly** ❌
   - Causes build errors with Tailwind v3
   - Incompatible @layer directives

3. **Use custom CSS** ✅
   - Compatible with Tailwind v3
   - Full control over styling
   - No build conflicts

## Testing

The app now compiles successfully with:
- Turnkey authentication modals
- Custom styled components
- Full Tailwind v3 compatibility

## Future Considerations

When upgrading to Tailwind v4 in the future:
1. Remove `src/app/turnkey-styles.css`
2. Import Turnkey's CSS directly: `import '@turnkey/react-wallet-kit/styles.css'`
3. Update all Tailwind v3 syntax to v4

## References

- [Turnkey Troubleshooting](https://docs.turnkey.com/sdks/react/troubleshooting#6-%40layer-utilities-is-used-but-no-matching-%40tailwind-utilities-directive-is-present-tailwind-v3-error)
- [Tailwind v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
