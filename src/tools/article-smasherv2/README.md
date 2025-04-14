# Article Smasher v2

![Article Smasher v2](https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

A powerful AI-driven content creation system designed to streamline the process of generating high-quality, SEO-optimized articles for WordPress. Article Smasher v2 leverages OpenAI's GPT-4o models to guide users through a structured, step-by-step workflow from topic ideation to publishing.

## Features

- **AI-Powered Generation**: Connect to OpenAI's latest GPT-4o and GPT-4o-mini models
- **Step-by-Step Workflow**: Structured process from brainstorming to publishing
- **Multi-Language Support**: Create content in over 30 languages
- **Humanization Features**: Make AI content sound more natural
- **SEO Optimization**: Generate SEO-friendly content with keyword integration
- **DALL-E 3 Integration**: Generate relevant images for your content
- **WordPress Integration**: Publish directly to your WordPress site

## Documentation

Comprehensive documentation is available to help you get the most out of Article Smasher v2:

- [User Guide](./docs/user-guide.md) - Learn how to use the article creation workflow
- [Admin Guide](./docs/admin-guide.md) - Configure and manage the system
- [Developer Guide](./docs/developer-guide.md) - Extend and customize the system

## Installation and Setup

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- An OpenAI API key with access to GPT-4o models
- A WordPress site (for publishing integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-organization/article-smasher-v2.git
cd article-smasher-v2
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with your configuration:
```
VITE_OPENAI_API_KEY=your-api-key-here
VITE_DEFAULT_MODEL=gpt-4o
VITE_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

### WordPress Integration

To integrate with WordPress:

1. Ensure your WordPress site has the REST API enabled
2. Install and activate the [Application Passwords](https://wordpress.org/plugins/application-passwords/) plugin
3. Create an application password for Article Smasher v2
4. Configure the WordPress integration in the admin settings

## System Architecture

Article Smasher v2 is built with a modern tech stack:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: React Router for navigation
- **State Management**: React Context API
- **AI Integration**: OpenAI API for GPT-4o and DALL-E 3

The system follows a modular architecture with these key components:

- **Article Wizard**: Guides users through the content creation process
- **Prompt Management**: Configurable templates for AI interactions
- **WordPress Integration**: Publishes content directly to WordPress

For more details, see the [Developer Guide](./docs/developer-guide.md).

## Article Creation Workflow

Article Smasher v2 guides users through a systematic workflow:

1. **Topic Selection**: Choose article type and topic
2. **Keyword Research**: Identify and select relevant keywords
3. **Outline Generation**: Create a structured outline
4. **Content Creation**: Generate the full article content
5. **Image Selection**: Generate and select images
6. **Publishing**: Review and publish the article

Each step builds upon the previous one, ensuring a cohesive final article. For detailed instructions, see the [User Guide](./docs/user-guide.md).

## Admin Features

Administrators can configure and customize the system:

- **Prompt Templates**: Manage AI prompt templates for each step
- **System Settings**: Configure API connections and model parameters
- **User Management**: Control access permissions
- **Analytics**: Track usage and performance

For detailed admin instructions, see the [Admin Guide](./docs/admin-guide.md).

## Development

### Project Structure

```
src/
├── components/           # UI components
│   ├── steps/            # Workflow step components
│   ├── layout/           # Layout components
│   └── common/           # Shared UI components
├── contexts/             # React context providers
├── services/             # Service modules
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build
- `npm run test`: Run tests
- `npm run lint`: Lint the codebase

For more development details, see the [Developer Guide](./docs/developer-guide.md).

## Contributing

We welcome contributions to Article Smasher v2! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## License

Copyright © 2025 Opace Digital Agency. All rights reserved.

## Support

For support, please contact:

- Email: support@example.com
- Website: https://example.com/support
- Documentation: See the [User Guide](./docs/user-guide.md)