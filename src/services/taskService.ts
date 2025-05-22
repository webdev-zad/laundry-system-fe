import api from "./api";
import { Task } from "../types/task";

interface TaskFilters {
  status?: string;
  priority?: string;
  customerId?: string;
}

export const getTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  const response = await api.get("/tasks", { params: filters });
  return response.data;
};

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

export const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const updateTaskStatus = async (id: string, status: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/status`, { status });
  return response.data;
};
