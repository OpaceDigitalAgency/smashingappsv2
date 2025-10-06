# Complete Migration Checklist - SmashingApps v2

**Date Started**: 2025-01-13  
**Target Repository**: https://github.com/OpaceDigitalAgency/smashingappsv2  
**Goal**: 100% feature parity with original SmashingApps using new AI-Core architecture

---

## Phase 1: Preparation & Analysis ✅

### Dependencies Analysis
- [ ] **Article Smasher Dependencies**:
  - axios: ^1.6.2
  - framer-motion: ^11.0.8
  - html-to-text: ^9.0.5
  - lucide-react: ^0.344.0 (already installed)
  - react-beautiful-dnd: ^13.1.1
  - react-router-dom: ^6.22.2 (already installed)

- [ ] **Task Smasher Dependencies**:
  - @dnd-kit/core
  - @dnd-kit/sortable
  - @dnd-kit/utilities
  - xlsx (for Excel export)
  - jspdf (for PDF export)

### Article Smasher Structure (src/tools/article-smasher/src/)

#### Contexts (2 files)
- [ ] `contexts/ArticleWizardContext.tsx` - Main wizard state management
- [ ] `contexts/PromptContext.tsx` - Prompt management context

#### Hooks (2 files)
- [ ] `hooks/useArticleAI.ts` - AI integration hook
- [ ] `hooks/useArticleAIService.ts` - AI service wrapper

#### Services (3 files)
- [ ] `services/KeywordService.ts` - Keyword research service
- [ ] `services/articleAIService.ts` - Article generation service
- [ ] `services/promptService.ts` - Prompt management service

#### Components - Steps (6 step directories)
- [ ] `components/steps/TopicStep/TopicStep.tsx`
- [ ] `components/steps/TopicStep/TopicStepWithNav.tsx`
- [ ] `components/steps/KeywordStep/KeywordStep.tsx`
- [ ] `components/steps/KeywordStep/KeywordStepImproved.tsx`
- [ ] `components/steps/OutlineStep/OutlineStep.tsx`
- [ ] `components/steps/ContentStep/ContentStep.tsx`
- [ ] `components/steps/ImageStep/ImageStep.tsx`
- [ ] `components/steps/ImageStep/ImageStepWithNav.tsx`
- [ ] `components/steps/PublishStep/PublishStep.tsx`

#### Components - Layout (4 files)
- [ ] `components/layout/FixedNavigation.tsx`
- [ ] `components/layout/MainLayout.tsx`
- [ ] `components/layout/StepNavigation.tsx`
- [ ] `components/layout/WizardHeader.tsx`

#### Components - Admin (5 files)
- [ ] `components/admin/AdminDashboard.tsx`
- [ ] `components/admin/PromptEditor.tsx`
- [ ] `components/admin/PromptList.tsx`
- [ ] `components/admin/PromptTester.tsx`
- [ ] `components/admin/SettingsManager.tsx`

#### Components - Complete View (3 files)
- [ ] `components/complete/ArticleContent.tsx`
- [ ] `components/complete/CompleteArticle.tsx`
- [ ] `components/complete/ImageBank.tsx`

#### Components - Main (3 files)
- [ ] `components/ArticleWizard.tsx` - Main wizard component
- [ ] `components/ArticleTypeSidebar.tsx` - Article type selector
- [ ] `components/ArticleTypeSidebarImproved.tsx` - Enhanced sidebar

#### Styles (4 files)
- [ ] `components/article-smasher.css`
- [ ] `components/article-smasher-v2.css`
- [ ] `components/styles.css`
- [ ] `styles/article-smasher.css`
- [ ] `styles/article-smasher-v2.css`

#### Types & Utils
- [ ] `types/index.ts` - TypeScript type definitions
- [ ] `utils/adminBridge.ts` - Admin integration utilities

#### Main App
- [ ] `App.tsx` - Main Article Smasher app (633 lines)
- [ ] `main.tsx` - Entry point
- [ ] `index.css` - Global styles

**Total Article Smasher Files**: ~40 files

---

## Phase 2: Article Smasher Migration

### Step 1: Install Dependencies
```bash
cd smashing-apps-oop
npm install axios framer-motion html-to-text react-beautiful-dnd
npm install --save-dev @types/html-to-text @types/react-beautiful-dnd
```

### Step 2: Create Directory Structure
- [ ] Create `src/tools/article-smasher/contexts/`
- [ ] Create `src/tools/article-smasher/hooks/`
- [ ] Create `src/tools/article-smasher/services/`
- [ ] Create `src/tools/article-smasher/components/steps/`
- [ ] Create `src/tools/article-smasher/components/layout/`
- [ ] Create `src/tools/article-smasher/components/admin/`
- [ ] Create `src/tools/article-smasher/components/complete/`
- [ ] Create `src/tools/article-smasher/types/`
- [ ] Create `src/tools/article-smasher/utils/`
- [ ] Create `src/tools/article-smasher/styles/`

### Step 3: Migrate Core Infrastructure
- [ ] Copy and adapt contexts (ArticleWizardContext, PromptContext)
- [ ] Copy and adapt hooks (useArticleAI, useArticleAIService)
- [ ] Copy and adapt services (KeywordService, articleAIService, promptService)
- [ ] **Replace all AI service calls with `useAICore()` hook**

### Step 4: Migrate Components
- [ ] Copy all 6 wizard step components
- [ ] Copy all 4 layout components
- [ ] Copy all 5 admin components
- [ ] Copy all 3 complete view components
- [ ] Copy main components (ArticleWizard, ArticleTypeSidebar)

### Step 5: Migrate Styles & Types
- [ ] Copy all CSS files
- [ ] Copy TypeScript type definitions
- [ ] Copy utility files

### Step 6: Update Main App
- [ ] Replace simplified ArticleSmasherPage.tsx with full App.tsx
- [ ] Update routing in main App.tsx
- [ ] Test all features

---

## Phase 3: Task Smasher Migration

### Task Smasher Structure (src/tools/task-smasher/)

#### Components (13 files)
- [ ] `components/Board.tsx` - Main kanban board
- [ ] `components/DroppableBoard.tsx` - Drag-and-drop board
- [ ] `components/Task.tsx` - Task card component
- [ ] `components/Subtask.tsx` - Subtask component
- [ ] `components/Sidebar.tsx` - Use case sidebar
- [ ] `components/ModelDropdown.tsx` - AI model selector
- [ ] `components/StepNavigation.tsx` - Navigation component
- [ ] `components/RateLimitPopup.tsx` - Rate limit warning
- [ ] `components/TaskMismatchPopup.tsx` - Task validation popup
- [ ] `components/APISettingsModal.tsx` - API settings
- [ ] `components/ReCaptchaProvider.tsx` - ReCaptcha integration
- [ ] `components/OpenAIExample.tsx` - Example component
- [ ] `components/styles.css` - Component styles

#### Hooks (4 files)
- [ ] `hooks/useFileBackup.ts` - File backup functionality
- [ ] `hooks/useReCaptcha.ts` - ReCaptcha hook
- [ ] `hooks/useTasks.ts` - Task management hook
- [ ] `hooks/useTasksContext.tsx` - Task context provider

#### Utilities (5 files)
- [ ] `utils/index.ts` - Utility exports
- [ ] `utils/openaiServiceAdapter.ts` - OpenAI adapter
- [ ] `utils/promptTemplates.ts` - Prompt templates
- [ ] `utils/taskContextValidator.ts` - Task validation
- [ ] `utils/taskUtils.ts` - Task utilities (Excel/PDF export)
- [ ] `utils/useCaseDefinitions.ts` - 10+ use case definitions

#### Types (3 files)
- [ ] `types/index.ts` - Main type definitions
- [ ] `types/aiProviders.ts` - AI provider types
- [ ] `types/netlify-blobs.d.ts` - Netlify types

#### Main App
- [ ] `TaskSmasherApp.tsx` - Main app (974 lines)
- [ ] `config.ts` - Configuration

**Total Task Smasher Files**: ~25 files

### Step 1: Install Dependencies
```bash
cd smashing-apps-oop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities xlsx jspdf
```

### Step 2: Create Directory Structure
- [ ] Create `src/tools/task-smasher/components/`
- [ ] Create `src/tools/task-smasher/hooks/`
- [ ] Create `src/tools/task-smasher/utils/`
- [ ] Create `src/tools/task-smasher/types/`

### Step 3: Migrate Components
- [ ] Copy all 13 components
- [ ] Update imports to use AI-Core
- [ ] Test drag-and-drop functionality

### Step 4: Migrate Hooks & Utilities
- [ ] Copy all 4 hooks
- [ ] Copy all 5 utilities
- [ ] Copy all 3 type files
- [ ] **Replace AI service calls with `useAICore()` hook**

### Step 5: Update Main App
- [ ] Replace simplified TaskSmasherPage.tsx with full TaskSmasherApp.tsx
- [ ] Ensure all 10+ use cases work
- [ ] Test export functionality (Excel/PDF)
- [ ] Test version control
- [ ] Test file backup

---

## Phase 4: Shared Components & Landing Page

### Landing Page Components (src/components/)
- [ ] `components/Hero.tsx` - Hero section
- [ ] `components/Features.tsx` - Features section
- [ ] `components/Testimonials.tsx` - Testimonials section
- [ ] `components/Tools.tsx` - Tools showcase
- [ ] `components/CTA.tsx` - Call-to-action
- [ ] `components/Contact.tsx` - Contact section
- [ ] `components/Navbar.tsx` - Navigation bar
- [ ] `components/Footer.tsx` - Footer
- [ ] `components/SEO.tsx` - SEO component
- [ ] `components/StructuredData.tsx` - Structured data
- [ ] `components/SemanticSection.tsx` - Semantic wrapper

### Shared Components (src/shared/)
- [ ] Review and copy any missing shared components
- [ ] Ensure all shared services are compatible with AI-Core

### Branding Assets (public/)
- [ ] Copy all logos
- [ ] Copy all favicons
- [ ] Copy all images
- [ ] Copy _redirects file

### Update Main App
- [ ] Update `src/pages/HomePage.tsx` with full landing page
- [ ] Update `src/App.tsx` routing
- [ ] Ensure navigation works correctly

---

## Phase 5: Testing & Validation

### TypeScript Validation
- [ ] Run `npm run type-check` - Fix all type errors
- [ ] Run `npm run lint` - Fix all linting errors

### Article Smasher Testing
- [ ] Test Topic Step (AI generation)
- [ ] Test Keyword Step (keyword research)
- [ ] Test Outline Step (outline generation)
- [ ] Test Content Step (article writing)
- [ ] Test Image Step (image generation)
- [ ] Test Publish Step (export/download)
- [ ] Test Admin Dashboard
- [ ] Test Prompt Management
- [ ] Test Article Type Sidebar

### Task Smasher Testing
- [ ] Test drag-and-drop functionality
- [ ] Test all 10+ use cases
- [ ] Test task creation with AI
- [ ] Test subtask management
- [ ] Test Excel export
- [ ] Test PDF export
- [ ] Test version control
- [ ] Test file backup
- [ ] Test voice input (if applicable)

### AI-Core Integration Testing
- [ ] Test OpenAI provider
- [ ] Test Anthropic provider
- [ ] Test Gemini provider
- [ ] Test OpenRouter provider
- [ ] Test provider switching
- [ ] Test model selection
- [ ] Test usage tracking
- [ ] Test rate limiting

### Build & Production Testing
- [ ] Run `npm run build` - Verify successful build
- [ ] Test production build locally
- [ ] Check bundle size
- [ ] Test all features in production mode

---

## Phase 6: Deployment

### Pre-Deployment
- [ ] Create comprehensive deployment documentation
- [ ] Update README.md with new architecture
- [ ] Update all documentation files
- [ ] Verify all features work locally

### Git Operations
- [ ] Commit all changes with descriptive message
- [ ] Push to https://github.com/OpaceDigitalAgency/smashingappsv2
- [ ] Verify GitHub repository

### Netlify Deployment
- [ ] Monitor Netlify build logs
- [ ] Verify successful deployment
- [ ] Test live site thoroughly
- [ ] Verify all AI providers work on production
- [ ] Test all features on live site

### Post-Deployment Validation
- [ ] Test Article Smasher on production
- [ ] Test Task Smasher on production
- [ ] Test admin features on production
- [ ] Verify usage tracking on production
- [ ] Monitor for any errors

---

## Success Criteria

✅ **Article Smasher**: All 6 wizard steps working with AI-Core  
✅ **Task Smasher**: Drag-and-drop, all use cases, export working  
✅ **AI-Core**: All 4 providers working correctly  
✅ **Landing Page**: Full design with all sections  
✅ **Build**: No TypeScript or build errors  
✅ **Production**: All features working on live site  

---

## Notes

- **AI-Core Integration**: All AI service calls must use `useAICore()` hook
- **Feature Parity**: Must match 100% of original functionality
- **Testing**: Test each phase before moving to next
- **Documentation**: Update docs as we go
- **Repository**: Push to smashingappsv2, NOT smashingapps-unified

