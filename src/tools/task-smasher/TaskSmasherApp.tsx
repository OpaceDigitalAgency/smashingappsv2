import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, Plus, Settings, Sparkles, ArrowRight, Target, Trash2, Clock, Undo, Mic, Filter, Download, Upload, FileSpreadsheet, File as FilePdf, Key, DollarSign, Zap, Info, Star, ChevronDown, ChevronUp, Sliders, MessageSquare, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import Board from './components/Board';
import Task from './components/Task';
import Sidebar from './components/Sidebar';
import TaskMismatchPopup from './components/TaskMismatchPopup';
import OpenAIExample from './components/OpenAIExample';
import ReCaptchaProvider from './components/ReCaptchaProvider'; // Import ReCaptchaProvider

// Custom Navbar for TaskSmasher
const TaskSmasherNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/smashingapps-ai.png" 
                alt="SmashingApps.ai Logo" 
                className="h-20 w-auto" 
              />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/tools/task-smasher/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Task Smasher
            </Link>
            <Link to="/#tools" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              More Tools
            </Link>
            <Link to="/#why" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Why SmashingApps
            </Link>
            <Link to="/#contact" className="btn-primary !py-2 !px-4 text-sm">
              Get Started
            </Link>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white py-2 px-4 shadow-inner">
          <Link 
            to="/tools/task-smasher/" 
            className="block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Task Smasher
          </Link>
          <Link 
            to="/#tools" 
            className="block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            More Tools
          </Link>
          <Link 
            to="/#why" 
            className="block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Why SmashingApps
          </Link>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <Link 
              to="/#contact" 
              className="block btn-primary !py-2 !px-4 text-center"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

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
    handleGenerateIdeas,
    selectedUseCase,
    handleSelectUseCase,
    toggleComplete,
    showFeedback,
    submitFeedback,
    updateContext,
    deleteTask
  } = useTasksContext();

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

  return (
    <div className="min-h-screen w-full flex flex-col fade-in-app relative">
      {/* Add the Navbar at the top */}
      <TaskSmasherNavbar />
      
      {/* Global Loading Indicator for OpenAI API calls */}
      {generating && !isListening && (
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
      
      {/* Voice Recording Indicator */}
      {isListening && (
        <div className="fixed top-28 right-4 bg-white rounded-lg shadow-lg p-4 z-50 flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-gray-800">Recording... Click mic to stop</span>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedUseCase={selectedUseCase} onSelectUseCase={handleSelectUseCase} />
        
        <div className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 overflow-auto transition-colors duration-500" 
             style={{
               background: `linear-gradient(135deg, var(--primary-light) 0%, white 50%, var(--secondary-light) 100%)`
             }}>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/80 p-4 mb-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                {/* API key input removed - now using secure backend proxy */}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white w-full sm:w-[250px] appearance-none bg-no-repeat bg-right"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23555%22%20d%3D%22M6%208L0%202h12z%22%2F%3E%3C%2Fsvg%3E')", backgroundPosition: "right 0.5rem center", paddingRight: "2rem" }}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Key size={14} />
                  <span>API: Secure Proxy</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <DollarSign size={14} />
                  <span>Cost: ${totalCost.toFixed(4)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Zap size={14} />
                  <span>API Calls: {executionCount}</span>
                </div>
                
                {rateLimited && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <Info size={14} />
                    <span>Rate limited! Try again later.</span>
                  </div>
                )}
                
                {rateLimitInfo && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Info size={14} />
                    <span>Limit: {rateLimitInfo.used}/{rateLimitInfo.limit}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleUndo}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Undo last action"
                >
                  <Undo className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setFilterPriority(filterPriority === 'all' ? 'high' : filterPriority === 'high' ? 'medium' : filterPriority === 'medium' ? 'low' : 'all')}
                    title="Filter by priority"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                  {filterPriority !== 'all' && (
                    <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {filterPriority === 'high' ? 'H' : filterPriority === 'medium' ? 'M' : 'L'}
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setFilterRating(filterRating === 0 ? 5 : filterRating - 1)}
                    title="Filter by rating"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  {filterRating > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {filterRating}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => exportToExcel(boards)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => exportToPDF(boards)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Export to PDF"
                >
                  <FilePdf className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Add a new task..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={isListening ? stopVoiceInput : startVoiceInput}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full ${isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      onClick={(e) => {
                        handleAddTask(e as React.FormEvent);
                        // Add smash effect when adding task
                        const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
                        addSmashEffectAt(buttonRect.left + buttonRect.width/2, buttonRect.top + buttonRect.height/2);
                      }}
                      disabled={!newTask.trim()}
                      className="premium-button py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: `linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, white))`
                      }}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Task</span>
                    </button>
                    
                    <div className="relative">
                      <button
                        className={`py-2 px-4 border border-gray-200 rounded-lg flex items-center gap-2 h-full transition-all duration-200 ${
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
                        <span className="hidden sm:inline text-gray-700">
                          {generating ? 'Generating...' : 'Need Ideas?'}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
            >
              <SortableContext items={boards.map(board => board.id)}>
                {boards.map(board => (
                  <Board
                    key={board.id}
                    board={board}
                    editingBoardId={editingBoardId}
                    setEditingBoardId={setEditingBoardId}
                    updateBoardTitle={updateBoardTitle}
                    isDraggingOver={isDraggingOver === board.id}
                    getFilteredTasks={() => board.tasks}
                    addSubtask={addSubtask}
                    updateTaskPriority={updateTaskPriority}
                    toggleComplete={toggleComplete}
                    startEditing={startEditing}
                    handleEditSave={handleEditSave}
                    toggleExpanded={toggleExpanded}
                    showFeedback={showFeedback}
                    updateContext={updateContext}
                    generating={generating}
                    activeTask={activeTask}
                    deleteTask={deleteTask}
                  />
                ))}
              </SortableContext>
              
              <DragOverlay>
                {activeId && activeTaskObject && (
                  <Task
                    task={activeTaskObject}
                    boardId={activeTaskObject.boardId}
                    updateTaskPriority={updateTaskPriority}
                    toggleComplete={toggleComplete}
                    startEditing={startEditing}
                    handleEditSave={handleEditSave}
                    toggleExpanded={toggleExpanded}
                    showFeedback={showFeedback}
                    updateContext={updateContext}
                    generating={generating}
                    activeTask={activeTask}
                    deleteTask={deleteTask}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </div>
          
          {/* Context input popup */}
          {showContextInput && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Add context for AI</h3>
                <textarea
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  className="w-full h-40 p-2 border rounded-md mb-4"
                  placeholder="Add any additional context that will help the AI understand your task better..."
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowContextInput(null)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (showContextInput && contextInput.trim()) {
                        updateContext(showContextInput, contextInput);
                      }
                      setShowContextInput(null);
                      setContextInput('');
                    }}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Feedback popup */}
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
            </div>
          )}
          
          {/* Task Mismatch Popup */}
          {taskMismatch.showing && (
            <TaskMismatchPopup
              isVisible={taskMismatch.showing}
              reason={taskMismatch.reason}
              suggestedUseCase={taskMismatch.suggestedUseCase}
              onClose={() => setTaskMismatch({ ...taskMismatch, showing: false })}
              onSwitchUseCase={(useCase) => {
                handleSelectUseCase(useCase);
                setTaskMismatch({ ...taskMismatch, showing: false });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskSmasherApp; // Export the main wrapper component