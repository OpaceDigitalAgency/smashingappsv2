# SmashingApps v2 - Deployment Guide

## Quick Start

### 1. Install Dependencies

```bash
cd smashing-apps-oop
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Deploying to Netlify

### Option 1: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard

1. Push your code to a new GitHub repository (e.g., `smashingappsv2`)

2. Go to [Netlify](https://app.netlify.com/)

3. Click "Add new site" → "Import an existing project"

4. Connect to your GitHub repository

5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18

6. Click "Deploy site"

### Option 3: Manual Deploy

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist/` folder to Netlify's deploy interface

## First-Time Setup

After deploying, follow these steps:

1. **Open the deployed site** (e.g., `https://your-site.netlify.app`)

2. **Navigate to Admin** (click "Admin" in the navigation)

3. **Configure AI Providers:**
   - Click on each provider card
   - Enter your API key
   - Click "Save & Test Key"
   - Verify the key is validated successfully

4. **Start Using Tools:**
   - Navigate to "Article Smasher" or "Task Smasher"
   - Start generating content!

## Getting API Keys

### OpenAI
- Visit: https://platform.openai.com/api-keys
- Create a new API key
- Copy and paste into SmashingApps Admin

### Anthropic Claude
- Visit: https://console.anthropic.com/
- Navigate to API Keys
- Create a new key
- Copy and paste into SmashingApps Admin

### Google Gemini
- Visit: https://makersuite.google.com/app/apikey
- Create an API key
- Copy and paste into SmashingApps Admin

### OpenRouter
- Visit: https://openrouter.ai/keys
- Create an API key
- Copy and paste into SmashingApps Admin

## Features

### Centralised AI Management
- Configure API keys once, use across all tools
- Automatic provider selection based on model
- Consistent settings across all applications

### Multiple AI Providers
- **OpenAI:** GPT-4o, GPT-4o-mini, GPT-3.5-turbo
- **Anthropic:** Claude Sonnet 4, Claude Opus 4
- **Google Gemini:** Gemini 2.0 Flash, Gemini 1.5 Pro
- **OpenRouter:** Access to multiple providers

### Usage Tracking
- Monitor requests, tokens, and costs
- Track usage by provider, model, and application
- View detailed statistics in Admin

### Available Tools

#### Article Smasher
Generate high-quality, SEO-optimised articles with:
- Customisable tone (professional, casual, formal, etc.)
- Adjustable length (short, medium, long)
- Keyword targeting
- British English spelling

#### Task Smasher
Break down projects into manageable tasks:
- AI-powered task generation
- Kanban-style board (To Do, In Progress, Done)
- Priority levels
- Task management

## Architecture

### Core System
- **AICore:** Central factory for managing AI providers
- **Providers:** OpenAI, Anthropic, Gemini, OpenRouter
- **Model Registry:** Centralised model information and pricing
- **Settings Storage:** Persistent settings in localStorage
- **Response Normaliser:** Consistent response format across providers

### Application Structure
```
smashing-apps-oop/
├── core/                 # AI-Core system (independent)
│   ├── AICore.ts        # Main factory
│   ├── interfaces/      # TypeScript interfaces
│   ├── providers/       # Provider implementations
│   ├── registry/        # Model registry
│   ├── response/        # Response normalisation
│   └── storage/         # Settings storage
├── src/
│   ├── admin/           # Admin interface
│   ├── tools/           # Individual tools
│   │   ├── article-smasher/
│   │   └── task-smasher/
│   ├── shared/          # Shared components and hooks
│   └── pages/           # Page components
└── public/              # Static assets
```

## Troubleshooting

### Build Fails
- Ensure Node.js version 18 or higher is installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check for TypeScript errors: `npm run type-check`

### API Keys Not Working
- Verify the key is correct (no extra spaces)
- Check the provider's dashboard for key status
- Ensure you have credits/quota available
- Try testing the key again in Admin

### Tools Not Loading
- Check browser console for errors
- Verify at least one provider is configured
- Clear browser cache and reload

### Usage Stats Not Updating
- Ensure "Enable usage statistics tracking" is enabled in Admin → Settings
- Stats are stored in browser localStorage
- Clearing browser data will reset stats

## Security Notes

- API keys are stored in browser localStorage
- Keys never leave your browser
- No server-side storage or transmission
- Each user must configure their own keys
- Consider using environment-specific keys for development vs production

## Support

For issues or questions:
- Check the documentation in the `docs/` folder
- Review the code comments
- Contact: Opace Digital Agency

## License

© 2025 SmashingApps v2. All rights reserved.

