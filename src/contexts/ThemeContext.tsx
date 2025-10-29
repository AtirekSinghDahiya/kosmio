import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName =
  | 'cosmic-dark'      // Original dark theme with gradients
  | 'pure-black'       // Pure black, minimal like dark mode
  | 'pure-white'       // Clean white like ChatGPT
  | 'midnight'         // Dark blue theme
  | 'forest'           // Dark green theme
  | 'sunset'           // Warm orange/pink theme
  | 'ocean'            // Blue/teal theme
  | 'slate'            // Grey professional theme

export interface ThemeColors {
  name: ThemeName;
  displayName: string;
  description: string;

  // Background colors
  background: string;
  backgroundSecondary: string;

  // Surface colors (cards, panels)
  surface: string;
  surfaceHover: string;

  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;

  // Accent colors
  accent: string;
  accentSecondary: string;

  // Border colors
  border: string;
  borderHover: string;

  // Input colors
  input: string;
  inputBorder: string;

  // Special
  gradient: string;
  shadow: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  'cosmic-dark': {
    name: 'cosmic-dark',
    displayName: 'Cosmic Dark',
    description: 'Original theme with cosmic gradients',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)',
    backgroundSecondary: 'rgba(15, 23, 42, 0.95)',
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceHover: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    accent: '#00FFF0',
    accentSecondary: '#8A2BE2',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    input: 'rgba(255, 255, 255, 0.05)',
    inputBorder: 'rgba(255, 255, 255, 0.2)',
    gradient: 'linear-gradient(135deg, #00FFF0 0%, #8A2BE2 100%)',
    shadow: 'rgba(0, 255, 240, 0.1)',
  },
  'pure-black': {
    name: 'pure-black',
    displayName: 'Pure Black',
    description: 'Minimal black theme like ChatGPT dark',
    background: '#000000',
    backgroundSecondary: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceHover: '#2a2a2a',
    text: '#ececec',
    textSecondary: '#d1d1d1',
    textMuted: '#8e8e8e',
    accent: '#10a37f',
    accentSecondary: '#1a7f64',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    input: '#2f2f2f',
    inputBorder: '#4a4a4a',
    gradient: 'linear-gradient(135deg, #10a37f 0%, #1a7f64 100%)',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
  'pure-white': {
    name: 'pure-white',
    displayName: 'Pure White',
    description: 'Clean white theme like ChatGPT light',
    background: '#ffffff',
    backgroundSecondary: '#f7f7f8',
    surface: '#ffffff',
    surfaceHover: '#f0f0f0',
    text: '#000000',
    textSecondary: '#1f1f1f',
    textMuted: '#666666',
    accent: '#10a37f',
    accentSecondary: '#0e8c6f',
    border: 'rgba(0, 0, 0, 0.1)',
    borderHover: 'rgba(0, 0, 0, 0.2)',
    input: '#ffffff',
    inputBorder: '#d1d1d1',
    gradient: 'linear-gradient(135deg, #10a37f 0%, #0e8c6f 100%)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  'midnight': {
    name: 'midnight',
    displayName: 'Midnight',
    description: 'Deep blue professional theme',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    backgroundSecondary: 'rgba(15, 23, 42, 0.95)',
    surface: 'rgba(51, 65, 85, 0.3)',
    surfaceHover: 'rgba(51, 65, 85, 0.5)',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    accent: '#3b82f6',
    accentSecondary: '#2563eb',
    border: 'rgba(148, 163, 184, 0.2)',
    borderHover: 'rgba(148, 163, 184, 0.3)',
    input: 'rgba(51, 65, 85, 0.3)',
    inputBorder: 'rgba(148, 163, 184, 0.3)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    shadow: 'rgba(59, 130, 246, 0.2)',
  },
  'forest': {
    name: 'forest',
    displayName: 'Forest',
    description: 'Dark green nature theme',
    background: 'linear-gradient(135deg, #0a1f0a 0%, #1a2f1a 50%, #2a3f2a 100%)',
    backgroundSecondary: 'rgba(10, 31, 10, 0.95)',
    surface: 'rgba(34, 197, 94, 0.1)',
    surfaceHover: 'rgba(34, 197, 94, 0.2)',
    text: '#f0fdf4',
    textSecondary: '#dcfce7',
    textMuted: '#86efac',
    accent: '#22c55e',
    accentSecondary: '#16a34a',
    border: 'rgba(34, 197, 94, 0.2)',
    borderHover: 'rgba(34, 197, 94, 0.3)',
    input: 'rgba(34, 197, 94, 0.1)',
    inputBorder: 'rgba(34, 197, 94, 0.3)',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    shadow: 'rgba(34, 197, 94, 0.2)',
  },
  'sunset': {
    name: 'sunset',
    displayName: 'Sunset',
    description: 'Warm orange and pink theme',
    background: 'linear-gradient(135deg, #1f0a0a 0%, #2f1a1a 50%, #3f2a2a 100%)',
    backgroundSecondary: 'rgba(31, 10, 10, 0.95)',
    surface: 'rgba(251, 146, 60, 0.1)',
    surfaceHover: 'rgba(251, 146, 60, 0.2)',
    text: '#fef2f2',
    textSecondary: '#fee2e2',
    textMuted: '#fca5a5',
    accent: '#fb923c',
    accentSecondary: '#f97316',
    border: 'rgba(251, 146, 60, 0.2)',
    borderHover: 'rgba(251, 146, 60, 0.3)',
    input: 'rgba(251, 146, 60, 0.1)',
    inputBorder: 'rgba(251, 146, 60, 0.3)',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    shadow: 'rgba(251, 146, 60, 0.2)',
  },
  'ocean': {
    name: 'ocean',
    displayName: 'Ocean',
    description: 'Cool blue and teal theme',
    background: 'linear-gradient(135deg, #0a1f1f 0%, #1a2f2f 50%, #2a3f3f 100%)',
    backgroundSecondary: 'rgba(10, 31, 31, 0.95)',
    surface: 'rgba(6, 182, 212, 0.1)',
    surfaceHover: 'rgba(6, 182, 212, 0.2)',
    text: '#f0fdfa',
    textSecondary: '#ccfbf1',
    textMuted: '#5eead4',
    accent: '#06b6d4',
    accentSecondary: '#0891b2',
    border: 'rgba(6, 182, 212, 0.2)',
    borderHover: 'rgba(6, 182, 212, 0.3)',
    input: 'rgba(6, 182, 212, 0.1)',
    inputBorder: 'rgba(6, 182, 212, 0.3)',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    shadow: 'rgba(6, 182, 212, 0.2)',
  },
  'slate': {
    name: 'slate',
    displayName: 'Slate',
    description: 'Professional grey theme',
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
    backgroundSecondary: 'rgba(30, 41, 59, 0.95)',
    surface: 'rgba(71, 85, 105, 0.3)',
    surfaceHover: 'rgba(71, 85, 105, 0.5)',
    text: '#f8fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    accent: '#64748b',
    accentSecondary: '#475569',
    border: 'rgba(148, 163, 184, 0.2)',
    borderHover: 'rgba(148, 163, 184, 0.3)',
    input: 'rgba(71, 85, 105, 0.3)',
    inputBorder: 'rgba(148, 163, 184, 0.3)',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    shadow: 'rgba(100, 116, 139, 0.2)',
  },
};

interface ThemeContextType {
  currentTheme: ThemeName;
  themeColors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeColors[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('kroniq_theme');

    // Migrate old theme values to new theme names
    if (saved === 'dark') return 'cosmic-dark';
    if (saved === 'light') return 'pure-white';

    // Validate that saved theme exists
    if (saved && themes[saved as ThemeName]) {
      return saved as ThemeName;
    }

    // Default to cosmic-dark
    return 'cosmic-dark';
  });

  const themeColors = themes[currentTheme] || themes['cosmic-dark'];

  useEffect(() => {
    // Safety check - ensure theme exists
    if (!themeColors) {
      console.error('Theme colors not found for:', currentTheme);
      return;
    }

    localStorage.setItem('kroniq_theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', themeColors.background);
    root.style.setProperty('--bg-secondary', themeColors.backgroundSecondary);
    root.style.setProperty('--surface', themeColors.surface);
    root.style.setProperty('--surface-hover', themeColors.surfaceHover);
    root.style.setProperty('--text-primary', themeColors.text);
    root.style.setProperty('--text-secondary', themeColors.textSecondary);
    root.style.setProperty('--text-muted', themeColors.textMuted);
    root.style.setProperty('--accent', themeColors.accent);
    root.style.setProperty('--accent-secondary', themeColors.accentSecondary);
    root.style.setProperty('--border', themeColors.border);
    root.style.setProperty('--border-hover', themeColors.borderHover);
    root.style.setProperty('--input', themeColors.input);
    root.style.setProperty('--input-border', themeColors.inputBorder);
    root.style.setProperty('--gradient', themeColors.gradient);
    root.style.setProperty('--shadow', themeColors.shadow);

    // Set body background
    document.body.style.background = themeColors.background;

    // Update favicon
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = '/Black_Blue_White_Modern_Simple_Minimal_Gradient_Circle__Neon_Technology__AI_Logo__1_-removebg-preview copy.png';
    }
  }, [currentTheme]);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };

  const availableThemes = Object.values(themes);

  return (
    <ThemeContext.Provider value={{ currentTheme, themeColors, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};
