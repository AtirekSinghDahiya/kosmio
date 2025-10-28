# Theme System Documentation

## 🎨 Overview

We've implemented a comprehensive theme system with 8 different themes to suit every preference!

## Available Themes

### 1. **Cosmic Dark** (Default)
- **Style**: Original theme with cosmic gradients
- **Best For**: Users who love the original vibrant, futuristic look
- **Colors**: Cyan (#00FFF0) and Purple (#8A2BE2) accents
- **Background**: Deep space gradients
- **Mood**: Futuristic, energetic, cosmic

### 2. **Pure Black**
- **Style**: Minimal black theme like ChatGPT dark mode
- **Best For**: OLED screens, battery saving, minimal aesthetic
- **Colors**: Teal (#10a37f) accent
- **Background**: Pure black (#000000)
- **Mood**: Clean, minimal, professional

### 3. **Pure White**
- **Style**: Clean white theme like ChatGPT light mode
- **Best For**: Bright environments, reading comfort
- **Colors**: Teal (#10a37f) accent
- **Background**: Pure white (#ffffff)
- **Mood**: Fresh, clean, professional

### 4. **Midnight**
- **Style**: Deep blue professional theme
- **Best For**: Professional work environments
- **Colors**: Blue (#3b82f6) accents
- **Background**: Deep blue gradients
- **Mood**: Corporate, trustworthy, calm

### 5. **Forest**
- **Style**: Dark green nature theme
- **Best For**: Nature lovers, eco-conscious users
- **Colors**: Green (#22c55e) accents
- **Background**: Forest green gradients
- **Mood**: Natural, calming, growth-oriented

### 6. **Sunset**
- **Style**: Warm orange and pink theme
- **Best For**: Creative work, warm aesthetic
- **Colors**: Orange (#fb923c) and warm tones
- **Background**: Warm dark gradients
- **Mood**: Warm, creative, energizing

### 7. **Ocean**
- **Style**: Cool blue and teal theme
- **Best For**: Productivity, focus
- **Colors**: Cyan (#06b6d4) and teal accents
- **Background**: Ocean blue gradients
- **Mood**: Cool, refreshing, focused

### 8. **Slate**
- **Style**: Professional grey theme
- **Best For**: Neutral, distraction-free work
- **Colors**: Grey (#64748b) accents
- **Background**: Slate grey gradients
- **Mood**: Neutral, professional, balanced

## How to Change Themes

### Via Settings Page

1. Click on your profile or navigate to **Settings**
2. Find the **Theme** section (first panel)
3. Browse through all 8 available themes
4. Click on any theme to apply it instantly
5. Your choice is automatically saved

### Features

- **Live Preview**: Each theme shows a color preview
- **Instant Apply**: Themes change immediately when selected
- **Persistent**: Your theme choice is saved and remembered
- **Responsive**: All themes work perfectly on mobile and desktop

## Theme System Architecture

### CSS Variables

Each theme sets these CSS variables:

```css
--bg-primary         /* Main background */
--bg-secondary       /* Secondary background */
--surface            /* Card/panel surfaces */
--surface-hover      /* Hover state for surfaces */
--text-primary       /* Main text color */
--text-secondary     /* Secondary text */
--text-muted         /* Muted/hint text */
--accent             /* Primary accent color */
--accent-secondary   /* Secondary accent */
--border             /* Border colors */
--border-hover       /* Hover borders */
--input              /* Input backgrounds */
--input-border       /* Input borders */
--gradient           /* Gradient effects */
--shadow             /* Shadow colors */
```

### Theme Context

The theme system uses React Context:

```typescript
interface ThemeContextType {
  currentTheme: ThemeName;
  themeColors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeColors[];
}
```

### Using Themes in Components

```tsx
import { useTheme } from '../../contexts/ThemeContext';

function MyComponent() {
  const { themeColors, setTheme } = useTheme();

  return (
    <div style={{
      background: themeColors.surface,
      color: themeColors.text
    }}>
      Content
    </div>
  );
}
```

## Accessibility

All themes follow accessibility guidelines:

- **Contrast Ratios**: All text meets WCAG AA standards
- **Pure White Theme**: Optimized for readability in bright environments
- **Pure Black Theme**: True black for OLED battery savings
- **Color Blind Friendly**: Themes use more than just color to convey meaning

## Performance

- **Instant Switching**: Themes change immediately via CSS variables
- **No Page Reload**: Themes switch without refreshing
- **Lightweight**: Only color values are stored
- **Local Storage**: Theme preference saved locally

## Theme Comparison

| Theme | Best Screen | Best Time | Use Case | Vibe |
|-------|-------------|-----------|----------|------|
| **Cosmic Dark** | Any | Night | Creative work | Futuristic |
| **Pure Black** | OLED | Night | Reading, battery | Minimal |
| **Pure White** | LCD | Day | Bright office | Clean |
| **Midnight** | Any | Any | Professional | Corporate |
| **Forest** | Any | Day | Natural work | Calming |
| **Sunset** | Any | Evening | Creative | Warm |
| **Ocean** | Any | Day | Focus work | Cool |
| **Slate** | Any | Any | Neutral work | Balanced |

## Customization

Want to add your own theme? Here's how:

1. Open `src/contexts/ThemeContext.tsx`
2. Add your theme to the `themes` object:

```typescript
'my-theme': {
  name: 'my-theme',
  displayName: 'My Theme',
  description: 'My custom theme',
  background: '#your-bg-color',
  // ... other colors
}
```

3. Add the theme name to the `ThemeName` type
4. Your theme will automatically appear in the selector!

## Tips

### For Designers
- Use theme CSS variables instead of hardcoded colors
- Test your UI in multiple themes
- Ensure proper contrast in all themes

### For Users
- **Pure Black**: Best for OLED screens at night
- **Pure White**: Best for well-lit offices
- **Cosmic Dark**: Best for the full Kroniq experience
- **Midnight/Slate**: Best for professional environments

### For Productivity
- **Ocean/Midnight**: Cool tones for focus
- **Forest**: Natural tones for relaxation
- **Sunset**: Warm tones for creativity
- **Slate**: Neutral for long work sessions

## Future Themes

Potential themes we're considering:

- **Neon City**: Cyberpunk neon theme
- **Desert**: Warm sand and earth tones
- **Arctic**: Ice blue and white theme
- **Rose Gold**: Elegant pink and gold
- **High Contrast**: Maximum contrast for accessibility
- **Sepia**: Vintage paper look

Vote for your favorites or suggest new themes!

## Technical Details

### Storage
- Themes are stored in `localStorage` as `kroniq_theme`
- Default theme: `cosmic-dark`
- Persists across sessions

### Performance
- Themes use CSS variables for instant switching
- No component re-renders needed
- Minimal memory footprint
- No network requests

### Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback to default theme if localStorage unavailable
- Progressive enhancement

## Troubleshooting

### Theme not saving
- Check if localStorage is enabled in your browser
- Clear browser cache and try again

### Colors look wrong
- Ensure you're using a modern browser
- Disable browser extensions that modify colors
- Check if OS dark mode is interfering

### Theme not changing
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear localStorage and re-select theme

## Credits

Theme design inspired by:
- ChatGPT's minimal aesthetics
- Modern UI/UX best practices
- Material Design color systems
- Tailwind CSS color palettes

Enjoy your new themes! 🎨✨
