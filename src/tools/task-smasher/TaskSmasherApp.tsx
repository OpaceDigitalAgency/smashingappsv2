import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, Plus, Settings, Sparkles, ArrowRight, Target, Trash2, Clock, Undo, Mic, Filter, Download, Upload, FileSpreadsheet, File as FilePdf, Key, DollarSign, Zap, Info, Star, ChevronDown, ChevronUp, Sliders, MessageSquare, Pencil, GripVertical } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './components/styles.css'; // Import consolidated styles for TaskSmasher
import StructuredData, { createSoftwareAppData, createBreadcrumbData } from '../../components/StructuredData';
import ModelDropdown from './components/ModelDropdown';
import SemanticSection from '../../components/SemanticSection';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

import { TasksProvider, useTasksContext } from './hooks/useTasksContext'; // Import TasksProvider
import { exportToExcel, exportToPDF } from './utils/taskUtils';
import { useCaseDefinitions } from './utils/useCaseDefinitions';
import SEO from '../../components/SEO';
import Board from './components/Board';
import Task from './components/Task';
import Sidebar from './components/Sidebar';
import TaskMismatchPopup from './components/TaskMismatchPopup';
import OpenAIExample from './components/OpenAIExample';
import ReCaptchaProvider from './components/ReCaptchaProvider'; // Import ReCaptchaProvider

// Define props for the content component
interface TaskSmasherAppContentProps {
  initialUseCase?: string;
}

// Define the main wrapper component
const TaskSmasherApp: React.FC = () => {
  // Use a default use case or get it from props/context if needed later
  const initialUseCase = 'daily';

  return (
    <ReCaptchaProvider>
      <TasksProvider initialUseCase={initialUseCase}>
        <TaskSmasherAppContent initialUseCase={initialUseCase} />
      </TasksProvider>
    </ReCaptchaProvider>
  );
};


// Separate component to use the TasksContext
function TaskSmasherAppContent({ initialUseCase }: TaskSmasherAppContentProps) {
  const location = useLocation();
  const {
    selectedModel,
    setSelectedModel,
    totalCost,
    rateLimited,
    rateLimitInfo,
    executionCount,
    boards,
    setBoards,
    newTask,
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
  } = useTasksContext();

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [sliderExpanded, setSliderExpanded] = useState(false);
  const [showOpenAIExample, setShowOpenAIExample] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDraggingOver(null);
    
    if (!over?.id || !active?.id) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = boards.flatMap(b => b.tasks).find(t => t.id === activeId);
    const sourceBoard = boards.find(b => b.tasks.some(t => t.id === activeId));
    
    if (!activeTask || !sourceBoard) return;

    const targetBoard = boards.find(b => b.id === overId);
    if (targetBoard) {
      // Add smash effect when dropping on a board
      const overElement = document.getElementById(overId as string);
      if (overElement) {
        const rect = overElement.getBoundingClientRect();
        addSmashEffectAt(rect.left + rect.width/2, rect.top + rect.height/2);
      }
      
      if (sourceBoard.id !== targetBoard.id) {
        setBoards(boards.map(board => {
          if (board.id === sourceBoard.id) {
            return {
              ...board,
              tasks: board.tasks.filter(t => t.id !== activeTask.id)
            };
          }
          if (board.id === targetBoard.id) {
            return {
              ...board,
              tasks: [...board.tasks, { ...activeTask, boardId: targetBoard.id }]
            };
          }
          return board;
        }));
      }
      return;
    }

    const overTask = boards.flatMap(b => b.tasks).find(t => t.id === overId);
    if (!overTask || overTask.boardId !== activeTask.boardId) return;

    setBoards(boards.map(board => {
      if (board.id !== sourceBoard.id) return board;

      const oldIndex = board.tasks.findIndex(t => t.id === activeId);
      const newIndex = board.tasks.findIndex(t => t.id === overId);

      return {
        ...board,
        tasks: arrayMove(board.tasks, oldIndex, newIndex)
      };
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!event.active?.id) return;
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragEndEvent) => {
    if (!event.over) {
      setIsDraggingOver(null);
      return;
    }
    setIsDraggingOver(event.over.id as string);
  };

  const activeTaskObject = activeId 
    ? boards.flatMap(b => b.tasks).find(t => t.id === activeId)
    : null;
    
  // Add visual smash effect on drag and drop
  const addSmashEffectAt = (x: number, y: number) => {
    // Create container
    const effect = document.createElement("div");
    effect.className = "absolute pointer-events-none z-[1000]";
    effect.style.top = `${y - 40}px`;
    effect.style.left = `${x - 40}px`;
    
    // Add SVG star
    effect.innerHTML = `
      <div class="smash-effect">
        <svg viewBox="0 0 100 100" width="80" height="80">
          <polygon class="smash-star" points="50,0 61,35 95,35 67,57 79,90 50,70 21,90 33,57 5,35 39,35" fill="var(--primary-color)" />
        </svg>
        <div class="smash-text">SMASH!</div>
      </div>
    `;
    
    // Add to page and remove after animation
    document.body.appendChild(effect);
    setTimeout(() => {
      document.body.removeChild(effect);
    }, 800);
  };

  // Add useEffect to handle fade-in animation when app loads
  useEffect(() => {
    // Add fade-in class to root element
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('opacity-0');
      // Small delay to ensure transition happens
      setTimeout(() => {
        rootElement.classList.remove('opacity-0');
        rootElement.classList.add('opacity-100', 'transition-opacity', 'duration-500');
      }, 100);
    }
  }, []);
  
  // Check for preserved tasks when component loads
  useEffect(() => {
    try {
      console.log('Checking for preserved tasks...');
      
      // Check both sessionStorage and localStorage for preserved tasks
      const preservedTask = sessionStorage.getItem('preservedTask') || localStorage.getItem('preservedTask');
      const preservedTaskTimestamp = sessionStorage.getItem('preservedTaskTimestamp') || localStorage.getItem('preservedTaskTimestamp');
      const targetUseCase = sessionStorage.getItem('targetUseCase') || localStorage.getItem('targetUseCase');
      
      console.log('Found preserved task:', preservedTask);
      console.log('Target use case:', targetUseCase);
      console.log('Current use case:', selectedUseCase);
      
      // Only process if we have a preserved task and it's less than 30 seconds old
      if (preservedTask && preservedTaskTimestamp && targetUseCase) {
        const timestamp = parseInt(preservedTaskTimestamp, 10);
        const now = Date.now();
        const age = now - timestamp;
        
        console.log('Task age (ms):', age);
        
        // If the task is less than 30 seconds old and the current use case matches the target
        if (age < 30000 && selectedUseCase === targetUseCase) {
          console.log('Adding preserved task to board:', preservedTask);
          
          // Add the preserved task to the todo board
          setBoards(prevBoards => {
            const newBoards = [...prevBoards];
            newBoards[0].tasks.push({
              id: `task-${Date.now()}`,
              title: preservedTask,
              subtasks: [],
              completed: false,
              priority: 'medium',
              estimatedTime: 1,
              expanded: false,
              boardId: 'todo'
            });
            return newBoards;
          });
          
          // Clear the preserved task from storage
          sessionStorage.removeItem('preservedTask');
          sessionStorage.removeItem('preservedTaskTimestamp');
          sessionStorage.removeItem('targetUseCase');
          localStorage.removeItem('preservedTask');
          localStorage.removeItem('preservedTaskTimestamp');
          localStorage.removeItem('targetUseCase');
          
          console.log('Task added and storage cleared');
        }
      }
    } catch (error) {
      console.error('Error checking for preserved tasks:', error);
    }
  }, [selectedUseCase]);

  // Determine the current use case from the URL path or the selected use case
  const getCurrentUseCase = () => {
    const path = location.pathname;
    // Check if the path matches a specific use case
    for (const [id, definition] of Object.entries(useCaseDefinitions)) {
      const useCasePath = `/tools/task-smasher/${definition.label.toLowerCase().replace(/\s+/g, '-')}`;
      if (path.startsWith(useCasePath)) {
        return { id, definition };
      }
    }
    // Fallback to the selected use case or default
    if (selectedUseCase && useCaseDefinitions[selectedUseCase]) {
      return {
        id: selectedUseCase,
        definition: useCaseDefinitions[selectedUseCase]
      };
    }
    
    // Default to daily if no use case is found
    return {
      id: 'daily',
      definition: useCaseDefinitions['daily']
    };
  };

  const currentUseCase = getCurrentUseCase();
  
  // Create SEO overrides based on the current use case - match the format in metaConfig.ts
  const seoOverrides = currentUseCase ? {
    title: `${currentUseCase.definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher`,
    description: currentUseCase.definition.description
  } : undefined;

  return (
    <div className="min-h-screen w-full flex fade-in-app relative pt-0"> {/* pt-0 to work with global navbar */}
      {/* Apply SEO overrides for the current use case */}
      {seoOverrides && <SEO overrides={seoOverrides} />}
      
      {/* Add structured data for the current use case */}
      {currentUseCase && (
        <>
          <StructuredData
            data={createSoftwareAppData(
              `${currentUseCase.definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher`,
              currentUseCase.definition.description,
              `https://smashingapps.ai/tools/task-smasher/${currentUseCase.definition.label.toLowerCase().replace(/\s+/g, '-')}/`,
              `https://smashingapps.ai/og/task-smasher-${currentUseCase.id}.png`
            )}
          />
          <StructuredData
            data={createBreadcrumbData([
              { name: 'Home', url: 'https://smashingapps.ai/' },
              { name: 'Tools', url: 'https://smashingapps.ai/#tools' },
              { name: 'TaskSmasher', url: 'https://smashingapps.ai/tools/task-smasher/' },
              { name: currentUseCase.definition.label, url: `https://smashingapps.ai/tools/task-smasher/${currentUseCase.definition.label.toLowerCase().replace(/\s+/g, '-')}/` }
            ])}
          />
        </>
      )}
      {/* Global Loading Indicator for OpenAI API calls - not shown during voice processing */}
      {generating && !isListening && !processingVoice && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Processing...</h3>
            <p className="text-gray-600 text-center">
              Generating content with {selectedModel}. This may take a few seconds.
            </p>
          </div>
        </div>
      )}
      
      <Sidebar selectedUseCase={selectedUseCase} onSelectUseCase={handleSelectUseCase} />
      <div className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-auto transition-colors duration-500"
           style={{
             background: `linear-gradient(135deg, var(--primary-light) 0%, white 50%, var(--secondary-light) 100%)`
           }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ModelDropdown
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            totalCost={totalCost}
            executionCount={executionCount}
            rateLimited={rateLimited}
            rateLimitInfo={rateLimitInfo}
          />

          <SemanticSection
            as="header"
            className="mb-8"
            // Use the currentUseCase label directly for the visible H1
            title={currentUseCase.definition.label}
            titleAs="h1"
            titleClassName="text-2xl font-bold text-gray-900"
            subtitle="AI-powered task management"
            subtitleAs="p"
            subtitleClassName="text-sm text-gray-500 ml-auto italic" /* Right-aligned subtitle */
            contentClassName="w-full"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => exportToExcel(boards)}
                  className="text-gray-700 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
                <button
                  onClick={() => exportToPDF(boards)}
                  className="text-gray-700 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FilePdf className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                {/* Undo button moved to a more intuitive location */}
                <button
                  onClick={() => setShowOpenAIExample(!showOpenAIExample)}
                  className="text-gray-700 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">OpenAI Proxy</span>
                </button>
              </div>
            </div>
            {/* Task input field and action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleAddTask} className="w-full flex items-center relative">
                <input
                  type="text"
                  placeholder="Add a new task..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <button
                  type="button"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`absolute right-4 text-gray-400 hover:text-gray-600 ${isListening ? 'text-red-500 hover:text-red-700' : ''}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </form>
              
              {/* Action buttons - side by side on desktop, stacked on mobile */}
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <button
                  type="submit"
                  onClick={(e) => {
                    handleAddTask(e as React.FormEvent);
                    // Add smash effect when adding task
                    const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
                    addSmashEffectAt(buttonRect.left + buttonRect.width/2, buttonRect.top + buttonRect.height/2);
                  }}
                  disabled={!newTask.trim()}
                  className="premium-button py-3 px-4 rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex-1 sm:flex-initial"
                  style={{
                    background: `linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, white))`
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Task</span>
                </button>
                
                <button
                  className={`py-3 px-4 border border-gray-200 rounded-lg flex items-center gap-2 transition-all duration-200 min-h-[44px] flex-1 sm:flex-initial ${
                    generating
                      ? 'bg-indigo-50/80 border-indigo-200 shadow-sm animate-pulse'
                      : 'bg-white/80 backdrop-blur-sm hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    handleGenerateIdeas();
                    // Add smash effect when generating ideas
                    const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
                    addSmashEffectAt(buttonRect.left + buttonRect.width/2, buttonRect.top + buttonRect.height/2);
                  }}
                  disabled={generating}
                >
                  <Sparkles className={`w-5 h-5 ${generating ? 'text-indigo-600' : 'text-indigo-500'}`} />
                  <span className="text-gray-700">
                    {generating ? 'Generating...' : 'Need Ideas?'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* reCAPTCHA text removed from here - moved to bottom of page */}
            
            {/* End of Task Input / AI Buttons Section */}
          </SemanticSection>

          {/* Controls Section (Filters, Subtasks, Undo) - Moved Below Input */}
          <SemanticSection
            as="div"
            className="my-6" // Added vertical margin for spacing
            title="Controls"
            titleAs="h2"
            titleClassName="sr-only" // Hide title visually, but keep for accessibility
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/80 p-4 transition-all duration-300 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Control buttons in a row on mobile */}
                <div className="flex items-center gap-2 w-full">
                  {/* Filters Button */}
                  <button
                    className="flex items-center gap-1 px-2 bg-white/80 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition-all duration-200 min-h-[44px] flex-1" // Adjusted for mobile
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="truncate filter-button-text">Filters</span>
                    {filtersExpanded ?
                      <ChevronUp className="w-4 h-4 ml-auto flex-shrink-0" /> :
                      <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
                    }
                  </button>
                  
                  {/* Subtask Breakdown Slider Button */}
                  <button
                    className="flex items-center gap-1 px-2 bg-white/80 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition-all duration-200 min-h-[44px] flex-1" // Adjusted for mobile
                    onClick={() => setSliderExpanded(!sliderExpanded)}
                  >
                    <Sliders className="w-4 h-4" />
                    <span className="truncate filter-button-text">Subtasks: {breakdownLevel}</span>
                    {sliderExpanded ?
                      <ChevronUp className="w-4 h-4 ml-auto flex-shrink-0" /> :
                      <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
                    }
                  </button>
                  
                  {/* Undo button */}
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1 px-2 bg-white/80 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition-all duration-200 min-h-[44px] flex-1" // Adjusted for mobile
                    title="Undo last action"
                  >
                    <Undo className="w-4 h-4" />
                    <span className="truncate filter-button-text">Undo</span>
                  </button>
                </div>
              </div>
              
              {/* Filters Panel */}
              {filtersExpanded && (
                <div className="bg-white/90 rounded-lg border border-gray-200 p-4 shadow-sm transition-all duration-300 mt-4 space-y-4"> {/* Added mt-4 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      Priority Filter
                    </h3>
                    <div className="flex flex-wrap mb-2 gap-1"> {/* Added flex-wrap and gap */}
                      <button
                        onClick={() => setFilterPriority('all')}
                        className={`px-3 py-1.5 text-sm rounded-md border ${ /* Increased py, adjusted rounding/borders */
                          filterPriority === 'all'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterPriority('high')}
                        className={`px-3 py-1.5 text-sm rounded-md border ${ /* Increased py, adjusted rounding/borders */
                          filterPriority === 'high'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        High
                      </button>
                      <button
                        onClick={() => setFilterPriority('medium')}
                        className={`px-3 py-1.5 text-sm rounded-md border ${ /* Increased py, adjusted rounding/borders */
                          filterPriority === 'medium'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Medium
                      </button>
                      <button
                        onClick={() => setFilterPriority('low')}
                        className={`px-3 py-1.5 text-sm rounded-md border ${ /* Increased py, adjusted rounding/borders */
                          filterPriority === 'low'
                            ? 'bg-gray-100 text-gray-700 border-gray-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Low
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      Rating Filter
                      <Star className="w-4 h-4 text-yellow-400" />
                    </h3>
                    <div className="flex flex-wrap gap-1"> {/* Added flex-wrap and gap */}
                      <button
                        onClick={() => setFilterRating(0)}
                        className={`px-3 py-1.5 text-sm rounded-md border ${ /* Increased py, adjusted rounding/borders */
                          filterRating === 0
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        All
                      </button>
                      {[5, 4, 3, 2, 1].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setFilterRating(rating as 0 | 1 | 2 | 3 | 4 | 5)}
                          className={`px-3 py-1.5 text-sm rounded-md border ${ /* Increased py, adjusted rounding/borders */
                            filterRating === rating
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {rating}★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Subtask Breakdown Slider Panel */}
              {sliderExpanded && (
                <div className="bg-white/90 rounded-lg border border-gray-200 p-4 shadow-sm transition-all duration-300 mt-4"> {/* Added mt-4 */}
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Subtask Breakdown Level</h3>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={breakdownLevel}
                    onChange={(e) => setBreakdownLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2 (Simple)</span>
                    <span>5 (Balanced)</span>
                    <span>8 (Detailed)</span>
                  </div>
                </div>
              )}
            </div>
          </SemanticSection>

          {/* Main Task Boards Section */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <SortableContext items={boards.map(board => board.id)}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                {boards.map(board => (
                  <div key={board.id} className="flex flex-col w-full">
                    {/* Board header */}
                    <div id={board.id} className="board-header bg-white rounded-t-lg p-4 border border-gray-200 shadow-sm mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-400 cursor-grab mr-1">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        {editingBoardId === board.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={board.title}
                              onChange={(e) => updateBoardTitle(board.id, e.target.value)}
                              onBlur={() => setEditingBoardId(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingBoardId(null)}
                              className="py-1 px-2 text-sm font-medium rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <h2 className={`text-lg font-medium text-gray-800 ${board.title === 'To Do' ? 'todo-header' : ''}`}>{board.title}</h2>
                        )}
                        <button
                          onClick={() => setEditingBoardId(board.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="task-count text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {getFilteredTasks(board.id).length} {getFilteredTasks(board.id).length === 1 ? 'task' : 'tasks'}
                      </div>
                    </div>
                    
                    {/* Board content */}
                    <div className="flex-grow w-full">
                      <Board
                        board={board}
                        filteredTasks={getFilteredTasks(board.id)}
                        editingBoardId={editingBoardId}
                        setEditingBoardId={setEditingBoardId}
                        updateBoardTitle={updateBoardTitle}
                        onToggleExpanded={toggleExpanded}
                        onToggleComplete={toggleComplete}
                        onShowFeedback={showFeedback}
                        onDeleteTask={deleteTask}
                        onGenerateSubtasks={handleGenerateSubtasks}
                        onAddSubtask={addSubtask}
                        onRegenerateTask={regenerateTask}
                        showContextInput={showContextInput}
                        setShowContextInput={setShowContextInput}
                        contextInput={contextInput}
                        setContextInput={setContextInput}
                        updateContext={updateContext}
                        generating={generating}
                        activeTask={activeTask}
                        editing={editing}
                        startEditing={startEditing}
                        handleEditSave={handleEditSave}
                        updateTaskPriority={updateTaskPriority}
                        isDraggingOver={isDraggingOver === board.id ? board.id : ""}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeId && activeTaskObject ? (
                <div className="opacity-80">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/60 p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-gray-300">
                        <CheckCircle2 className="w-full h-full" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-gray-800 truncate">
                            {activeTaskObject.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          
          {/* Feedback Modal */}
          {feedback.showing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Rate this task</h3>
                <div className="flex justify-between items-center gap-2 my-4">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => {
                        submitFeedback(feedback.taskId, rating);
                        // Add smash effect
                        const rect = document.body.getBoundingClientRect();
                        addSmashEffectAt(rect.width / 2, rect.height / 2);
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center border hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setFeedback({ taskId: '', showing: false })}
                  className="w-full mt-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
              
              {/* OpenAI Example Modal */}
              {showOpenAIExample && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mx-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">OpenAI API Proxy</h3>
                      <button
                        onClick={() => setShowOpenAIExample(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        &times;
                      </button>
                    </div>
                    <OpenAIExample onClose={() => setShowOpenAIExample(false)} />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Task Mismatch Popup */}
          <TaskMismatchPopup
            isVisible={taskMismatch.showing}
            reason={taskMismatch.reason}
            suggestedUseCase={taskMismatch.suggestedUseCase}
            onClose={() => setTaskMismatch({ showing: false, reason: '', suggestedUseCase: undefined, taskText: '' })}
            onSwitchUseCase={(useCase) => {
              try {
                // Get the task text to preserve
                const taskTextToPreserve = taskMismatch.taskText || '';
                console.log('Task to preserve:', taskTextToPreserve);
                
                // Get the use case label for navigation
                const useCaseLabel = useCaseDefinitions[useCase]?.label;
                if (useCaseLabel && taskTextToPreserve) {
                  // Use sessionStorage which is more reliable for page navigation
                  sessionStorage.setItem('preservedTask', taskTextToPreserve);
                  sessionStorage.setItem('preservedTaskTimestamp', Date.now().toString());
                  sessionStorage.setItem('targetUseCase', useCase);
                  
                  console.log('Stored in sessionStorage:', {
                    task: taskTextToPreserve,
                    useCase: useCase
                  });
                  
                  // Format the URL path
                  const path = `/tools/task-smasher/${useCaseLabel.toLowerCase().replace(/\s+/g, '-')}/`;
                  
                  // Clear the task mismatch state
                  setTaskMismatch({ showing: false, reason: '', suggestedUseCase: undefined, taskText: '' });
                  
                  // Navigate to the new URL after a delay
                  setTimeout(() => {
                    console.log('Navigating to:', path);
                    window.location.href = path;
                  }, 500);
                }
              } catch (error) {
                console.error('Error in onSwitchUseCase:', error);
              }
            }}
          />
          
          {/* reCAPTCHA Branding moved to bottom of page */}
          <div className="text-xs text-gray-500 mt-8 mb-4 text-center">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
              Terms of Service
            </a>{' '}
            apply.
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskSmasherApp;
