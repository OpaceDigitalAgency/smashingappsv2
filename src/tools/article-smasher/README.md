# ArticleSmasher

ArticleSmasher is an AI-powered content creation tool that helps users generate high-quality articles for various purposes. It's part of the SmashingApps.ai platform.

## Features

- ✅ AI-powered article generation for various use cases
- 📝 Multiple content types (Blog Posts, SEO Articles, Academic Papers, News Articles)
- 🔍 SEO optimization for content
- 📊 Export capabilities (JSON, PDF)
- 🎨 Clean, user-friendly interface
- 🔒 Rate limiting to prevent API abuse

## Use Cases

ArticleSmasher supports multiple specialized use cases, each with its own optimized AI prompt:

- **Blog Post**: Create engaging blog posts with proper structure
- **SEO Article**: Generate SEO-optimized content for better rankings
- **Academic Paper**: Create academic-style content with proper citations
- **News Article**: Generate news-style articles with journalistic structure

## Architecture

ArticleSmasher is built on the shared architecture of the SmashingApps.ai platform. For detailed information about the architecture, shared component library, and tool configuration system, please refer to the [main README](../../../README.md).

## Configuration

ArticleSmasher is configured using the tool configuration system. The configuration is defined in `src/tools/article-smasher/config.ts`.

### Key Configuration Options

```typescript
const articleSmasherConfig: ToolConfig = {
  id: 'article-smasher',
  name: 'ArticleSmasher',
  description: 'AI-powered article generation and optimization',
  icon: FileText,
  routes: {
    base: '/tools/article-smasher',
    subRoutes: {
      blog: '/tools/article-smasher/blog-post',
      seo: '/tools/article-smasher/seo-article',
      academic: '/tools/article-smasher/academic-paper',
      news: '/tools/article-smasher/news-article'
    }
  },
  capabilities: {
    ai: {
      enabled: true,
      defaultModel: 'gpt-4',
      availableModels: ['gpt-3.5-turbo', 'gpt-4'],
      systemPromptTemplate: 'You are an AI assistant that helps create high-quality articles. {{useCase}}'
    },
    // Other capabilities...
  },
  useCases: {
    blog: {
      id: 'blog',
      label: 'Blog Post',
      description: 'Create engaging blog posts with proper structure',
      icon: Edit,
      promptTemplate: 'Write a blog post about: {{topic}}'
    },
    // Other use cases...
  },
  defaultUseCase: 'blog',
  metaTags: {
    title: 'ArticleSmasher | AI-Powered Content Creation Tool',
    description: 'Create high-quality articles, blog posts, and SEO content with AI assistance',
    ogImage: 'https://smashingapps.ai/og/article-smasher.png'
  }
};
```

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository
   ```
   git clone https://github.com/OpaceDigitalAgency/smashingapps-unified.git
   cd smashingapps-unified
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the development server
   ```
   npm run dev
   ```

The app will be available at http://localhost:5173/tools/article-smasher

## Component Structure

ArticleSmasher is built using a component-based architecture:

- **ArticleSmasherApp.tsx**: Main component that renders the entire application
- **Sidebar**: Navigation component for switching between use cases
- **Article Generation Form**: Form for entering article title, keywords, and other inputs
- **Article Display**: Component for displaying the generated article
- **Export Options**: Components for exporting articles in different formats

## API Integration

ArticleSmasher uses the OpenAI API through the shared AI service. This service handles:

- Making requests to the OpenAI API through the secure proxy
- Managing rate limiting
- Handling errors and loading states
- Processing and formatting responses

### Usage Example

```typescript
const { execute, isLoading, error } = useAI();

const generateArticle = async () => {
  try {
    const result = await execute({
      model: selectedModel,
      systemPrompt: systemPrompt,
      userPrompt: prompt,
      temperature: 0.7,
    });
    
    // Update the article with the result
    setArticle(result.content);
  } catch (error) {
    console.error('Error generating article:', error);
  }
};
```

## Customization

### Modifying Use Cases

To add or modify use cases:

1. Edit the `useCases` object in `src/tools/article-smasher/config.ts`
2. Add or modify the use case definition, including:
   - `id`: Unique identifier for the use case
   - `label`: Display name for the use case
   - `description`: Brief description of the use case
   - `icon`: Icon component from Lucide React
   - `promptTemplate`: Template for the AI prompt

### Modifying AI Settings

To modify AI settings:

1. Edit the `capabilities.ai` object in `src/tools/article-smasher/config.ts`
2. Adjust settings like:
   - `defaultModel`: Default AI model to use
   - `availableModels`: List of available AI models
   - `systemPromptTemplate`: Template for the system prompt

### Adding Export Formats

To add new export formats:

1. Edit the `capabilities.export.formats` array in `src/tools/article-smasher/config.ts`
2. Implement the export functionality in the `exportArticle` function in `ArticleSmasherApp.tsx`
## SEO Configuration

ArticleSmasher uses the centralized SEO system defined in `src/utils/seoMaster.ts`. This system provides:

- Meta tags for the main ArticleSmasher page
- Meta tags for each use case page (Blog Post, SEO Article, Academic Paper, News Article)
- Structured data for search engines
- Open Graph tags for social sharing

The SEO configuration is no longer managed through the `metaTags` section in the config file, but instead through the centralized `seoMaster.ts` file. This ensures consistency across the platform and simplifies SEO management.

## Future Enhancements

Planned enhancements for ArticleSmasher include:

- PDF export functionality
- Keyword analysis for SEO articles
- Article optimization suggestions
- Voice input for article topics
- Templates for different article types
- Saving and loading article drafts
- Saving and loading article drafts