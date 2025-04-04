import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Pencil, GripVertical } from 'lucide-react';
import { BoardComponentProps } from '../types';
import Task from './Task';
import DroppableBoard from './DroppableBoard';

function Board({
  board,
  filteredTasks,
  editingBoardId,
  setEditingBoardId,
  updateBoardTitle,
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
  updateTaskPriority,
  isDraggingOver
}: BoardComponentProps) {
  // Use onDelete if provided, otherwise fall back to onDeleteTask
  const handleDelete = onDelete || onDeleteTask;
  return (
    <div className={`flex-1 ${isDraggingOver === board.id ? 'scale-[1.02] transition-transform duration-200' : ''}`}>
      
      <DroppableBoard board={board}>
        <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {filteredTasks.map(task => (
            <Task
              key={task.id}
              task={task}
              boardId={board.id}
              onToggleExpanded={onToggleExpanded}
              onToggleComplete={onToggleComplete}
              onShowFeedback={onShowFeedback}
              onDelete={handleDelete}
              onGenerateSubtasks={onGenerateSubtasks}
              onAddSubtask={onAddSubtask}
              onRegenerateTask={onRegenerateTask}
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
            />
          ))}
        </SortableContext>
      </DroppableBoard>
    </div>
  );
}

export default Board;