export interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  totalPrice?: number;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roomNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
  // Loyalty program fields
  loyaltyPoints?: number;
  loyaltyTier?: "bronze" | "silver" | "gold" | "platinum";
  joinDate?: string;
  totalSpent?: number;
}
