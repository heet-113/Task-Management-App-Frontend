import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import { initializeSocket, disconnectSocket, getSocket } from '../utils/socket';
import './Dashboard.css';

const Dashboard = () => {
  const { tasks, loading, error, fetchTasks } = useTask();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Initialize WebSocket connection
    if (user?.id) {
      initializeSocket(user.id);

      // Listen for real-time task updates
      const socket = getSocket();
      if (socket) {
        socket.on('task:created', (newTask) => {
          console.log('Task created via socket:', newTask);
          fetchTasks();
        });

        socket.on('task:updated', (updatedTask) => {
          console.log('Task updated via socket:', updatedTask);
          fetchTasks();
        });

        socket.on('task:deleted', (deletedTaskId) => {
          console.log('Task deleted via socket:', deletedTaskId);
          fetchTasks();
        });
      }

      return () => {
        // Cleanup on unmount
        if (socket) {
          socket.off('task:created');
          socket.off('task:updated');
          socket.off('task:deleted');
        }
      };
    }
  }, [user?.id, fetchTasks]);

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTask(null);
  };

  const getFilteredTasks = () => {
    if (filter === 'all') return tasks;
    return tasks.filter((task) => task.status === filter);
  };

  const filteredTasks = getFilteredTasks();
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>My Tasks</h1>
          <p className="subtitle">Manage and track your tasks efficiently</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-create-task">
          + Create New Task
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-container">
        <div className="stat-card">
          <h3>To Do</h3>
          <p className="stat-number">{todoCount}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{inProgressCount}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">{completedCount}</p>
        </div>
        <div className="stat-card">
          <h3>Total</h3>
          <p className="stat-number">{tasks.length}</p>
        </div>
      </div>

      <div className="filter-container">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks
        </button>
        <button
          className={`filter-btn ${filter === 'todo' ? 'active' : ''}`}
          onClick={() => setFilter('todo')}
        >
          To Do
        </button>
        <button
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="tasks-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>
              {filter === 'all' ? 'No tasks yet. Create one to get started!' : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
            ))}
          </div>
        )}
      </div>

      {showForm && <TaskForm task={selectedTask} onClose={handleCloseForm} />}
    </div>
  );
};

export default Dashboard;
