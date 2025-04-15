# API Key Management

The application supports two methods for managing OpenAI API keys:

## 1. Environment Variables (Default)

API keys can be configured through environment variables in your Netlify deployment:

```env
OPENAI_API_KEY=your-api-key-here
```

This is the recommended approach for:
- Production deployments
- Team environments
- CI/CD pipelines

Benefits:
- Secure: Keys are not exposed in the client
- Centralized: One key for all users
- Easy deployment management

## 2. Admin Interface (Override)

API keys can also be set through the admin interface:

1. Navigate to Admin Dashboard
2. Go to Settings Management
3. Enter API key in the Global Settings section

This approach is useful for:
- Testing different API keys
- Individual user accounts
- Quick changes without redeployment

Benefits:
- Dynamic updates without deployment
- Per-user customization
- Immediate effect

## How It Works

1. When making API calls, the system:
   - First checks for a custom API key from admin settings
   - Falls back to environment variables if no custom key is set

2. API key synchronization:
   - Changes in admin settings are synchronized across all components
   - Both localStorage and memory states are updated
   - All services are reinitialized with new keys

3. Security considerations:
   - Custom API keys are stored in localStorage
   - Keys are only sent to your Netlify functions
   - HTTPS ensures secure transmission

## Local Development

When developing locally:
- API calls may not work due to reCAPTCHA domain restrictions
- Use production environment for testing API functionality
- Local development can still test UI and non-API features

## Best Practices

1. Production:
   - Use environment variables as the primary method
   - Restrict admin access to trusted users
   - Regularly rotate API keys

2. Development:
   - Use .env files for local environment variables
   - Don't commit API keys to version control
   - Use separate keys for development and production