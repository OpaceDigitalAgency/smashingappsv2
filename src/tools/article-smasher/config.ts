import { ToolConfig } from '../../shared/types';
import { FileText, Edit, BookOpen, Newspaper } from 'lucide-react';

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
    export: {
      enabled: true,
      formats: ['pdf', 'json', 'csv']
    },
    voice: {
      enabled: true
    },
    dragDrop: {
      enabled: false
    },
    rateLimit: {
      enabled: true,
      defaultLimit: 30
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
    }
  },
  defaultUseCase: 'blog',
  metaTags: {
    title: 'ArticleSmasher | AI-Powered Content Creation Tool',
    description: 'Create high-quality articles, blog posts, and SEO content with AI assistance',
    ogImage: 'https://smashingapps.ai/og/article-smasher.png'
  }
};

export default articleSmasherConfig;