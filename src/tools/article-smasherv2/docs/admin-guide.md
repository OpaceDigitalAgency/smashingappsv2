# Article Smasher v2 - Admin Guide

## Introduction

Welcome to the Article Smasher v2 Admin Guide. This document is designed for administrators who need to configure, maintain, and optimize the AI-powered article generation system. As an admin, you'll have access to powerful tools for customizing prompt templates, configuring system settings, and ensuring optimal performance.

## Table of Contents

1. [Accessing the Admin Interface](#accessing-the-admin-interface)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [Managing Prompt Templates](#managing-prompt-templates)
   - [Viewing Prompt Templates](#viewing-prompt-templates)
   - [Creating New Prompt Templates](#creating-new-prompt-templates)
   - [Editing Existing Templates](#editing-existing-templates)
   - [Testing Prompt Templates](#testing-prompt-templates)
   - [Deleting Prompt Templates](#deleting-prompt-templates)
4. [System Configuration](#system-configuration)
   - [API Settings](#api-settings)
   - [Model Settings](#model-settings)
   - [WordPress Integration](#wordpress-integration)
   - [User Permissions](#user-permissions)
5. [Prompt Engineering Best Practices](#prompt-engineering-best-practices)
6. [Monitoring and Analytics](#monitoring-and-analytics)
7. [Troubleshooting](#troubleshooting)

## Accessing the Admin Interface

The admin interface can be accessed through the following methods:

1. **Direct URL**: Navigate to `/admin` from the base URL of your Article Smasher v2 installation.
2. **Navigation Menu**: Click on the "Admin" or "Settings" link in the main navigation menu.

**Authentication Requirements**:
- Admin access requires administrator privileges in WordPress
- You must be logged in with an account that has the `manage_options` capability

## Admin Dashboard Overview

The admin dashboard provides a comprehensive overview of the system status and quick access to all administrative functions:

- **Prompt Templates**: Manage the AI prompt templates for each stage of the article creation process
- **System Settings**: Configure API connections, model parameters, and integration settings
- **Analytics**: View usage statistics, API costs, and content generation metrics
- **User Management**: Control access permissions and user roles
- **Logs**: Access system logs for troubleshooting and auditing

## Managing Prompt Templates

Prompt templates are the core of Article Smasher v2's AI capabilities. Each template defines how the system interacts with the AI models to generate specific types of content.

### Viewing Prompt Templates

The Prompt Templates section displays all available templates organized by category:

- **Topic**: Templates for generating article topic ideas
- **Keyword**: Templates for keyword research and suggestions
- **Outline**: Templates for creating article outlines
- **Content**: Templates for generating article content
- **Image**: Templates for creating image generation prompts

Each template listing shows:
- Template name
- Category
- Last modified date
- Status (active/inactive)

### Creating New Prompt Templates

To create a new prompt template:

1. Click the "Create New Prompt" button in the Prompt Templates section
2. Fill in the following fields:
   - **Name**: A descriptive name for the template
   - **Category**: Select the appropriate category (topic, keyword, outline, content, image)
   - **Description**: A brief explanation of what the template does
   - **System Prompt**: Instructions that define the AI's role and general behavior
   - **User Prompt Template**: The specific prompt with variable placeholders (e.g., `{{title}}`, `{{keywords}}`)
   - **Temperature**: Controls randomness (0.0-1.0, lower = more deterministic)
   - **Max Tokens**: Maximum length of the generated response

3. Click "Create Prompt" to save the new template

**Example System Prompt for Topic Generation**:
```
You are a professional content strategist specializing in creating engaging article topics. Your task is to generate 5 compelling topic ideas for the specified article type.
```

**Example User Prompt Template for Topic Generation**:
```
Generate 5 engaging topic ideas for a {{articleType}} about {{subject}}. Each topic should be SEO-friendly and appeal to my target audience.
```

### Editing Existing Templates

To edit an existing prompt template:

1. Click on the template name in the list
2. Modify any of the fields as needed
3. Click "Update Prompt" to save your changes

**Important**: Changes to prompt templates will affect all future content generation but will not retroactively change previously generated content.

### Testing Prompt Templates

Before implementing a new or modified template, you should test it:

1. Select the template you want to test
2. Click the "Test Prompt" button
3. Enter test values for all variables in the template
4. Click "Run Test"
5. Review the generated output
6. Make adjustments to the template as needed

### Deleting Prompt Templates

To delete a prompt template:

1. Select the template you want to delete
2. Click the "Delete" button
3. Confirm the deletion when prompted

**Warning**: Deleting a template cannot be undone. If you're unsure, consider deactivating the template instead by setting its status to "inactive" in the edit screen.

## System Configuration

### API Settings

Configure the connection to OpenAI's API and other external services:

1. **OpenAI API Key**: Enter your OpenAI API key
2. **API Request Timeout**: Set the maximum time (in seconds) to wait for API responses
3. **Retry Settings**: Configure automatic retry attempts for failed API calls
4. **Rate Limiting**: Set usage limits to control API costs

**Best Practices**:
- Store your API key securely
- Set reasonable timeouts (15-30 seconds recommended)
- Configure 2-3 retry attempts with exponential backoff
- Implement rate limiting based on your budget

### Model Settings

Configure the AI models used for content generation:

1. **Default Model**: Select the primary model (e.g., GPT-4o, GPT-4o-mini)
2. **Fallback Model**: Select a backup model if the primary is unavailable
3. **Default Temperature**: Set the default creativity level (0.0-1.0)
4. **Default Max Tokens**: Set the default maximum response length

**Recommended Settings**:
- For most content: GPT-4o with temperature 0.7
- For factual content: GPT-4o with temperature 0.3-0.5
- For creative content: GPT-4o with temperature 0.8-1.0
- Max tokens: 1000-3000 depending on expected content length

### WordPress Integration

Configure how Article Smasher v2 integrates with WordPress:

1. **WordPress API Endpoint**: Enter your WordPress site's REST API URL
2. **Authentication**: Configure API authentication (API key or OAuth)
3. **Default Post Status**: Set whether articles are published as drafts or published immediately
4. **Category Mapping**: Map article types to WordPress categories
5. **Tag Handling**: Configure how keywords are converted to tags

### User Permissions

Control which users can access different features:

1. **Role Management**: Assign capabilities to WordPress roles
2. **Feature Access**: Control which user roles can access specific features
3. **API Usage Limits**: Set limits on API usage per user or role

## Prompt Engineering Best Practices

Effective prompt engineering is crucial for generating high-quality content. Here are best practices for each template type:

### General Principles

1. **Be Specific**: Clearly define the expected output format and content
2. **Provide Context**: Include relevant background information
3. **Use Examples**: Demonstrate the desired output style
4. **Control Tone**: Specify the desired tone and style
5. **Limit Scope**: Break complex tasks into smaller, focused prompts

### Topic Generation Prompts

**Best Practices**:
- Specify the target audience
- Include the content purpose (inform, persuade, entertain)
- Define the desired level of specificity
- Request a variety of angles on the topic

**Example Improvement**:
```
Generate 5 engaging topic ideas for a {{articleType}} about {{subject}} targeting {{audience}}. Each topic should be SEO-friendly, specific enough to cover in a 1500-word article, and include a unique angle or perspective. Include a mix of how-to, list-based, and problem-solving topics.
```

### Keyword Research Prompts

**Best Practices**:
- Request a mix of head terms and long-tail keywords
- Ask for relevance and competition metrics
- Specify the number of keywords needed
- Request grouping by search intent

**Example Improvement**:
```
Identify 10 relevant keywords for an article titled "{{title}}". Include a mix of high-volume head terms and specific long-tail keywords. For each keyword, provide an estimated search volume (high/medium/low), difficulty score (1-10), and potential CPC value. Group keywords by search intent (informational, navigational, transactional).
```

### Outline Generation Prompts

**Best Practices**:
- Specify the desired structure (number of sections, depth)
- Request logical flow between sections
- Ask for keyword integration in headings
- Include instructions for introduction and conclusion

**Example Improvement**:
```
Create a detailed outline for an article titled "{{title}}". The article should incorporate these keywords: {{keywords}}. Include an engaging introduction that hooks the reader, 4-6 main sections with 2-3 subsections each, and a compelling conclusion with a call to action. Ensure a logical flow between sections and naturally incorporate keywords in headings where appropriate.
```

### Content Generation Prompts

**Best Practices**:
- Specify the desired tone and style
- Request proper formatting (headings, lists, paragraphs)
- Ask for evidence, examples, or data points
- Include instructions for transitions between sections

**Example Improvement**:
```
Write a comprehensive article titled "{{title}}" following this outline: {{outline}}. Naturally incorporate these keywords: {{keywords}}. The article should be engaging, informative, and written in a conversational yet authoritative tone. Include relevant examples, statistics, or case studies to support key points. Use proper H2 and H3 headings, bullet points for lists, and short paragraphs for readability. Create smooth transitions between sections and conclude with actionable takeaways.
```

### Image Prompt Generation

**Best Practices**:
- Request specific visual elements
- Specify style and mood
- Include subject matter details
- Avoid prohibited content

**Example Improvement**:
```
Create 3 detailed image prompts for an article titled "{{title}}" about {{keywords}}. Each prompt should describe a scene or concept that would visually enhance the article. Include specific details about composition, style, mood, and key elements to include. The images should be professional, relevant to the content, and avoid any prohibited content (violence, adult content, etc.).
```

## Monitoring and Analytics

The admin interface provides several tools for monitoring system performance and usage:

### Usage Statistics

- **API Calls**: Track the number of API calls made
- **Token Usage**: Monitor token consumption by model and template
- **Cost Tracking**: Estimate API costs based on usage
- **User Activity**: See which users are generating the most content

### Content Analytics

- **Generation Time**: Average time to generate different content types
- **Content Length**: Average length of generated content
- **Completion Rate**: Percentage of started articles that are completed
- **Editing Rate**: How much users edit the generated content

### Performance Monitoring

- **API Response Times**: Track how quickly the AI models respond
- **Error Rates**: Monitor failed API calls and system errors
- **System Load**: Track server resource usage during content generation

## Troubleshooting

### Common Admin Issues

#### API Connection Problems

**Issue**: Unable to connect to OpenAI API

**Solutions**:
- Verify API key is correct and has sufficient credits
- Check network connectivity from your server to OpenAI
- Verify firewall settings allow outbound connections
- Check for API status issues on OpenAI's status page

#### Prompt Template Errors

**Issue**: Prompt templates not generating expected results

**Solutions**:
- Test the template with different variables
- Check for syntax errors in variable placeholders
- Verify the template isn't exceeding token limits
- Adjust temperature settings for more consistent results

#### WordPress Integration Issues

**Issue**: Articles not publishing to WordPress

**Solutions**:
- Verify WordPress API credentials
- Check WordPress site is accessible from the server
- Ensure proper permissions are configured
- Check for plugin conflicts in WordPress

#### Performance Issues

**Issue**: Slow content generation or system timeouts

**Solutions**:
- Optimize prompt templates to be more concise
- Adjust max token settings to appropriate levels
- Implement request queuing for high-traffic periods
- Upgrade server resources if necessary

### Getting Support

If you encounter issues that can't be resolved using this guide:

1. Check the system logs for error messages
2. Consult the developer documentation
3. Contact technical support at support@example.com
4. Visit our community forum at forum.example.com