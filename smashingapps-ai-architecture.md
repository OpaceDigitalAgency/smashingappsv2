# SmashingApps AI Architecture

This document provides a detailed analysis of the AI components in the SmashingApps platform, focusing on how they are shared between Task Smasher and Article Smasher.

## 1. AI Components and Data Flow

```mermaid
graph TD
    subgraph "Task Smasher"
        TaskSmasherApp --> TaskSmasherComponents[Task Smasher Components]
        TaskSmasherComponents --> SharedPromptRunner1[PromptRunner Component]
    end
    
    subgraph "Article Smasher"
        ArticleSmasherApp --> ArticleSmasherComponents[Article Smasher Components]
        ArticleSmasherComponents --> SharedPromptRunner2[PromptRunner Component]
    end
    
    subgraph "Shared AI Components"
        SharedPromptRunner1 & SharedPromptRunner2 --> useAI[useAI Hook]
        
        useAI --> ModelSelection["Model Selection:
        1. Check requested model
        2. Check global override (smashingapps_activeModel)
        3. Use selected model"]
        
        useAI --> ServiceSelection["Service Selection:
        1. Get service for requested model
        2. Get service for global model
        3. Fall back to legacy service"]
        
        ServiceSelection --> aiServiceRegistry
        ServiceSelection --> LegacyAIService
        
        aiServiceRegistry --> OpenAIService
        aiServiceRegistry --> AnthropicService
        aiServiceRegistry --> OpenRouterService
        aiServiceRegistry --> GoogleService
        aiServiceRegistry --> ImageService
        
        OpenAIService & AnthropicService & OpenRouterService & GoogleService & ImageService --> WrappedServices[Services wrapped with usage tracking]
    end
    
    subgraph "AI Service Initialization"
        initializeAIServices[initializeAIServicesWithTracking] --> aiServiceRegistry
        initializeAIServices --> aiServiceWrapper
        
        aiServiceWrapper --> AppIdentification["App Identification:
        1. FORCE_APP_ID
        2. current_app
        3. App-specific flags
        4. URL path
        5. DOM elements"]
        
        AppIdentification --> usageTrackingService
    end
    
    subgraph "Local Storage"
        localStorage1["localStorage:
        - smashingapps_activeModel
        - smashingapps_activeProvider
        - openai_api_key, etc.
        - smashingapps_usage_data"]
        
        localStorage2["App Identification:
        - FORCE_APP_ID
        - current_app
        - article_smasher_app
        - article_wizard_state
        - task_list_state"]
    end
    
    ModelSelection --> localStorage1
    AppIdentification --> localStorage2
    usageTrackingService --> localStorage1
```

## 2. AI Request Flow from Each App

```mermaid
sequenceDiagram
    participant TaskSmasher
    participant ArticleSmasher
    participant PromptRunner
    participant useAI
    participant Registry as aiServiceRegistry
    participant Service as AI Service
    participant Wrapper as aiServiceWrapper
    participant UsageTracking as usageTrackingService
    participant LocalStorage
    
    Note over TaskSmasher, ArticleSmasher: Both apps use the same shared components
    
    TaskSmasher->>PromptRunner: Send prompt with options
    ArticleSmasher->>PromptRunner: Send prompt with options
    
    PromptRunner->>useAI: execute(options)
    
    useAI->>LocalStorage: Get smashingapps_activeModel
    LocalStorage-->>useAI: Return global model (if set)
    
    useAI->>Registry: getServiceForModel(model)
    Registry-->>useAI: Return appropriate service
    
    useAI->>Service: createChatCompletion(options)
    
    Service->>Wrapper: Request intercepted by wrapper
    
    Wrapper->>LocalStorage: Get app identification data
    LocalStorage-->>Wrapper: Return app ID flags
    
    Note over Wrapper: Determine which app is making the request
    
    Wrapper->>Service: Forward request to actual service
    Service-->>Wrapper: Return response
    
    Wrapper->>UsageTracking: trackApiRequest(provider, tokens, appId)
    UsageTracking->>LocalStorage: Save usage data with app ID
    
    Wrapper-->>useAI: Return wrapped response
    useAI-->>PromptRunner: Return result
    PromptRunner-->>TaskSmasher: Update UI with result
    PromptRunner-->>ArticleSmasher: Update UI with result
```

## 3. AI Service Initialization and Sharing

```mermaid
graph TD
    subgraph "Application Initialization"
        App[App.tsx] --> GlobalSettingsProvider
        App --> initializeGlobalSettings
        
        GlobalSettingsProvider --> settingsSynchronizer
        
        initializeGlobalSettings --> globalSettingsService
        initializeGlobalSettings --> applyGlobalSettingsToAllApps
        
        TaskSmasherApp & ArticleSmasherApp --> initializeAIServices
        
        initializeAIServices --> aiServiceRegistry
        initializeAIServices --> aiServiceWrapper
    end
    
    subgraph "AI Service Registration"
        aiServiceRegistry --> RegisterServices["Register Services:
        - OpenAIService
        - AnthropicService
        - OpenRouterService
        - GoogleService
        - ImageService"]
        
        aiServiceWrapper --> WrapServices["Wrap Services with:
        - Usage tracking
        - App identification
        - Error handling"]
    end
    
    subgraph "Settings Synchronization"
        applyGlobalSettingsToAllApps --> TaskSmasherSettings["TaskSmasher Settings:
        - smashingapps_activeProvider
        - smashingapps_activeModel"]
        
        applyGlobalSettingsToAllApps --> ArticleSmasherSettings["ArticleSmasher Settings:
        - article_smasher_prompt_settings"]
        
        settingsSynchronizer --> SyncKeys["Synchronize Keys:
        - global-settings
        - smashingapps-global-settings
        - smashingapps_activeModel
        - openai_api_key"]
    end
```

## 4. App Identification for AI Usage Tracking

```mermaid
graph TD
    subgraph "App Identification Process"
        AIRequest[AI Request] --> getAppIdForService
        
        getAppIdForService --> CheckForcedAppId["1. Check FORCE_APP_ID"]
        CheckForcedAppId -- "If set" --> UseForcedAppId["Use forced app ID"]
        CheckForcedAppId -- "If not set" --> CheckCurrentApp["2. Check current_app"]
        
        CheckCurrentApp -- "If set" --> UseCurrentApp["Use current_app value"]
        CheckCurrentApp -- "If not set" --> CheckAppFlags["3. Check app-specific flags"]
        
        CheckAppFlags -- "If article_smasher_app or article_wizard_state exists" --> UseArticleSmasher["Use 'article-smasher'"]
        CheckAppFlags -- "If task_list_state exists" --> UseTaskSmasher["Use 'task-smasher'"]
        CheckAppFlags -- "If no flags exist" --> CheckURLPath["4. Check URL path"]
        
        CheckURLPath -- "If path includes 'article-smasher'" --> UseArticleSmasher
        CheckURLPath -- "If path includes 'task-smasher'" --> UseTaskSmasher
        CheckURLPath -- "If path doesn't match" --> CheckDOM["5. Check DOM elements"]
        
        CheckDOM -- "If .article-smasher-container exists" --> UseArticleSmasher
        CheckDOM -- "If .task-smasher-container exists" --> UseTaskSmasher
        CheckDOM -- "If no elements match" --> UseUnknown["Use 'unknown-app'"]
    end
    
    subgraph "Usage Tracking with App ID"
        UseForcedAppId & UseCurrentApp & UseArticleSmasher & UseTaskSmasher & UseUnknown --> trackApiRequest
        
        trackApiRequest --> UpdateUsageStats["Update usage statistics:
        - Total requests/tokens
        - Requests/tokens by provider
        - Requests/tokens by app"]
        
        UpdateUsageStats --> SaveUsageData["Save to localStorage:
        - smashingapps_usage_data"]
    end
```

## 5. Local Storage Keys for AI Configuration

```mermaid
graph TD
    subgraph "Local Storage Keys for AI"
        GlobalSettings["global-settings / smashingapps-global-settings:
        {
          aiProvider: {
            provider: 'openai' | 'anthropic' | 'openrouter',
            apiKey: string,
            defaultModel: string,
            defaultSystemPrompt: string,
            defaultOptions: {...}
          },
          ...
        }"]
        
        DirectAccessKeys["Direct Access Keys:
        - smashingapps_activeModel: string
        - smashingapps_activeProvider: string
        - openai_api_key: string
        - anthropic_api_key: string
        - etc."]
        
        AppIdentificationKeys["App Identification Keys:
        - FORCE_APP_ID: string
        - current_app: string
        - article_smasher_app: string
        - article_wizard_state: string
        - task_list_state: string"]
        
        UsageTrackingKeys["Usage Tracking Keys:
        - smashingapps_usage_data: {
            totalRequests: number,
            totalTokens: number,
            requestsByProvider: {...},
            tokensByProvider: {...},
            requestsByApp: {
              'article-smasher': number,
              'task-smasher': number
            },
            tokensByApp: {
              'article-smasher': number,
              'task-smasher': number
            },
            usageHistory: [...]
          }"]
        
        AppSpecificKeys["App-Specific Settings:
        - article_smasher_prompt_settings: {
            provider: string,
            model: string,
            temperature: number,
            maxTokens: number
          }"]
    end
```

## 6. Potential Issues in AI Sharing

```mermaid
graph TD
    subgraph "Potential Issues"
        MultipleInstances["1. Multiple AI Service Instances:
        - Modern aiServiceRegistry
        - Legacy AIService
        - Fallback mechanism in useAI"]
        
        AppIdentificationComplexity["2. App Identification Complexity:
        - Multiple methods with different priorities
        - Scattered across multiple files
        - Fallback mechanisms"]
        
        SettingsSynchronization["3. Settings Synchronization Issues:
        - Multiple localStorage keys
        - Complex synchronization logic
        - Different components reading from different keys"]
        
        ModelSelection["4. Model Selection Inconsistency:
        - In useAI hook
        - In legacy AIService
        - In global settings"]
        
        UsageTracking["5. Usage Tracking Dependency:
        - Depends on correct app identification
        - Might track usage incorrectly if app ID is wrong"]
    end
```

## 7. Shared vs. App-Specific AI Components

```mermaid
graph TD
    subgraph "Shared AI Components"
        SharedServices["Shared Services:
        - AIService.ts
        - aiServiceRegistry
        - aiServices.ts
        - aiServiceWrapper.ts
        - usageTrackingService.ts"]
        
        SharedHooks["Shared Hooks:
        - useAI.ts"]
        
        SharedComponents["Shared Components:
        - PromptRunner.tsx"]
    end
    
    subgraph "Task Smasher AI Components"
        TaskSmasherComponents["Task-Specific Components:
        - Task.tsx
        - Subtask.tsx"]
        
        TaskSmasherHooks["Task-Specific Hooks:
        - useTaskAI.ts (if exists)"]
        
        TaskSmasherSettings["Task-Specific Settings:
        - smashingapps_activeProvider
        - smashingapps_activeModel"]
    end
    
    subgraph "Article Smasher AI Components"
        ArticleSmasherComponents["Article-Specific Components:
        - ArticleWizard.tsx
        - etc."]
        
        ArticleSmasherHooks["Article-Specific Hooks:
        - useArticleAI.ts (if exists)"]
        
        ArticleSmasherSettings["Article-Specific Settings:
        - article_smasher_prompt_settings"]
    end
    
    SharedServices --> TaskSmasherHooks & ArticleSmasherHooks
    SharedHooks --> TaskSmasherComponents & ArticleSmasherComponents
    SharedComponents --> TaskSmasherComponents & ArticleSmasherComponents
```

## Key Insights on AI Architecture

1. **Shared AI Infrastructure**: Both Task Smasher and Article Smasher use the same underlying AI infrastructure, including the service registry, hooks, and components.

2. **Dual AI Service Paths**: The system has both a modern path (using the registry pattern) and a legacy path (using a singleton service), which could lead to inconsistent behavior.

3. **Complex App Identification**: The system uses multiple methods to identify which app is making an AI request, with a complex fallback mechanism that could lead to misattribution.

4. **Settings Fragmentation**: AI settings are stored in multiple localStorage keys, with synchronization mechanisms that might not always work correctly.

5. **Usage Tracking Dependency**: Usage tracking depends on correct app identification, which might not always be reliable.

6. **Potential Solutions**:
   - Standardize on a single AI service architecture (either registry or singleton)
   - Simplify app identification with a more reliable mechanism
   - Consolidate settings into a single source of truth
   - Improve synchronization between apps
   - Add more robust error handling and logging