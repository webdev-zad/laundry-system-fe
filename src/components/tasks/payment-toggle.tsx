"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Task } from "@/types/task";
import { updateTask } from "@/services/taskService";
import { toast } from "sonner";

interface PaymentToggleProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
}

export function PaymentToggle({ task, onUpdate }: PaymentToggleProps) {
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (checked: boolean) => {
    try {
      setIsPending(true);
      const updatedTask = await updateTask(task.id, {
        ...task,
        isPaid: checked,
      });

      onUpdate(updatedTask);
      toast.success(checked ? "Payment marked as received" : "Payment marked as pending");
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`payment-${task.id}`}
        checked={task.isPaid}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <Label htmlFor={`payment-${task.id}`} className="cursor-pointer">
        {task.isPaid ? "Paid" : "Mark as paid"}
      </Label>
    </div>
  );
}
