import api from "./api";
import { Task } from "../types/task";

interface KanbanData {
  todo: Task[];
  "in-progress": Task[];
  done: Task[];
  delivery: Task[];
}

export const getKanbanData = async (): Promise<KanbanData> => {
  const response = await api.get("/kanban");
  return response.data;
};

export const moveTask = async (taskId: string, newStatus: string): Promise<Task> => {
  try {
    console.log(`API call: Moving task ${taskId} to ${newStatus}`);
    console.log("Task ID type:", typeof taskId);

    // If your server expects ObjectId, you might need to ensure proper format
    const response = await api.patch("/kanban/move", {
      taskId,
      newStatus,
    });

    console.log("API response for move task:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error moving task:", error);
    throw error;
  }
};
