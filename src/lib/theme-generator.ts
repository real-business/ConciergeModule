/**
 * Theme Generator - Converts theme.json colors to CSS variables
 */

interface ThemeConfig {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    light: string;
    white: string;
    variant: 'professional' | 'tint' | 'vibrant';
    appearance: 'light' | 'dark' | 'system';
    radius: number;
  }
  
  // Convert hex to HSL
  function hexToHsl(hex: string): string {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Handle shorthand hex (e.g., "f00" -> "ff0000")
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // Validate hex length
    if (hex.length !== 6) {
      console.warn(`Invalid hex color: ${hex}, using fallback`);
      return '0 0% 50%'; // Fallback to gray
    }
  
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
  
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number, l: number;
  
    l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }
  
    // Round values to avoid floating point issues
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
  
    return `${h} ${s}% ${l}%`;
  }
  
  // Generate foreground color based on background
  function getForegroundColor(bgHsl: string, isDark: boolean = false): string {
    const parts = bgHsl.match(/\d+/g);
    if (!parts) return isDark ? '0 0% 98%' : '0 0% 10%';
    const l = parseInt(parts[2]);
    return l > 50 ? '0 0% 10%' : '0 0% 98%';
  }
  
  // Generate color variations based on variant
  function generateColorVariations(baseHsl: string, variant: string): { [key: string]: string } {
    const [h, s, l] = baseHsl.match(/\d+/g)!.map(Number);
    
    // Ensure saturation and lightness are within valid ranges
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    
    switch (variant) {
      case 'professional':
        return {
          '50': `${h} ${clamp(s - 30, 5, 100)}% 97%`,
          '100': `${h} ${clamp(s - 20, 10, 100)}% 94%`,
          '200': `${h} ${clamp(s - 10, 15, 100)}% 87%`,
          '300': `${h} ${clamp(s, 20, 100)}% 77%`,
          '400': `${h} ${clamp(s, 30, 100)}% 67%`,
          '500': baseHsl,
          '600': `${h} ${clamp(s + 10, 40, 100)}% ${clamp(l - 10, 10, 90)}%`,
          '700': `${h} ${clamp(s + 15, 50, 100)}% ${clamp(l - 20, 5, 85)}%`,
          '800': `${h} ${clamp(s + 20, 60, 100)}% ${clamp(l - 30, 3, 80)}%`,
          '900': `${h} ${clamp(s + 25, 70, 100)}% ${clamp(l - 40, 1, 75)}%`,
        };
      case 'vibrant':
        return {
          '50': `${h} ${clamp(s + 10, 20, 100)}% 97%`,
          '100': `${h} ${clamp(s + 5, 25, 100)}% 94%`,
          '200': `${h} ${clamp(s, 30, 100)}% 87%`,
          '300': `${h} ${clamp(s, 35, 100)}% 77%`,
          '400': `${h} ${clamp(s, 40, 100)}% 67%`,
          '500': baseHsl,
          '600': `${h} ${clamp(s + 5, 45, 100)}% ${clamp(l - 5, 15, 90)}%`,
          '700': `${h} ${clamp(s + 10, 50, 100)}% ${clamp(l - 15, 10, 85)}%`,
          '800': `${h} ${clamp(s + 15, 55, 100)}% ${clamp(l - 25, 5, 80)}%`,
          '900': `${h} ${clamp(s + 20, 60, 100)}% ${clamp(l - 35, 2, 75)}%`,
        };
      default: // tint
        return {
          '50': `${h} ${clamp(s - 40, 5, 100)}% 98%`,
          '100': `${h} ${clamp(s - 30, 10, 100)}% 95%`,
          '200': `${h} ${clamp(s - 20, 15, 100)}% 89%`,
          '300': `${h} ${clamp(s - 10, 20, 100)}% 80%`,
          '400': `${h} ${clamp(s, 25, 100)}% 70%`,
          '500': baseHsl,
          '600': `${h} ${clamp(s + 5, 30, 100)}% ${clamp(l - 8, 20, 90)}%`,
          '700': `${h} ${clamp(s + 10, 35, 100)}% ${clamp(l - 16, 15, 85)}%`,
          '800': `${h} ${clamp(s + 15, 40, 100)}% ${clamp(l - 24, 10, 80)}%`,
          '900': `${h} ${clamp(s + 20, 45, 100)}% ${clamp(l - 32, 5, 75)}%`,
        };
    }
  }
  
  export function generateThemeCSS(config: ThemeConfig): string {
    const isDark = config.appearance === 'dark';
    
    // Convert colors to HSL
    const colors = {
      primary: hexToHsl(config.primary),
      secondary: hexToHsl(config.secondary),
      accent: hexToHsl(config.accent),
      neutral: hexToHsl(config.neutral),
      light: hexToHsl(config.light),
      white: hexToHsl(config.white),
    };
   
    // Generate CSS variables
    const cssVars: string[] = [
      `--radius: ${config.radius}rem;`,
      
      // Primary colors
      `--primary: ${colors.primary};`,
      `--primary-foreground: ${getForegroundColor(colors.primary, isDark)};`,
      
      // Secondary colors
      `--secondary: ${colors.secondary};`,
      `--secondary-foreground: ${getForegroundColor(colors.secondary, isDark)};`,
      
      // Accent colors
      `--accent: ${colors.accent};`,
      `--accent-foreground: ${getForegroundColor(colors.accent, isDark)};`,
      
      // Neutral colors
      `--neutral: ${colors.neutral};`,
      `--neutral-foreground: ${getForegroundColor(colors.neutral, isDark)};`,
      
      // Light colors
      `--light: ${colors.light};`,
      `--light-foreground: ${getForegroundColor(colors.light, isDark)};`,
      
      // White colors
      `--white: ${colors.white};`,
      `--white-foreground: ${getForegroundColor(colors.white, isDark)};`,
      
      // Base theme colors using your palette
      `--background: ${colors.white};`,
      `--foreground: ${colors.primary};`,
      `--card: ${colors.white};`,
      `--card-foreground: ${colors.secondary};`,
      `--popover: ${colors.white};`,
      `--popover-foreground: ${colors.primary};`,
      `--muted: ${colors.light};`,
      `--muted-foreground: ${colors.accent};`,
      `--border: ${colors.neutral};`,
      `--input: ${colors.light};`,
      `--ring: ${colors.primary};`,
      `--destructive: 0 84.2% 60.2%;`,
      `--destructive-foreground: 0 0% 98%;`,
    ];
  
    return `:root {\n  ${cssVars.join('\n  ')}\n}`;
  }
  
  export function applyTheme(config: ThemeConfig): void {
    const css = generateThemeCSS(config);
    
    // Remove existing theme styles
    const existingStyle = document.getElementById('theme-variables');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Apply new theme
    const style = document.createElement('style');
    style.id = 'theme-variables';
    style.textContent = css;
    document.head.appendChild(style);
    
    // Apply dark/light class
    document.documentElement.classList.toggle('dark', config.appearance === 'dark');
  }