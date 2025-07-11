# React AI Concierge Module

A self-contained React component that provides an AI concierge interface with avatar selection, voice interaction, and chat functionality. Perfect for creating personalized AI assistants with customizable personas and multi-language support.

## Installation

```bash
npm install react-ai-concierge
```

## Basic Usage

The component is designed to work as a standalone module with comprehensive configuration options:

```tsx
import ConciergeModule from "react-ai-concierge";

function App() {
  const config = {
    region: "eastus",
    apiBaseUrl: "https://your-api-endpoint.com",
    speechKey: "your-azure-speech-key",
    azureTranslatorKey: "your-azure-translator-key",
    azureTranslatorEndpoint: "https://api.cognitive.microsofttranslator.com",
    azureTranslatorRegion: "eastus",
    tavusApiKey: "your-tavus-api-key",
  };

  return (
    <ConciergeModule
      brandName="Your Brand"
      personaName="AI Health Navigator"
      language="en"
      config={config}
    />
  );
}
```

## Props

| Prop               | Type              | Required | Default                 | Description                                     |
| ------------------ | ----------------- | -------- | ----------------------- | ----------------------------------------------- |
| `brandName`        | string            | Yes      | "Growth Hub"            | The brand name to display in the concierge      |
| `personaName`      | string            | Yes      | "Personal AI Concierge" | The persona name for the AI assistant           |
| `language`         | string            | No       | "en"                    | Language code for translations (en, es, fr, de) |
| `suggestedPrompts` | SuggestedPrompt[] | No       | default prompts         | Custom suggested prompts for users              |
| `config`           | Config            | Yes      | -                       | Configuration object for API endpoints and keys |

### Config Object

```tsx
interface Config {
  region: string; // Azure region for speech services
  apiBaseUrl: string; // Base URL for API endpoints
  speechKey: string; // Azure Speech Service key
  azureTranslatorKey: string; // Azure Translator key
  azureTranslatorEndpoint: string; // Azure Translator endpoint
  azureTranslatorRegion: string; // Azure Translator region
  tavusApiKey?: string; // Tavus API key (optional)
}
```

## Features

### 🎭 Avatar Selection

- Choose from multiple AI avatars with different personas
- Language-specific avatar selection
- Smooth avatar switching with navigation controls

### 🗣️ Voice Interaction

- Real-time speech-to-text and text-to-speech
- Voice commands and natural conversation
- Interruption support for dynamic interactions

### 💬 Text Chat

- Traditional text-based conversation interface
- Auto-expanding input field
- Message history with feedback options
- Markdown support for rich text responses

### 🌍 Multi-language Support

- Automatic translation of UI elements
- Support for English, Spanish, French, German
- Language-specific avatar selection
- Dynamic content translation

### 📱 Responsive Design

- Works seamlessly on desktop and mobile
- Adaptive layout with grid system
- Touch-friendly controls

### 🔧 Self-contained

- No external dependencies required
- Built-in translation system
- Comprehensive error handling

## Advanced Usage

### Custom Suggested Prompts

```tsx
const customPrompts = [
  { id: 1, text: "Help me understand my lab results", icon: GraduationCap },
  { id: 2, text: "Explain medical terminology", icon: Users2 },
  { id: 3, text: "Provide health insights", icon: Lightbulb },
];

<ConciergeModule
  brandName="Health Clinic"
  personaName="AI Health Navigator"
  suggestedPrompts={customPrompts}
  config={config}
/>;
```

### Language Configuration

```tsx
<ConciergeModule
  brandName="Your Brand"
  personaName="AI Assistant"
  language="es" // Spanish
  config={config}
/>
```

## File Upload

The component includes a file upload button that supports:

- PDF documents
- Word documents (.doc, .docx)
- Text files (.txt)
- Images (.jpg, .jpeg, .png)

## Avatar Management

The component automatically fetches and manages avatars from the database, filtering by allowed avatar IDs and supporting language-specific default selections.

## Translation System

The component includes a comprehensive translation system that:

- Automatically translates UI elements when language changes
- Preserves dynamic content placeholders
- Falls back to English if translation fails
- Supports real-time language switching

## Troubleshooting

### Configuration Issues

Make sure all required config properties are provided:

```tsx
const config = {
  region: "eastus", // Required
  apiBaseUrl: "https://api.example.com", // Required
  speechKey: "your-speech-key", // Required
  azureTranslatorKey: "your-translator-key", // Required
  azureTranslatorEndpoint: "https://api.cognitive.microsofttranslator.com", // Required
  azureTranslatorRegion: "eastus", // Required
};
```

### Translation Issues

- Ensure Azure Translator credentials are valid
- Check network connectivity for translation API calls
- Verify language codes are supported (en, es, fr, de)

### Avatar Loading Issues

- Check API connectivity for avatar fetching
- Verify allowed avatar IDs are correct
- Ensure avatar images are accessible

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## API Integration

The component integrates with several APIs:

- **Azure Speech Services**: For voice interaction
- **Azure Translator**: For multi-language support
- **Tavus API**: For video generation (optional)
- **Custom APIs**: For chat completion and avatar management

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - see LICENSE file for details.
