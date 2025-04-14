# Article Smasher v2 - User Guide

## Introduction

Welcome to Article Smasher v2, an AI-powered content creation tool designed to streamline the process of generating high-quality, SEO-optimized articles for WordPress. This guide will walk you through the article creation workflow, explain what to expect at each stage, provide tips for getting the best results, and help you troubleshoot common issues.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Article Creation Workflow](#article-creation-workflow)
   - [Step 1: Topic Selection](#step-1-topic-selection)
   - [Step 2: Keyword Research](#step-2-keyword-research)
   - [Step 3: Outline Generation](#step-3-outline-generation)
   - [Step 4: Content Creation](#step-4-content-creation)
   - [Step 5: Image Selection](#step-5-image-selection)
   - [Step 6: Publishing](#step-6-publishing)
3. [Tips for Best Results](#tips-for-best-results)
4. [Troubleshooting](#troubleshooting)
5. [Frequently Asked Questions](#frequently-asked-questions)

## Getting Started

### System Requirements

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- An active OpenAI API key with access to GPT-4o models
- WordPress 5.6 or higher (for publishing integration)

### Setting Up Your API Key

1. Navigate to the unified admin interface at smashingapps.ai/admin
2. Go to the "Provider Management" section
3. Select the provider you want to use (e.g., OpenAI)
4. Enter your API key in the designated field
5. Click "Save"

> **Note**: Article Smasher v2 now uses a unified admin interface that is shared across all SmashingApps.ai tools. This provides a centralized place to manage API keys, models, and settings for all applications.

## Article Creation Workflow

Article Smasher v2 guides you through a systematic, step-by-step process to create comprehensive, polished content. Each step builds upon the previous one, ensuring a cohesive final article.

### Step 1: Topic Selection

In this initial step, you'll define the topic and type of article you want to create.

**What to expect:**
- Article type selection (Blog Post, SEO Article, Academic Paper, News Article, Product Description)
- Topic input field for manual entry
- AI-powered topic suggestions based on your selected article type
- Option to regenerate topic ideas

**Actions you can take:**
1. Select an article type from the available options
2. Enter your own topic or select one of the AI-generated suggestions
3. Click "Generate Ideas" to get AI-powered topic suggestions
4. Click "Next" to proceed to the keyword research step

**Tips:**
- Be specific with your topic to get more focused content
- Choose topics that align with your content strategy and audience interests
- If you're unsure, use the AI-generated suggestions as inspiration

### Step 2: Keyword Research

This step helps you identify and select relevant keywords to optimize your article for search engines.

**What to expect:**
- Automatically generated keyword suggestions based on your topic
- Metrics for each keyword (search volume, difficulty, CPC)
- Option to select multiple keywords for your article

**Actions you can take:**
1. Review the suggested keywords and their metrics
2. Select the keywords you want to include in your article (3-5 recommended)
3. Click "Next" to proceed to the outline generation step

**Tips:**
- Choose a mix of high-volume and long-tail keywords
- Select keywords that are relevant to your topic and audience
- Don't overselect keywords - focus on quality over quantity

### Step 3: Outline Generation

In this step, the system creates a structured outline for your article based on your topic and selected keywords.

**What to expect:**
- AI-generated article outline with headings and subheadings
- Hierarchical structure with main sections and subsections
- Option to edit the outline before proceeding

**Actions you can take:**
1. Review the generated outline
2. Drag and drop sections to reorder them (if needed)
3. Edit section titles by clicking on them
4. Add or remove sections using the provided controls
5. Click "Next" to proceed to the content creation step

**Tips:**
- Ensure the outline covers all aspects of your topic
- Check that your keywords are represented in the outline
- A well-structured outline leads to better-organized content

### Step 4: Content Creation

This is where the AI generates the full content of your article based on the outline and keywords.

**What to expect:**
- AI-generated content for each section of your outline
- HTML-formatted text with proper headings, paragraphs, and lists
- Option to regenerate specific sections if needed

**Actions you can take:**
1. Review the generated content
2. Edit any section by clicking on it
3. Regenerate specific sections using the refresh button
4. Click "Next" to proceed to the image selection step

**Tips:**
- Review the content carefully for accuracy and relevance
- Make edits to add your unique perspective or brand voice
- Ensure the content flows naturally between sections

### Step 5: Image Selection

This step allows you to generate and select relevant images for your article.

**What to expect:**
- AI-generated image prompts based on your topic and keywords
- Placeholder images (in the demo) or DALL-E 3 generated images (with API access)
- Options to select featured and section images

**Actions you can take:**
1. Review the generated images
2. Select a featured image for your article
3. Select additional images for article sections
4. Click "Next" to proceed to the publishing step

**Tips:**
- Choose images that visually represent your topic
- Select a compelling featured image to attract readers
- Add alt text and captions to improve accessibility and SEO

### Step 6: Publishing

The final step prepares your article for publication to WordPress.

**What to expect:**
- SEO preview with title, meta description, and URL
- Complete article preview with all content and images
- Publishing options for WordPress integration

**Actions you can take:**
1. Review the SEO elements and edit if needed
2. Preview the complete article
3. Select publishing options (draft, publish immediately, schedule)
4. Click "Complete" to finalize and publish your article

**Tips:**
- Craft a compelling meta description to improve click-through rates
- Review the entire article one last time before publishing
- Consider scheduling publication for optimal timing

## Tips for Best Results

### General Tips

1. **Be specific with your topic**: The more specific your initial topic, the more focused and valuable your article will be.

2. **Select relevant keywords**: Choose keywords that align with your topic and have reasonable search volume and competition.

3. **Review and edit AI-generated content**: While the AI produces high-quality content, adding your unique perspective and voice will make the article more authentic.

4. **Optimize for readability**: Break up long paragraphs, use bullet points, and include subheadings to make your content easy to scan.

5. **Include relevant images**: Visual elements enhance engagement and help illustrate complex concepts.

### Model-Specific Tips

The unified admin interface allows you to choose from multiple AI providers and models:

1. **OpenAI Models**:
   - **GPT-4o**: Best for comprehensive, detailed articles. Provides the highest quality output but may be slower and more expensive.
   - **GPT-4o-mini**: Good for shorter articles or drafts. Faster and more cost-effective but may produce less detailed content.
   - **GPT-3.5 Turbo**: Most economical option for basic content.

2. **Anthropic Models** (if configured):
   - **Claude 3 Opus**: Comparable to GPT-4o with excellent reasoning capabilities.
   - **Claude 3 Sonnet**: Balanced performance and speed.
   - **Claude 3 Haiku**: Fast and cost-effective.

3. **Google Models** (if configured):
   - **Gemini 1.5 Pro**: Google's advanced model with strong reasoning capabilities.
   - **Gemini 1.5 Flash**: Faster, more economical Google model.

### Content Type Tips

1. **Blog Posts**: Focus on engaging, conversational content with personal insights.

2. **SEO Articles**: Emphasize keyword optimization and comprehensive coverage of the topic.

3. **Academic Papers**: Include more data, citations, and formal language.

4. **News Articles**: Focus on timeliness, facts, and objective reporting.

5. **Product Descriptions**: Highlight features, benefits, and unique selling points.

## Troubleshooting

### Common Issues and Solutions

#### API Connection Issues

**Issue**: "Failed to connect to API" or similar error messages.

**Solutions**:
- Verify your API key is entered correctly in the unified admin interface
- Check that your account has available credits for the selected provider
- Ensure your internet connection is stable
- Try a different AI provider if one is not working
- Try refreshing the page and attempting the operation again

#### Content Generation Timeout

**Issue**: Content generation takes too long or times out.

**Solutions**:
- Try generating smaller sections of content at a time
- Switch to a faster model (e.g., GPT-4o-mini) for initial drafts
- Check your internet connection
- Refresh the page and try again

#### Keyword Research Not Loading

**Issue**: Keyword suggestions don't appear or take too long to load.

**Solutions**:
- Make sure your topic is specific enough
- Check your API connection
- Try refreshing the page
- Enter a different topic

#### Image Generation Issues

**Issue**: Images don't generate or appear as placeholders.

**Solutions**:
- Verify your OpenAI API key has DALL-E 3 access
- Check that your prompts are specific and descriptive
- Try regenerating the image prompts
- Use your own images if AI generation continues to fail

#### WordPress Publishing Errors

**Issue**: Unable to publish to WordPress.

**Solutions**:
- Verify your WordPress credentials
- Check that your WordPress site is accessible
- Ensure you have the appropriate permissions on your WordPress site
- Try publishing as a draft first, then publish from WordPress

## Frequently Asked Questions

**Q: Do I need my own API keys?**

A: Yes, you need to provide your own API keys in the unified admin interface. You can use OpenAI, Anthropic, Google, or other providers depending on your preference. This ensures you have full control over your API usage and costs.

**Q: How much does it cost to generate an article?**

A: The cost depends on the length of the article, the provider, and the model used. Typically, a 1500-word article using GPT-4o might cost between $0.50-$2.00 in API charges. Using GPT-4o-mini can reduce costs by 50-70%. Other providers like Anthropic or Google may have different pricing structures.

**Q: Can I edit the content after it's generated?**

A: Yes, you can edit any part of the generated content at any stage of the process. After publishing, you can also make further edits in WordPress.

**Q: How long does it take to create an article?**

A: The entire process typically takes 10-15 minutes, depending on the length and complexity of the article. Most of this time is spent reviewing and refining the AI-generated content.

**Q: Is the content unique and plagiarism-free?**

A: Yes, all content is generated uniquely by the AI based on your inputs. However, it's always good practice to review the content and add your own perspective to ensure it fully represents your brand voice.

**Q: What WordPress versions is Article Smasher compatible with?**

A: Article Smasher is compatible with WordPress version 5.6 and above. For the best experience, we recommend using the latest version of WordPress.

**Q: Can I create content in languages other than English?**

A: Yes, Article Smasher supports content creation in over 30 languages. Simply specify your desired language during the topic selection phase.