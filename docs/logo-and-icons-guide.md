# Logo and Icons Customization Guide

This guide explains how to customize the logo and icons for TheStatsCalculator application.

## Current Setup

The application now supports both custom logos and automatic fallback to the default Calculator icon.

### Logo Component Location
- **Component**: `src/components/ui/Logo.tsx`
- **Used in**: Header and Footer components
- **Features**: Automatic detection of custom logo files with fallback support

## How to Add Your Custom Logo

### 1. SVG Logo (Recommended)
Place your custom logo at:
```
public/icons/logo.svg
```

**Requirements:**
- Format: SVG (scalable vector graphics)
- Recommended size: 32x32px base size
- Should work well in both light and dark backgrounds
- Keep file size under 10KB for optimal performance

### 2. PNG/JPG Logo (Alternative)
You can also use raster images:
```
public/icons/logo.png
public/icons/logo.jpg
```

**Requirements:**
- Minimum size: 64x64px
- Recommended size: 128x128px or higher
- Transparent background (PNG) preferred
- File size under 50KB

### 3. Logo Component Features

The `Logo` component automatically:
- Detects if a custom logo exists at `/icons/logo.svg`
- Falls back to the Calculator icon if no custom logo is found
- Supports different sizes: `sm`, `md`, `lg`
- Allows showing/hiding text alongside the logo

**Usage Examples:**
```tsx
// Default logo with text
<Logo />

// Small logo without text
<Logo iconSize="sm" showText={false} />

// Large logo with custom text styling
<Logo iconSize="lg" textClassName="text-2xl text-blue-600" />
```

## Favicon and App Icons

### Automatic Icon Generation
The application automatically generates favicons and app icons using:

#### 1. `src/app/icon.tsx`
- Generates the main favicon (32x32px)
- Uses a blue background with ∑ (sigma) symbol
- Automatically served at `/icon` route

#### 2. `src/app/apple-icon.tsx`
- Generates Apple touch icons (180x180px)
- Uses gradient blue background
- Automatically served at `/apple-icon` route

### Custom Static Icons (Alternative)

You can also place static icon files in the `public` folder:

```
public/
├── favicon.ico           # 16x16, 32x32, 48x48 sizes
├── icon-192.png         # Android Chrome
├── icon-512.png         # Android Chrome
├── apple-touch-icon.png # 180x180 Apple devices
└── manifest.json        # Web app manifest
```

## Customization Options

### 1. Change Icon Symbol
Edit `src/app/icon.tsx` and `src/app/apple-icon.tsx`:
```tsx
// Change the ∑ symbol to something else
<div>
  📊  {/* Chart emoji */}
  ∫   {/* Integral symbol */}
  π   {/* Pi symbol */}
  χ   {/* Chi symbol */}
</div>
```

### 2. Change Icon Colors
Modify the background colors in the icon files:
```tsx
background: 'linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%)'
```

### 3. Customize Logo Text
Edit the text in `src/components/ui/Logo.tsx`:
```tsx
<span className={`ml-2 text-xl font-bold text-gray-900 ${textClassName}`}>
  Your App Name
</span>
```

## Brand Consistency

### Color Scheme
- **Primary Blue**: `#2563eb` (blue-600)
- **Dark Blue**: `#1d4ed8` (blue-700)
- **Light Blue**: `#3b82f6` (blue-500)

### Typography
- **Logo Font**: Inter (system font)
- **Weight**: Bold (700)
- **Size**: Large (xl)

## Testing Your Changes

1. **Development**: Changes are visible immediately at `http://localhost:3011`
2. **Logo Detection**: The Logo component will automatically detect your custom logo
3. **Icon Updates**: Favicon changes require a browser refresh (Ctrl+F5)

## File Size Recommendations

| Asset Type | Max Size | Optimal Size |
|------------|----------|--------------|
| SVG Logo | 10KB | 2-5KB |
| PNG Logo | 50KB | 10-20KB |
| Favicon | 25KB | 5-10KB |
| Apple Icon | 50KB | 15-30KB |

## Browser Support

- **Logo Component**: All modern browsers
- **Dynamic Icons**: Chrome 73+, Firefox 96+, Safari 15+
- **Static Fallbacks**: All browsers

## Troubleshooting

### Logo Not Showing
1. Check file path: `/public/icons/logo.svg`
2. Verify file permissions and accessibility
3. Clear browser cache
4. Check browser console for errors

### Icons Not Updating
1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try incognito/private browsing mode

### Performance Issues
1. Optimize SVG files (remove unnecessary elements)
2. Compress PNG/JPG images
3. Use appropriate file formats (SVG for logos, PNG for icons)

## Example Custom Logo

A sample logo is provided at `public/icons/logo.svg`. You can:
1. Replace this file with your own design
2. Keep the same filename for automatic detection
3. Ensure your logo works well at different sizes

## Next Steps

1. **Add Your Logo**: Replace `public/icons/logo.svg` with your design
2. **Test Display**: Check header and footer appearance
3. **Customize Icons**: Modify icon generators if needed
4. **Update Branding**: Adjust colors and text as needed

Your custom logo and icons will now be displayed throughout the application!