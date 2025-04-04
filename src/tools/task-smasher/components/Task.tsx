import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, ChevronDown, ChevronRight, Plus, RefreshCw, Sparkles, Timer, Trash2, MessageCircle, Star, GripVertical } from 'lucide-react';
import { TaskProps } from '../types';
import Subtask from './Subtask';

function Task({
  task,
  boardId,
  onToggleExpanded,
  onToggleComplete,
  onShowFeedback,
  onDeleteTask,
  onDelete,
  onGenerateSubtasks,
  onAddSubtask,
  onRegenerateTask,
  showContextInput,
  setShowContextInput,
  contextInput,
  setContextInput,
  updateContext,
  generating,
  activeTask,
  editing,
  startEditing,
  handleEditSave,
  updateTaskPriority
}: TaskProps) {
  // Use onDelete if provided, otherwise fall back to onDeleteTask
  const handleDelete = onDelete || onDeleteTask;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const priorityClasses = {
    low: 'text-gray-500 border-gray-300 bg-gray-50 hover:bg-gray-100',
    medium: 'text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100',
    high: 'text-red-600 border-red-300 bg-red-50 hover:bg-red-100'
  };

  const isEditing = editing.taskId === task.id && !editing.subtaskId;
  const isGenerating = generating && activeTask === task.id;
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePriorityChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const priorities = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    updateTaskPriority && updateTaskPriority(task.id, boardId, priorities[nextIndex] as 'low' | 'medium' | 'high');
  };

  // Show rating as stars
  const renderRating = () => {
    if (!task.feedback) return null;
    
    return (
      <div className="flex items-center gap-1 text-yellow-400" title={`Rating: ${task.feedback}/5`}>
        {Array.from({ length: task.feedback }).map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400" />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border ${
        isGenerating
          ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
      } p-4 mb-3 transition-all duration-200 cursor-grab active:cursor-grabbing`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id, boardId)}
          className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full ${
            task.completed
              ? 'text-green-500 bg-green-50 hover:bg-green-100'
              : 'text-gray-300 bg-gray-50 hover:bg-gray-100'
          } transition-all duration-200 flex items-center justify-center`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
        
        <div className="flex-grow min-w-0" style={{ position: 'relative' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleExpanded(task.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0 p-1 rounded-full hover:bg-gray-100"
            >
              {task.expanded
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />
              }
            </button>
            
            {isEditing && editing.field === 'title' ? (
              <input
                type="text"
                value={editing.value}
                onChange={(e) => startEditing(task.id, null, 'title', e.target.value)}
                onBlur={() => handleEditSave(boardId)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditSave(boardId)}
                className="flex-grow py-1 px-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            ) : (
              <h3
                className={`text-base font-medium ${
                  task.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-700 hover:text-gray-900'
                } cursor-pointer transition-colors duration-200 relative flex items-center`}
                onClick={() => startEditing(task.id, null, 'title', task.title)}
                onMouseEnter={(e) => {
                  setShowTooltip(true);
                  // Position the tooltip near the cursor
                  setTimeout(() => {
                    const tooltip = document.querySelector('.task-tooltip') as HTMLElement;
                    if (tooltip) {
                      tooltip.style.left = `${e.clientX + 10}px`;
                      tooltip.style.top = `${e.clientY + 10}px`;
                    }
                  }, 0);
                }}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className="mr-1 max-w-[90%] break-words whitespace-normal">{task.title}</span>
                {task.title.length > 50 && (
                  <span className="text-xs text-indigo-500 flex-shrink-0 ml-1" title="Click to see full text">
                    •••
                  </span>
                )}
                
                {/* Prominent tooltip that appears immediately on hover */}
                {showTooltip && (
                  <div style={{animation: 'fadeIn 0.15s ease-out forwards', position: 'fixed', zIndex: 1000}} className="task-tooltip bg-gray-800 text-white text-sm rounded-md p-3 shadow-xl max-w-xs whitespace-normal break-words pointer-events-none border border-gray-700">
                    <div className="font-medium mb-1">Full Text:</div>
                    {task.title}
                  </div>
                )}
              </h3>
            )}
            
            {task.feedback && renderRating()}
            
            <div className="text-gray-300 ml-auto flex-shrink-0 cursor-grab p-1 rounded-full hover:bg-gray-100 hover:text-gray-500">
              <GripVertical className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-xs overflow-hidden">
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 bg-gray-50 ${
                isEditing && editing.field === 'time' ? '' : 'cursor-pointer hover:bg-gray-100'
              } transition-colors duration-200 flex-shrink-0`}
              onClick={() => !isEditing && startEditing(task.id, null, 'time', task.estimatedTime.toString())}
              title="Time estimate"
            >
              {isEditing && editing.field === 'time' ? (
                <div className="flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="number"
                    value={editing.value}
                    onChange={(e) => startEditing(task.id, null, 'time', e.target.value)}
                    onBlur={() => handleEditSave(boardId)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave(boardId)}
                    className="w-12 py-0.5 px-1 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    min="0"
                    autoFocus
                  />
                  <span className="text-gray-500">h</span>
                </div>
              ) : (
                <>
                  <Timer className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-600 font-medium">{task.estimatedTime}h</span>
                </>
              )}
            </div>
            
            <button
              onClick={handlePriorityChange}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityClasses[task.priority]} flex-shrink-0 transition-colors duration-200 cursor-pointer shadow-sm`}
              title="Click to change priority"
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </button>
            
            <div className="flex ml-auto items-center gap-2 flex-shrink-0">
              <button
                className="text-indigo-500 hover:text-indigo-700 transition-colors px-2.5 py-1 rounded-full hover:bg-indigo-50 font-medium"
                onClick={() => onShowFeedback(task.id)}
              >
                Rate
              </button>
              
              {showContextInput === task.id ? (
                <div className="flex items-start gap-2 mt-2 w-full">
                  <input
                    type="text"
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="Add notes..."
                    className="flex-grow text-xs py-1 px-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => updateContext(task.id)}
                    className="px-2 py-1 text-xs text-white bg-indigo-500 rounded hover:bg-indigo-600 transition-colors"
                  >
                    Add Notes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowContextInput(task.id)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                  title={task.context ? "Edit notes" : "Add notes"}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
              )}
              
              <button
                onClick={() => handleDelete && handleDelete(task.id, boardId)}
                className="text-red-400 hover:text-red-600 transition-colors rounded-full p-1.5 hover:bg-red-50"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {task.context && (
            <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 shadow-sm">
              <span className="font-medium text-gray-700">Notes:</span> {task.context}
            </div>
          )}
          
          {task.subtasks.length > 0 && task.expanded && (
            <div className="mt-4 space-y-1.5 border-l-2 border-indigo-100 pl-2 ml-1">
              {task.subtasks.map((subtask) => (
                <Subtask
                  key={subtask.id}
                  subtask={subtask}
                  taskId={task.id}
                  boardId={boardId}
                  onToggleComplete={onToggleComplete}
                  editing={editing}
                  startEditing={startEditing}
                  handleEditSave={handleEditSave}
                  onDeleteTask={handleDelete || (() => {})}
                  updateTaskPriority={updateTaskPriority}
                />
              ))}
            </div>
          )}
          
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => onAddSubtask(task.id, boardId)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 py-1.5 px-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Subtask</span>
            </button>
            
            <button
              onClick={() => onRegenerateTask(task.id)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 py-1.5 px-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
            
            <button
              onClick={() => onGenerateSubtasks(task.id)}
              className={`flex items-center justify-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 py-1.5 px-3 rounded-full shadow-sm transition-colors ${
                isGenerating ? 'bg-indigo-50 animate-pulse' : 'bg-indigo-50 hover:bg-indigo-100'
              }`}
              disabled={isGenerating}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'AI Subtasks'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task;