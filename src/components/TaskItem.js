import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import './TaskItem.css';

const TaskItem = ({ task, onEdit }) => {
  const { deleteTask, updateTask } = useTask();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Error deleting task:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  const getDueDate = () => {
    if (!task.dueDate) return 'No due date';
    const date = new Date(task.dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        <span className="task-date">📅 {getDueDate()}</span>
      </div>

      <div className="task-footer">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="status-select"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <div className="task-actions">
          <button onClick={() => onEdit(task)} className="edit-btn" title="Edit task">
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="delete-btn"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
