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
export declare function generateThemeCSS(config: ThemeConfig): string;
export declare function applyTheme(config: ThemeConfig): void;
export {};
