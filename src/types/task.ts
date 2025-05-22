import { ReactNode } from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done" | "delivery";
  priority: "low" | "medium" | "high";
  dueDate: string;
  items: number;

  // New fields
  weight?: number;
  hasBlankets: boolean;
  blanketCount: number;
  isPaid: boolean;
  totalPrice?: number;
  serviceType?: string;

  customerId: string;
  customer: {
    id: string;
    name: string;
    roomNumber?: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  icon?: ReactNode;
  tasks: Task[];
}
