import { useState, useEffect, useCallback, useRef } from 'react';
import { Board, EditingState, FeedbackState, Task, TaskMismatchData, TasksContextType, RateLimitInfo } from '../types';
import { filterTasksByPriority, filterTasksByRating } from '../utils/taskUtils';
import { validateTaskLocally, validateTaskWithAI } from '../utils/taskContextValidator';
import { OpenAIServiceAdapter } from '../utils/openaiServiceAdapter';
import useReCaptcha from '../../../shared/hooks/useReCaptcha';
import useVoiceToText from '../../../shared/hooks/useVoiceToText';
import AICore from '../../../../core/AICore';
import { getPromptTemplateForCategory, processPromptTemplate } from '../utils/promptTemplates';

export function useTasks(initialUseCase?: string): TasksContextType {
  // Initialize AI-Core
  const aiCore = AICore.getInstance();

  // Get model from AI-Core settings
  const [selectedModel, setSelectedModel] = useState(() => {
    const settings = aiCore.getSettings() as any;
    // Check if any providers are actually enabled
    const hasEnabledProvider = settings.providers && Object.values(settings.providers).some((provider: any) => provider.enabled && provider.apiKey);
    if (hasEnabledProvider && settings.model) {
      console.log('Using model from AI-Core:', settings.model);
      return settings.model;
    }
    console.log('No enabled providers, model set to empty string');
    return '';
  });
  const [totalCost, setTotalCost] = useState(() => {
    const savedCost = localStorage.getItem('totalCost');
    return savedCost ? parseFloat(savedCost) : 0;
  });
  const [executionCount, setExecutionCount] = useState(() => {
    const savedCount = localStorage.getItem('executionCount');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>('daily');
  const [rateLimited, setRateLimited] = useState(() => {
    const savedRateLimited = localStorage.getItem('rateLimited');
    return savedRateLimited ? savedRateLimited === 'true' : false;
  });
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  
  const [rateLimitInfo, setRateLimitInfo] = useState<{ limit: number; remaining: number; used: number; reset: Date }>(() => {
    const savedRateLimitInfo = localStorage.getItem('rateLimitInfo');
    if (savedRateLimitInfo) {
      try {
        const parsed = JSON.parse(savedRateLimitInfo);
        return {
          ...parsed,
          reset: new Date(parsed.reset) // Convert the ISO string back to a Date object
        };
      } catch (e) {
        console.error('Error parsing rateLimitInfo from localStorage:', e);
      }
    }
    return {
      limit: 10,
      remaining: 10,
      used: 0,
      reset: new Date(Date.now() + 86400000) // 24 hours from now
    };
  });
  
  const [boards, setBoards] = useState<Board[]>([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'inprogress', title: 'Progress', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ]);
  
  const [newTask, setNewTask] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({ taskId: '', showing: false });
  const [generating, setGenerating] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [showContextInput, setShowContextInput] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [breakdownLevel, setBreakdownLevel] = useState(3);
  const [filterPriority, setFilterPriority] = useState<'low' | 'medium' | 'high' | 'all'>('all');
  const [filterRating, setFilterRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({
    taskId: null,
    subtaskId: null,
    field: null,
    value: ''
  });
  
  // Task mismatch states
  const [taskMismatch, setTaskMismatch] = useState<TaskMismatchData>({
    showing: false,
    reason: '',
    suggestedUseCase: undefined,
    taskText: ''
  });
  
  // History for undo functionality
  const [history, setHistory] = useState<Board[][]>([]);
  
  // Voice to text functionality
  const {
    isRecording,
    isProcessing: processingVoiceTranscription,
    transcribedText,
    startRecording,
    stopRecording
  } = useVoiceToText({
    onTranscriptionComplete: (text) => {
      setNewTask(text);
      // Auto submit after a short delay
      setTimeout(() => {
        if (text.trim()) {
          const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
          handleAddTask(formEvent);
        }
      }, 1000);
    },
    onError: (error) => {
      setNewTask(error.message);
    }
  });

  useEffect(() => {
    if (selectedUseCase) {
      document.documentElement.style.setProperty('--primary-color', `var(--${selectedUseCase}-primary)`);
      document.documentElement.style.setProperty('--primary-light', `var(--${selectedUseCase}-light)`);
      document.documentElement.style.setProperty('--secondary-light', `var(--${selectedUseCase}-secondary)`);
    }
  }, [selectedUseCase]);
  
  // Effect to update the selected model when AI-Core settings change
  useEffect(() => {
    const handleSettingsChange = () => {
      const settings = aiCore.getSettings() as any;
      // Check if any providers are actually enabled
      const hasEnabledProvider = settings.providers && Object.values(settings.providers).some((provider: any) => provider.enabled && provider.apiKey);
      if (hasEnabledProvider && settings.model) {
        console.log('AI-Core settings changed, updating model to:', settings.model);
        setSelectedModel(settings.model);
      } else {
        console.log('No enabled providers, clearing model');
        setSelectedModel('');
      }
    };

    // Listen for AI-Core settings changes
    window.addEventListener('ai-core-settings-changed', handleSettingsChange);

    return () => {
      window.removeEventListener('ai-core-settings-changed', handleSettingsChange);
    };
  }, [aiCore]);

  // Effect to update settings when global settings change
  useEffect(() => {
    // Initial check for AI-Core settings
    const checkAICoreSettings = () => {
      try {
        // Get from AI-Core
        const settings = aiCore.getSettings() as any;
        console.log('Checking AI-Core settings on mount:', settings);

        // Check if any providers are actually enabled
        const hasEnabledProvider = settings.providers && Object.values(settings.providers).some((provider: any) => provider.enabled && provider.apiKey);

        if (hasEnabledProvider && settings.model) {
          console.log('Setting model from AI-Core settings:', settings.model);
          setSelectedModel(settings.model);

          // Update localStorage to ensure persistence
          localStorage.setItem('smashingapps_activeModel', settings.model);
        } else {
          // If no enabled providers, clear the model
          console.log('No enabled providers, clearing model');
          setSelectedModel('');
          localStorage.removeItem('smashingapps_activeModel');
        }
      } catch (error) {
        console.error('Error reading AI-Core settings:', error);
        // Clear model on error
        console.log('Error reading settings, clearing model');
        setSelectedModel('');
        localStorage.setItem('smashingapps_activeModel', 'gpt-3.5-turbo');
      }
    };

    // Check on mount
    checkAICoreSettings();

    // Listen for storage changes to AI-Core settings
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage event detected:', e.key);

      // Check for changes to AI-Core settings
      if (e.key === 'ai-core-settings' && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          console.log('AI-Core settings changed:', settings);

          if (settings.model) {
            console.log('Setting model from updated AI-Core settings:', settings.model);
            setSelectedModel(settings.model);
            localStorage.setItem('smashingapps_activeModel', settings.model);
          }
        } catch (error) {
          console.error('Error updating settings from storage event:', error);
        }
      }

      // Also check for direct changes to the app-specific model setting
      if (e.key === 'smashingapps_activeModel' && e.newValue) {
        console.log('App-specific model changed:', e.newValue);
        setSelectedModel(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Set up an interval to periodically sync the model setting with AI-Core
    const intervalId = setInterval(() => {
      try {
        const settings = aiCore.getSettings() as any;
        // Check if any providers are actually enabled
        const hasEnabledProvider = settings.providers && Object.values(settings.providers).some((provider: any) => provider.enabled && provider.apiKey);

        if (hasEnabledProvider && settings.model) {
          const currentModel = localStorage.getItem('smashingapps_activeModel');
          // Only update if the model has changed
          if (currentModel !== settings.model) {
            console.log('Periodic check: Syncing model with AI-Core settings:', settings.model);
            setSelectedModel(settings.model);
            localStorage.setItem('smashingapps_activeModel', settings.model);
          }
        } else {
          // If no enabled providers, clear the model
          const currentModel = localStorage.getItem('smashingapps_activeModel');
          if (currentModel) {
            console.log('Periodic check: No enabled providers, clearing model');
            setSelectedModel('');
            localStorage.removeItem('smashingapps_activeModel');
          }
        }
      } catch (error) {
        console.error('Error in periodic model check:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [aiCore]);

  // Initialize with provided use case or default to daily organizer
  useEffect(() => {
    handleSelectUseCase(initialUseCase || 'daily');
  }, [initialUseCase]);
  
  // Add CSS animation styles dynamically
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shrink {
        0% { width: 100%; }
        100% { width: 0%; }
      }
      
      .animate-in {
        animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      
      .animate-out {
        animation: pop-out 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
      }
      
      @keyframes pop-in {
        0% { transform: translate(-50%, -30%) scale(0.95); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      
      @keyframes pop-out {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -30%) scale(0.95); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // Save executionCount to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('executionCount', executionCount.toString());
  }, [executionCount]);
  
  // Save rateLimited to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('rateLimited', rateLimited.toString());
  }, [rateLimited]);
  
  // Save rateLimitInfo to localStorage when it changes
  useEffect(() => {
    const rateLimitInfoForStorage = {
      ...rateLimitInfo,
      reset: rateLimitInfo.reset.toISOString() // Convert Date to ISO string for storage
    };
    localStorage.setItem('rateLimitInfo', JSON.stringify(rateLimitInfoForStorage));
  }, [rateLimitInfo]);
  
  // Synchronize with server-side rate limit information on page load
  useEffect(() => {
    const syncRateLimitWithServer = async () => {
      try {
        console.log('Synchronizing with server rate limit on page load');
        // Always fetch the latest rate limit status from the server on page load
        console.log('Fetching server rate limit on page load');
        const serverRateLimit = await OpenAIServiceAdapter.getRateLimitStatus();
        console.log('Received server rate limit:', serverRateLimit);


        // Update the client-side state with the server-side information
        setRateLimitInfo(serverRateLimit);
        setExecutionCount(serverRateLimit.used);
        
        // Check if rate limit is exceeded
        const isLimitExceeded = serverRateLimit.remaining <= 0 || serverRateLimit.used >= serverRateLimit.limit;
        setRateLimited(isLimitExceeded);
        
        // Show the rate limit popup if the limit is exceeded
        if (isLimitExceeded) {
          console.log('Rate limit exceeded, showing popup');
          setShowRateLimitPopup(true);
        }

        console.log('Updated state with server rate limit info');

        // Update localStorage with the fresh server data
        localStorage.setItem('rateLimitInfo', JSON.stringify({
          limit: serverRateLimit.limit,
          remaining: serverRateLimit.remaining,
          reset: serverRateLimit.reset.toISOString(),
          used: serverRateLimit.used
        }));
        localStorage.setItem('executionCount', serverRateLimit.used.toString());
        localStorage.setItem('rateLimited', isLimitExceeded.toString());
        console.log('Updated localStorage with server rate limit info');
      } catch (error) {
        console.error('Error synchronizing with server rate limit:', error);
      }
    };
    
    // Call the synchronization function on page load
    syncRateLimitWithServer();
  }, []);
  
  // Function to synchronize rate limit info after each API call
  const syncRateLimitInfo = useCallback((rateLimit: RateLimitInfo) => {
    console.log('Synchronizing rate limit info after API call:', rateLimit);
    
    // Update the rateLimitInfo state
    setRateLimitInfo(rateLimit);
    
    // Update the executionCount to match the server's used count
    setExecutionCount(rateLimit.used);
    console.log('Updated executionCount to:', rateLimit.used);
    
    // Update the rateLimited state based on the server response
    setRateLimited(rateLimit.remaining === 0);
    console.log('Updated rateLimited to:', rateLimit.remaining === 0);
    
    // Store the updated rate limit info in localStorage directly
    // This is in addition to the useEffect that watches rateLimitInfo
    localStorage.setItem('rateLimitInfo', JSON.stringify({
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      reset: rateLimit.reset.toISOString(),
      used: rateLimit.used
    }));
    
    // Also update the apiCallCount in localStorage
    localStorage.setItem('apiCallCount', rateLimit.used.toString());
    console.log('Saved rate limit info and API call count to localStorage');
  }, []);
  
  
  // Save totalCost to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('totalCost', totalCost.toString());
  }, [totalCost]);

  // Get the reCAPTCHA token generator
  const { getReCaptchaToken } = useReCaptcha();
  
  const checkTaskContext = useCallback(async (taskText: string) => {
    if (!selectedUseCase || !taskText.trim()) return true;

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getReCaptchaToken('validate_task');

      // Use the updated validateTaskWithAI function that uses the proxy
      // Pass the selectedModel to ensure it uses the correct model
      const result = await validateTaskWithAI(taskText, selectedUseCase, recaptchaToken, selectedModel);

      // Only sync rate limit info if we actually made an AI call (i.e., model is configured)
      if (selectedModel && selectedModel.trim() !== '') {
        // The validateTaskWithAI function doesn't return the rate limit info directly,
        // so we need to sync with the server to get the latest rate limit info
        const serverRateLimit = await OpenAIServiceAdapter.getRateLimitStatus();
        syncRateLimitInfo(serverRateLimit);
      }


      // Lowered confidence threshold from 0.6 to 0.5 to catch more mismatches
      // Also checking for specific keywords in the task that don't match the current use case
      const taskLower = taskText.toLowerCase();
      const isSeoInRecipe = selectedUseCase === 'recipe' && taskLower.includes('seo');
      const isMarketingInHome = selectedUseCase === 'home' && taskLower.includes('marketing');

      if (!result.isValid && (result.confidence > 0.5 || isSeoInRecipe || isMarketingInHome)) {
        setTaskMismatch({
          showing: true,
          reason: result.reason || `This task doesn't seem to fit in the current category.`,
          suggestedUseCase: result.suggestedUseCase,
          taskText: taskText // Store the task text for later use
        });
        return false;
      }

      return true;
    } catch (error) {
      // Check if the error is due to rate limiting
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        setRateLimited(true);
        setShowRateLimitPopup(true);
        return false; // Prevent task creation when rate limited
      }

      console.error('Error validating task context:', error);
      return true;
    }
  }, [selectedUseCase, selectedModel, getReCaptchaToken, syncRateLimitInfo]);

  const handleAddTask = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (newTask.trim()) {
      // Only show loading indicator if we have an AI model configured
      // (which means we'll be making an AI API call for validation)
      const willUseAI = selectedModel && selectedModel.trim() !== '';
      if (willUseAI) {
        setGenerating(true);
      }

      try {
        // Check if task matches selected use case
        const isContextValid = await checkTaskContext(newTask);

        // Only continue with task creation if context is valid
        if (isContextValid) {
          // Save current state to history for undo functionality
          setHistory(prev => [...prev, boards]);

          // Add the new task to the todo board
          setBoards(prev => {
            const todoBoard = prev.find(board => board.id === 'todo');
            if (!todoBoard) return prev;

            return prev.map(board => {
              if (board.id === 'todo') {
                return {
                  ...board,
                  tasks: [
                    ...board.tasks,
                    {
                      id: `task-${Date.now()}`,
                      title: newTask.trim(),
                      subtasks: [],
                      completed: false,
                      priority: 'medium',
                      estimatedTime: 1,
                      expanded: false,
                      boardId: 'todo'
                    }
                  ]
                };
              }
              return board;
            });
          });

          // Clear the input field after successful task addition
          setNewTask('');
        } else {
          // If validation failed but no mismatch popup is showing,
          // it might be due to rate limiting or other errors
          if (!taskMismatch.showing) {
            console.warn('Task validation failed but no mismatch popup is showing');
          }
          // We don't clear the input in this case so the user can modify their task
        }
      } finally {
        // Always set generating to false when done, regardless of success or failure
        if (willUseAI) {
          setGenerating(false);
        }
      }
    }
  }, [newTask, boards, checkTaskContext, taskMismatch.showing, selectedModel]);
  
  const startEditing = useCallback((
    taskId: string, 
    subtaskId: string | null, 
    field: 'title' | 'time' | 'priority', 
    currentValue: string
  ) => {
    setEditing({
      taskId,
      subtaskId,
      field,
      value: currentValue
    });
  }, []);

  const handleEditSave = useCallback((boardId: string) => {
    const { taskId, subtaskId, field, value } = editing;
    
    if (!taskId || !field) {
      setEditing({ taskId: null, subtaskId: null, field: null, value: '' });
      return;
    }
    
    setHistory(prev => [...prev, boards]);
    
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        if (board.id !== boardId) return board;
        
        return {
          ...board,
          tasks: board.tasks.map(task => {
            // If we're editing a subtask
            if (subtaskId && task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    if (field === 'title') {
                      return { ...subtask, title: value };
                    } else if (field === 'time') {
                      const time = parseFloat(value) || 0;
                      return { ...subtask, estimatedTime: time };
                    } else if (field === 'priority') {
                      return { ...subtask, priority: value as 'low' | 'medium' | 'high' };
                    }
                  }
                  return subtask;
                })
              };
            }
            
            // If we're editing the main task
            if (!subtaskId && task.id === taskId) {
              if (field === 'title') {
                return { ...task, title: value };
              } else if (field === 'time') {
                const time = parseFloat(value) || 0;
                return { ...task, estimatedTime: time };
              } else if (field === 'priority') {
                return { ...task, priority: value as 'low' | 'medium' | 'high' };
              }
            }
            
            return task;
          })
        };
      });
    });
    
    setEditing({ taskId: null, subtaskId: null, field: null, value: '' });
  }, [editing, boards]);

  const updateTaskPriority = useCallback((taskId: string, boardId: string, priority: 'low' | 'medium' | 'high') => {
    setHistory(prev => [...prev, boards]);
    
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        if (board.id !== boardId) return board;
        
        return {
          ...board,
          tasks: board.tasks.map(task => {
            // Check if this is a main task
            if (task.id === taskId) {
              return { ...task, priority };
            }
            
            // Check if this is a subtask
            const updatedSubtasks = task.subtasks.map(subtask => {
              if (subtask.id === taskId) {
                return { ...subtask, priority };
              }
              return subtask;
            });
            
            if (task.subtasks.some(st => st.id === taskId)) {
              return { ...task, subtasks: updatedSubtasks };
            }
            
            return task;
          })
        };
      });
    });
  }, [boards]);
  
  const addSubtask = useCallback((taskId: string, boardId: string) => {
    setHistory(prev => [...prev, boards]);
    
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        if (board.id !== boardId) return board;
        
        return {
          ...board,
          tasks: board.tasks.map(task => {
            if (task.id !== taskId) return task;
            
            return {
              ...task,
              expanded: true,
              subtasks: [
                ...task.subtasks,
                {
                  id: `subtask-${Date.now()}-${task.subtasks.length}`,
                  title: 'New subtask',
                  subtasks: [],
                  completed: false,
                  priority: task.priority,
                  estimatedTime: 0.5,
                  boardId
                }
              ]
            };
          })
        };
      });
    });
  }, [boards]);
  
  const updateBoardTitle = useCallback((boardId: string, newTitle: string) => {
    setHistory(prev => [...prev, boards]);
    
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        if (board.id !== boardId) return board;
        return { ...board, title: newTitle };
      });
    });
  }, [boards]);
  
  const toggleExpanded = useCallback((taskId: string) => {
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        return {
          ...board,
          tasks: board.tasks.map(task => {
            if (task.id !== taskId) return task;
            return { ...task, expanded: !task.expanded };
          })
        };
      });
    });
  }, []);
  
  const toggleComplete = useCallback((taskId: string, boardId: string) => {
    setHistory(prev => [...prev, boards]);
    
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        if (board.id !== boardId) return board;
        
        return {
          ...board,
          tasks: board.tasks.map(task => {
            // If this is the main task
            if (task.id === taskId) {
              const newCompleted = !task.completed;
              
              // If completing the main task, complete all subtasks too
              if (newCompleted) {
                return {
                  ...task,
                  completed: newCompleted,
                  subtasks: task.subtasks.map(st => ({ ...st, completed: true }))
                };
              }
              
              return { ...task, completed: newCompleted };
            }
            
            // Check if this is a subtask
            const updatedSubtasks = task.subtasks.map(subtask => {
              if (subtask.id === taskId) {
                return { ...subtask, completed: !subtask.completed };
              }
              return subtask;
            });
            
            // Check if all subtasks are complete
            const allSubtasksComplete = updatedSubtasks.length > 0 && 
              updatedSubtasks.every(st => st.completed);
            
            return {
              ...task,
              subtasks: updatedSubtasks,
              completed: allSubtasksComplete
            };
          })
        };
      });
    });
  }, [boards]);

  const showFeedback = useCallback((taskId: string) => {
    setFeedback({ taskId, showing: true });
  }, []);
  
  const submitFeedback = useCallback((taskId: string, rating: number) => {
    setHistory(prev => [...prev, boards]);
    
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        return {
          ...board,
          tasks: board.tasks.map(task => {
            if (task.id === taskId || task.subtasks.some(st => st.id === taskId)) {
              return {
                ...task,
                feedback: rating,
                subtasks: task.subtasks.map(st => {
                  if (st.id === taskId) {
                    return { ...st, feedback: rating };
                  }
                  return st;
                })
              };
            }
            return task;
          })
        };
      });
    });
    
    setFeedback({ taskId: '', showing: false });
  }, [boards]);
  
  const updateContext = useCallback((taskId: string) => {
    if (!contextInput.trim()) {
      setShowContextInput(null);
      setContextInput('');
      return;
    }
    
    setHistory(prev => [...prev, boards]);
    
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        return {
          ...board,
          tasks: board.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, context: contextInput };
            }
            return task;
          })
        };
      });
    });
    
    setShowContextInput(null);
    setContextInput('');
  }, [contextInput, boards]);
  
  const deleteTask = useCallback((taskId: string, boardId: string) => {
    setHistory(prev => [...prev, boards]);
    
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        if (board.id !== boardId) return board;
        
        // First check if it's a main task
        const updatedTasks = board.tasks.filter(task => task.id !== taskId);
        
        if (updatedTasks.length < board.tasks.length) {
          return { ...board, tasks: updatedTasks };
        }
        
        // If it's not a main task, check subtasks
        return {
          ...board,
          tasks: board.tasks.map(task => {
            return {
              ...task,
              subtasks: task.subtasks.filter(st => st.id !== taskId)
            };
          })
        };
      });
    });
  }, [boards]);
  
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    setBoards(previousState);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  // Wrapper functions for voice input that update TaskSmasher-specific state
  const startVoiceInput = async () => {
    setProcessingVoice(true);
    setNewTask('Initializing voice recording...');
    await startRecording();
    setIsListening(true);
    setNewTask('Recording... Click mic to stop');
  };
  
  const stopVoiceInput = () => {
    stopRecording();
    setIsListening(false);
    setProcessingVoice(false);
  };
  
  // Update processingVoice state based on the shared hook's state
  useEffect(() => {
    setProcessingVoice(processingVoiceTranscription);
  }, [processingVoiceTranscription]);
  
  const regenerateTask = async (taskId: string) => {
    const task = boards.flatMap(b => b.tasks).find(t => t.id === taskId);
    if (!task) return;
    
    setActiveTask(taskId);
    setGenerating(true);
    
    try {
      // Use AI-Core to make the request with explicit model
      const response = await aiCore.sendTextRequest(
        selectedModel, // Explicitly pass the selected model
        [
          {
            role: 'system',
            content: 'You are a task management AI assistant. Rewrite this task to make it clearer and more actionable.'
          },
          {
            role: 'user',
            content: `Rewrite this task to make it more clear and actionable: "${task.title}"`
          }
        ],
        {
          temperature: 0.7,
          maxTokens: 200
        },
        'task-smasher' // App ID for tracking
      );

      // Extract content from response
      const improvedTask = response.choices[0]?.message?.content?.trim() || task.title;
      
        setHistory(prev => [...prev, boards]);
        
        setBoards(prevBoards => {
          return prevBoards.map(board => {
            return {
              ...board,
              tasks: board.tasks.map(t => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    title: improvedTask,
                    regenerateCount: (t.regenerateCount || 0) + 1
                  };
                }
                return t;
              })
            };
          });
        });
        
        // Update cost
        setTotalCost(prev => prev + (response.usage?.totalTokens || 0) * 0.000002);

        // No need to update executionCount here as it's already updated in syncRateLimitInfo
    } catch (error) {
      console.error('Error regenerating task:', error);
      
      // Check if the error is due to rate limiting
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        setRateLimited(true);
        setShowRateLimitPopup(true);
      }
    } finally {
      setGenerating(false);
      setActiveTask(null);
    }
  };
  
  const handleGenerateSubtasks = async (taskId: string) => {
    const task = boards.flatMap(b => b.tasks).find(t => t.id === taskId);
    if (!task) return;
    
    setActiveTask(taskId);
    setGenerating(true);
    
    // Determine the appropriate number of subtasks based on task complexity
    const determineSubtaskCount = (task: any) => {
      const title = task.title.toLowerCase();
      const context = task.context ? task.context.toLowerCase() : '';
      const combinedText = title + ' ' + context;
      
      // Check for complex tasks that likely need more subtasks
      if (
        combinedText.includes('project') ||
        combinedText.includes('plan') ||
        combinedText.includes('strategy') ||
        combinedText.includes('campaign') ||
        combinedText.includes('recipe') ||
        combinedText.includes('comprehensive') ||
        combinedText.includes('complete') ||
        combinedText.includes('detailed')
      ) {
        return 5; // More complex tasks get more subtasks
      }
      
      // Check for medium complexity tasks
      if (
        combinedText.includes('create') ||
        combinedText.includes('develop') ||
        combinedText.includes('implement') ||
        combinedText.includes('organize') ||
        combinedText.includes('prepare')
      ) {
        return 4; // Medium complexity tasks
      }
      
      // Simple tasks get fewer subtasks
      if (
        combinedText.includes('check') ||
        combinedText.includes('review') ||
        combinedText.includes('simple') ||
        combinedText.includes('quick') ||
        combinedText.includes('basic')
      ) {
        return 3; // Simple tasks
      }
      
      // Default to 4 subtasks if we can't determine complexity
      return 4;
    };
    
    // Set the breakdown level based on task complexity
    const intelligentBreakdownLevel = determineSubtaskCount(task);
    setBreakdownLevel(intelligentBreakdownLevel);
    
    try {
      // Get the prompt template for the selected use case
      
      // Get the appropriate prompt template for the current use case
      const promptTemplate = getPromptTemplateForCategory(selectedUseCase || 'daily');
      
      // Default prompts in case no template is found
      let systemPrompt = `You are a task management AI assistant. Break down tasks into specific, actionable subtasks. Provide ${intelligentBreakdownLevel} subtasks.

CRITICAL INSTRUCTION: Your response MUST ONLY contain a valid JSON array and NOTHING ELSE.
DO NOT include ANY text before or after the JSON array.
DO NOT include ANY markdown formatting like \`\`\`json or \`\`\`.
DO NOT include ANY explanatory text, comments, or conversational phrases.
DO NOT say things like "Here's the JSON", "Here you go", "Certainly", etc.

ONLY return the raw JSON array in this EXACT format:
[{"title": "Subtask title", "estimatedTime": 0.5, "priority": "low|medium|high"}, ...]

Example of CORRECT response:
[{"title": "Research competitors", "estimatedTime": 1.5, "priority": "high"}, {"title": "Create outline", "estimatedTime": 0.5, "priority": "medium"}]

Example of INCORRECT response:
Here are the subtasks:
\`\`\`json
[{"title": "Research competitors", "estimatedTime": 1.5, "priority": "high"}]
\`\`\`

Any response that is not a valid JSON array will be rejected and cause errors.`;
      let userPrompt = `Break down this task into ${intelligentBreakdownLevel} specific, actionable subtasks: "${task.title}"${task.context ? `\nContext: ${task.context}` : ''}`;
      
      // Special handling for recipe tasks
      if (selectedUseCase === 'recipe' || task.title.toLowerCase().includes('cake') || task.title.toLowerCase().includes('recipe') || task.title.toLowerCase().includes('bake') || task.title.toLowerCase().includes('cook')) {
        // For recipes, we need to ensure we get a higher number of subtasks and specific ingredients
        const recipeSubtaskCount = Math.max(intelligentBreakdownLevel, 6); // At least 6 subtasks for recipes
        setBreakdownLevel(recipeSubtaskCount);
      }
      
      // Use the prompt template if available
      if (promptTemplate) {
        systemPrompt = promptTemplate.subtaskSystemPrompt;
        
        // Process the user prompt template with variables
        userPrompt = processPromptTemplate(
          promptTemplate.subtaskUserPromptTemplate,
          {
            breakdownLevel: selectedUseCase === 'recipe' ? Math.max(intelligentBreakdownLevel, 6).toString() : intelligentBreakdownLevel.toString(),
            taskTitle: task.title,
            taskContext: task.context ? `\nContext: ${task.context}` : ''
          }
        );
      }
      
      // Use AI-Core to make the request with explicit model
      const response = await aiCore.sendTextRequest(
        selectedModel, // Explicitly pass the selected model
        [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        {
          temperature: 0.7,
          maxTokens: 1000
        },
        'task-smasher' // App ID for tracking
      );

      // Extract content from response
      const content = response.choices[0]?.message?.content || '';
      let subtasksContent = content.trim();
      console.log('Raw AI response:', subtasksContent);
      
      // Enhanced JSON extraction and parsing
      let jsonContent = subtasksContent;
      
      // Step 1: Remove markdown code blocks if present
      if (subtasksContent.includes('```')) {
        const codeBlockMatch = subtasksContent.match(/```(?:json)?([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          jsonContent = codeBlockMatch[1].trim();
        } else {
          jsonContent = subtasksContent.replace(/```json|```/g, '').trim();
        }
      }
      
      // Step 2: Try to find JSON array in the response if it's embedded in text
      const jsonArrayMatch = jsonContent.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonArrayMatch) {
        jsonContent = jsonArrayMatch[0];
      }
      
      // Step 3: Remove any non-JSON text before or after the array
      jsonContent = jsonContent.replace(/^[^[]*(\[.*\])[^]]*$/s, '$1');
      
      try {
        console.log('Attempting to parse JSON:', jsonContent);
        const subtasks = JSON.parse(jsonContent);
        
          if (Array.isArray(subtasks)) {
            setHistory(prev => [...prev, boards]);
            
            setBoards(prevBoards => {
              return prevBoards.map(board => {
                return {
                  ...board,
                  tasks: board.tasks.map(t => {
                    if (t.id === taskId) {
                      return {
                        ...t,
                        expanded: true,
                        subtasks: [
                          ...t.subtasks,
                          ...subtasks.map((st: any, index: number) => ({
                            id: `subtask-${Date.now()}-${index}`,
                            title: st.title,
                            subtasks: [],
                            completed: false,
                            priority: st.priority || 'medium',
                            estimatedTime: st.estimatedTime || 0.5,
                            boardId: t.boardId
                          }))
                        ]
                      };
                    }
                    return t;
                  })
                };
              });
            });
            
            // Update cost
            setTotalCost(prev => prev + (response.usage?.totalTokens || 0) * 0.000002);

            // No need to update executionCount here as it's already updated in syncRateLimitInfo
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);

          // Advanced fallback: Convert formatted text to JSON if possible
          try {
            // First try more aggressive JSON extraction
            const possibleJsonMatch = subtasksContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (possibleJsonMatch) {
              const extractedJson = possibleJsonMatch[0];
              console.log('Attempting to parse extracted JSON:', extractedJson);
              const subtasks = JSON.parse(extractedJson);

              if (Array.isArray(subtasks)) {
                updateBoardsWithSubtasks(taskId, subtasks);
                setTotalCost(prev => prev + (response.usage?.totalTokens || 0) * 0.000002);
                return; // Successfully extracted JSON
              }
            }

            // If no JSON array found, try to parse formatted text into JSON
            console.log('Attempting to convert formatted text to JSON');
            const lines = subtasksContent.split('\n').filter(line => line.trim());
            const textBasedSubtasks = [];
            
            // Look for patterns like "1. Task name - 2h - high priority"
            for (const line of lines) {
              // Remove any numbering or bullet points
              let cleanLine = line.replace(/^(\d+\.|\*|-)\s+/, '').trim();
              
              if (!cleanLine) continue;
              
              // Extract title, time and priority if possible
              let title = cleanLine;
              let estimatedTime = 0.5; // default
              let priority = 'medium'; // default
              
              // Try to extract time (look for patterns like "2h", "30m", "1.5 hours")
              const timeMatch = cleanLine.match(/(\d+\.?\d*)\s*(h|hr|hour|hours|m|min|minute|minutes)/i);
              if (timeMatch) {
                const value = parseFloat(timeMatch[1]);
                const unit = timeMatch[2].toLowerCase();
                
                // Convert to hours
                if (unit.startsWith('h')) {
                  estimatedTime = value;
                } else if (unit.startsWith('m')) {
                  estimatedTime = value / 60;
                }
                
                // Remove the time part from the title
                title = title.replace(timeMatch[0], '').trim();
              }
              
              // Try to extract priority
              if (cleanLine.includes('high priority') || cleanLine.includes('priority: high')) {
                priority = 'high';
                title = title.replace(/(high priority|priority:\s*high)/i, '').trim();
              } else if (cleanLine.includes('low priority') || cleanLine.includes('priority: low')) {
                priority = 'low';
                title = title.replace(/(low priority|priority:\s*low)/i, '').trim();
              } else if (cleanLine.includes('medium priority') || cleanLine.includes('priority: medium')) {
                priority = 'medium';
                title = title.replace(/(medium priority|priority:\s*medium)/i, '').trim();
              }
              
              // Clean up any remaining punctuation
              title = title.replace(/[:-]\s*$/, '').trim();
              
              textBasedSubtasks.push({
                title,
                estimatedTime,
                priority
              });
            }
            
            if (textBasedSubtasks.length > 0) {
              console.log('Successfully converted text to subtasks:', textBasedSubtasks);
              updateBoardsWithSubtasks(taskId, textBasedSubtasks);
              setTotalCost(prev => prev + (response.usage?.totalTokens || 0) * 0.000002);
            } else {
              console.error('Could not extract valid subtasks from text response');
            }
          } catch (secondError) {
            console.error('Failed to extract JSON with fallback methods:', secondError);
          }
        }
        
        // Helper function to update boards with subtasks
        function updateBoardsWithSubtasks(taskId: string, subtasks: any[]) {
          setHistory(prev => [...prev, boards]);
          
          setBoards(prevBoards => {
            return prevBoards.map(board => {
              return {
                ...board,
                tasks: board.tasks.map(t => {
                  if (t.id === taskId) {
                    return {
                      ...t,
                      expanded: true,
                      subtasks: [
                        ...t.subtasks,
                        ...subtasks.map((st: any, index: number) => ({
                          id: `subtask-${Date.now()}-${index}`,
                          title: st.title,
                          subtasks: [],
                          completed: false,
                          priority: st.priority || 'medium',
                          estimatedTime: st.estimatedTime || 0.5,
                          boardId: t.boardId
                        }))
                      ]
                    };
                  }
                  return t;
                })
              };
            });
          });
        }
    } catch (error) {
      console.error('Error generating subtasks:', error);
      
      // Check if the error is due to rate limiting
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        setRateLimited(true);
        setShowRateLimitPopup(true);
      }
    } finally {
      setGenerating(false);
      setActiveTask(null);
    }
  };
  
  const handleSelectUseCase = useCallback((useCase: string) => {
    // Save current state to history before resetting
    setHistory(prev => [...prev, boards]);
    
    // Check if we're switching due to a task mismatch
    const switchingDueToMismatch = taskMismatch.showing && taskMismatch.suggestedUseCase === useCase;
    const taskToPreserve = switchingDueToMismatch && taskMismatch.taskText ? taskMismatch.taskText : '';
    
    // Create empty boards
    const emptyBoards: Board[] = [
      { id: 'todo', title: 'To Do', tasks: [] },
      { id: 'inprogress', title: 'Progress', tasks: [] },
      { id: 'done', title: 'Done', tasks: [] }
    ];
    
    // If we're switching due to a task mismatch, add the task to the new use case's todo board
    if (switchingDueToMismatch && taskToPreserve) {
      emptyBoards[0].tasks.push({
        id: `task-${Date.now()}`,
        title: taskToPreserve,
        subtasks: [],
        completed: false,
        priority: 'medium',
        estimatedTime: 1,
        expanded: false,
        boardId: 'todo'
      });
    }
    
    // Set the new boards
    setBoards(emptyBoards);
    
    // Reset active states
    setActiveTask(null);
    setActiveId(null);
    setGenerating(false);
    setShowContextInput(null);
    
    // Set the new use case
    setSelectedUseCase(useCase);
    document.documentElement.style.setProperty('--primary-color', `var(--${useCase}-primary)`);
    document.documentElement.style.setProperty('--primary-light', `var(--${useCase}-light)`);
    document.documentElement.style.setProperty('--secondary-light', `var(--${useCase}-secondary)`);
    
    // Always clear the task mismatch state when switching use cases
    setTaskMismatch({
      showing: false,
      reason: '',
      suggestedUseCase: undefined,
      taskText: ''
    });
  }, [boards, taskMismatch]);
  
  const handleGenerateIdeas = async () => {
    // Set generating state to true to show loading indicator
    setGenerating(true);
    
    // Add retry logic
    const maxRetries = 2;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount} of ${maxRetries} for generating ideas`);
        }
        
        console.log("Generating ideas for use case:", selectedUseCase);
        
        // Get reCAPTCHA token
        const recaptchaToken = await getReCaptchaToken('generate_ideas');
        console.log("Got reCAPTCHA token for generate_ideas:", recaptchaToken ? "Yes" : "No");
        
        // Use OpenAIService to make the request through the proxy
        // Create a prompt based on the selected use case
        // Use simpler prompts to avoid timeouts
        // Get the prompt template for the selected use case
        
        // Get the appropriate prompt template for the current use case
        const promptTemplate = getPromptTemplateForCategory(selectedUseCase || 'daily');
        
        // Default prompts in case no template is found
        let systemPrompt = 'You are a helpful assistant. Generate 5 short task ideas, one per line.';
        let userPrompt = `Generate 5 simple task ideas for ${selectedUseCase || 'general productivity'}`;
        
        // Use the prompt template if available
        if (promptTemplate) {
          systemPrompt = promptTemplate.ideaSystemPrompt;
          
          // Process the user prompt template with variables
          userPrompt = processPromptTemplate(
            promptTemplate.ideaUserPromptTemplate,
            {}
          );
        }
      
      console.log("Sending request to AI service with model:", selectedModel);

      // Use AI-Core to make the request with explicit model
      const response = await aiCore.sendTextRequest(
        selectedModel, // Explicitly pass the selected model
        [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        {
          // Use maxTokens from the prompt template, or fall back to a default value
          maxTokens: promptTemplate?.maxTokens || 1000,
          // Use temperature from the prompt template, or fall back to a default value
          temperature: promptTemplate?.temperature || 0.7
        },
        'task-smasher' // App ID for tracking
      );

      console.log("Received response from AI-Core:", response);

      // Extract content from normalized response
      const responseText = response.choices[0]?.message?.content || '';
      console.log("Response text:", responseText);

      if (!responseText) {
        console.error("No content in AI response");
        alert("Failed to generate ideas. Please try again.");
        setGenerating(false);
        return;
      }
      
      // Parse the response into an array of ideas
      const ideas = responseText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*|-\s*|\*\s*/, '').trim());
      
      console.log("Parsed ideas:", ideas);
      
      if (ideas.length === 0) {
        console.error("No ideas were parsed from the response");
        alert("Failed to generate ideas. Please try again.");
        setGenerating(false);
        return;
      }
      
      setHistory(prev => [...prev, boards]);
      
      setBoards(prevBoards => {
        const todoBoard = prevBoards.find(board => board.id === 'todo');
        if (!todoBoard) return prevBoards;

        return prevBoards.map(board =>
          board.id === 'todo'
            ? {
                ...board,
                tasks: [
                  ...board.tasks,
                  ...ideas.map((idea, index) => ({
                      id: `task-${Date.now()}-${index}`,
                      title: idea,
                      subtasks: [],
                      completed: false,
                      priority: 'medium' as 'low' | 'medium' | 'high',
                      estimatedTime: 1,
                      expanded: false,
                      boardId: 'todo'
                    }))
                  ]
                }
              : board
          );
        });

        // Update cost
        setTotalCost(prev => prev + (response.usage?.totalTokens || 0) * 0.000002);

        // No need to update executionCount here as it's already updated in syncRateLimitInfo
      
        // Success! Break out of the retry loop
        break;
      } catch (error) {
        lastError = error;
        console.error(`Error generating ideas (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // Check if the error is due to rate limiting
        if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
          setRateLimited(true);
          setShowRateLimitPopup(true);
          // Don't retry rate limit errors
          break;
        }
        
        // Check if it's a timeout or network error that might be worth retrying
        const isTimeoutOrNetworkError = error instanceof Error &&
          (error.message.includes('timeout') ||
           error.message.includes('network') ||
           error.message.includes('504') ||
           error.message.includes('502'));
        
        if (isTimeoutOrNetworkError && retryCount < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
        } else {
          // Either not a retryable error or we've exhausted our retries
          break;
        }
      }
    }
    
    // Handle any errors after all retries are exhausted
    if (lastError) {
      if (lastError instanceof Error && lastError.message.includes('Rate limit exceeded')) {
        setShowRateLimitPopup(true);
      } else {
        alert("Failed to generate ideas. Please try again.");
      }
    }
    
    // Always set generating to false when done, regardless of success or failure
    setGenerating(false);
  };
  
  const getFilteredTasks = useCallback((boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return [];
    
    let filteredTasks = filterTasksByPriority(board.tasks, filterPriority);
    
    if (filterRating > 0) {
      filteredTasks = filterTasksByRating(filteredTasks, filterRating as 1 | 2 | 3 | 4 | 5);
    }
    
    return filteredTasks;
  }, [boards, filterPriority, filterRating]);

  // Function to clear rate limits
  const clearRateLimits = useCallback(() => {
    // Clear rate limit information from localStorage
    localStorage.removeItem('rateLimitInfo');
    localStorage.removeItem('rateLimited');
    localStorage.removeItem('apiCallCount');
    localStorage.removeItem('executionCount');
    
    // Reset state
    setRateLimited(false);
    setRateLimitInfo({
      limit: 10,
      remaining: 10,
      used: 0,
      reset: new Date(Date.now() + 86400000) // 24 hours from now
    });
    setExecutionCount(0);
    
    console.log('Rate limits cleared successfully');
  }, []);

  const result: TasksContextType = {
    selectedModel,
    setSelectedModel,
    totalCost,
    executionCount,
    boards,
    setBoards,
    newTask,
    showRateLimitPopup,
    setShowRateLimitPopup,
    clearRateLimits,
    setNewTask,
    editingBoardId,
    setEditingBoardId,
    activeTask,
    feedback,
    setFeedback,
    generating,
    processingVoice,
    showContextInput,
    setShowContextInput,
    contextInput,
    setContextInput,
    isListening,
    breakdownLevel,
    setBreakdownLevel,
    filterPriority,
    setFilterPriority,
    filterRating,
    setFilterRating,
    activeId,
    setActiveId,
    isDraggingOver,
    setIsDraggingOver,
    editing,
    taskMismatch,
    setTaskMismatch,
    rateLimited,
    rateLimitInfo,
    handleAddTask,
    startEditing,
    handleEditSave,
    updateTaskPriority,
    addSubtask,
    updateBoardTitle,
    toggleExpanded,
    startVoiceInput,
    stopVoiceInput,
    handleUndo,
    regenerateTask,
    handleGenerateSubtasks,
    handleSelectUseCase,
    selectedUseCase,
    handleGenerateIdeas,
    toggleComplete,
    showFeedback,
    submitFeedback,
    updateContext,
    deleteTask,
    getFilteredTasks
  };
  
  return result;
}
