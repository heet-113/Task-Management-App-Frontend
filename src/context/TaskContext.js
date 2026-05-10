import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks([response.data.data, ...tasks]);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      setTasks(tasks.map(task => (task.id === taskId ? response.data.data : task)));
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        getTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = React.useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within TaskProvider');
  }
  return context;
};
