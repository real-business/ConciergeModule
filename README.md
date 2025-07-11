# React AI Concierge Module

A self-contained React component that provides an AI concierge interface with avatar selection, voice interaction, and chat functionality.

## Installation

```bash
npm install react-ai-concierge
```

## Basic Usage

The component is designed to work as a standalone module without requiring external providers. Simply import and use:

```tsx
import { ConciergeModule } from "react-ai-concierge";

function App() {
  return <ConciergeModule brandName="Your Brand" selectedLanguage="en" />;
}
```

## Props

| Prop               | Type              | Default         | Description                                      |
| ------------------ | ----------------- | --------------- | ------------------------------------------------ |
| `brandName`        | string            | "Growth Hub"    | The brand name to display in the concierge       |
| `suggestedPrompts` | SuggestedPrompt[] | default prompts | Custom suggested prompts for users               |
| `config`           | object            | {}              | Configuration options for API endpoints and keys |

## Advanced Usage

If you need more control over the component or want to provide your own context providers:

```tsx
import { ConciergeModuleRaw, LanguageProvider } from "react-ai-concierge";

function App() {
  return <ConciergeModuleRaw brandName="Your Brand" />;
}
```

## Features

- **Avatar Selection**: Choose from multiple AI avatars
- **Voice Interaction**: Speak with the AI concierge
- **Text Chat**: Traditional text-based conversation
- **Multi-language Support**: English, Spanish, French, German
- **Responsive Design**: Works on desktop and mobile
- **Self-contained**: No external dependencies required

## Troubleshooting

### Hook Errors

If you encounter React Hook errors, make sure you're using the main `ConciergeModule` export (not `ConciergeModuleRaw`) as it includes the necessary providers.

### Translation Issues

The component includes fallback translations and will work even if i18n is not properly configured in the parent application.

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```
