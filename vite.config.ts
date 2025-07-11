import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        // Ensure SVGs are treated as React components
        icon: true,
      },
    }),
    react(), 
    dts()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // adjust to your actual entry
      name: 'ReactAIConcierge',
      fileName: (format) => `concierge-module.${format}.js`,
    },
    rollupOptions: {
      // Don't bundle these
      external: (id) =>
        /^react(|-dom|\/jsx-runtime)$/.test(id) || // match react, react-dom, react/jsx-runtime
        [
          '@mui/material',
          '@mui/icons-material',
          '@emotion/react',
          '@emotion/styled',
          '@radix-ui/react-avatar',
          '@radix-ui/react-tooltip',
          'framer-motion',
          'lucide-react',
          'cmdk',
          'react-day-picker',
          'react-hook-form',
          'react-i18next',
          'react-markdown',
          'react-resizable-panels',
          'react-router-dom',
          'wouter',
          '@daily-co/daily-react'
        ].some(pkg => id === pkg || id.startsWith(`${pkg}/`)),
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  // Configure how assets are handled
  assetsInclude: ['**/*.svg'],
  // Ensure SVGs are treated as modules
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
