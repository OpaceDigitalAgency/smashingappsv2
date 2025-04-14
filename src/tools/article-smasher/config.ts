import { ToolConfig } from '../../shared/types';
import { FileText, Edit, BookOpen, Newspaper, BrainCircuit } from 'lucide-react';

const articleSmasherConfig: ToolConfig = {
  id: 'article-smasher',
  name: 'ArticleSmasher',
  description: 'Advanced AI-powered content creation with GPT-4o integration',
  icon: BrainCircuit,
  routes: {
    base: '/tools/article-smasher',
    subRoutes: {
      blog: '/tools/article-smasher/blog-post',
      seo: '/tools/article-smasher/seo-article',
      academic: '/tools/article-smasher/academic-paper',
      news: '/tools/article-smasher/news-article',
      demo: '/tools/article-smasher/demo'
    }
  },
  capabilities: {
    ai: {
      enabled: true,
      defaultModel: 'gpt-4o',
      availableModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4'],
      systemPromptTemplate: 'You are an AI assistant that helps create high-quality articles with advanced capabilities. {{useCase}}'
    },
    export: {
      enabled: true,
      formats: ['pdf', 'json', 'csv', 'excel']
    },
    voice: {
      enabled: true
    },
    dragDrop: {
      enabled: false
    },
    rateLimit: {
      enabled: true,
      defaultLimit: 10
    }
  },
  useCases: {
    blog: {
      id: 'blog',
      label: 'Blog Post',
      description: 'Create engaging blog posts with proper structure',
      icon: Edit,
      promptTemplate: 'Write a blog post about: {{topic}}'
    },
    seo: {
      id: 'seo',
      label: 'SEO Article',
      description: 'Generate SEO-optimized content for better rankings',
      icon: Newspaper,
      promptTemplate: 'Write an SEO-optimized article about {{topic}} targeting the keywords: {{keywords}}'
    },
    academic: {
      id: 'academic',
      label: 'Academic Paper',
      description: 'Create academic-style content with proper citations',
      icon: BookOpen,
      promptTemplate: 'Write an academic paper on the topic: {{topic}}'
    },
    news: {
      id: 'news',
      label: 'News Article',
      description: 'Generate news-style articles with journalistic structure',
      icon: Newspaper,
      promptTemplate: 'Write a news article about: {{topic}}'
    },
    demo: {
      id: 'demo',
      label: 'Demo',
      description: 'Try out the AI Scribe demo',
      icon: BrainCircuit,
      promptTemplate: 'Show a demonstration of AI Scribe capabilities'
    }
  },
  defaultUseCase: 'blog',
  metaTags: {
    title: 'ArticleSmasher V2 | Advanced AI Content Creation',
    description: 'Create high-quality content with GPT-4o integration, multi-language support, and advanced humanization features',
    ogImage: 'https://smashingapps.ai/og/article-smasher.png'
  }
};
export default articleSmasherConfig;