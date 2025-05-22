"use client";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Task } from "../../types/task";
import { ReceiptButton } from "./receipt-button";
import { formatDate } from "../../utils/dateUtils";

interface TaskDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onEdit: () => void;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskDetail({ open, onOpenChange, task, onEdit, onDelete }: TaskDetailProps) {
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await onDelete(task.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Badge
              variant={
                task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "outline"
              }
            >
              {task.priority}
            </Badge>
            <Badge
              variant={
                task.status === "todo"
                  ? "outline"
                  : task.status === "in-progress"
                  ? "secondary"
                  : task.status === "done"
                  ? "default"
                  : "destructive"
              }
            >
              {task.status.replace("-", " ")}
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-sm">{formatDate(task.dueDate)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Items</h4>
              <p className="text-sm text-muted-foreground mt-1">{task.items}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium">Customer</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {task.customer.name}
              {task.customer.roomNumber && ` (Room ${task.customer.roomNumber})`}
            </p>
          </div>

          {task.assignedTo && (
            <div>
              <h4 className="text-sm font-medium">Assigned To</h4>
              <p className="text-sm text-muted-foreground mt-1">{task.assignedTo.name}</p>
            </div>
          )}

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Weight</h4>
                <p>{task.weight ? `${task.weight} kg` : "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Total Price</h4>
                <p className="font-semibold">
                  {task.totalPrice ? `₱${task.totalPrice.toFixed(2)}` : "Not calculated"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium">Payment Status</h4>
              <Badge
                variant={task.isPaid ? "outline" : "destructive"}
                className={task.isPaid ? "border-green-500 text-green-700" : ""}
              >
                {task.isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </div>

            {task.hasBlankets && (
              <div>
                <h4 className="text-sm font-medium">Blankets</h4>
                <p>
                  {task.blanketCount} blanket{task.blanketCount !== 1 ? "s" : ""} (₱50 each)
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium">Price Breakdown</h4>
              <div className="text-sm space-y-1">
                <p>Base price (4kg minimum): ₱100.00</p>
                {task.weight && task.weight > 4 && (
                  <p>
                    Additional weight ({(task.weight - 4).toFixed(1)} kg): ₱
                    {((task.weight - 4) * 25).toFixed(2)}
                  </p>
                )}
                {task.hasBlankets && (
                  <p>
                    Blankets ({task.blanketCount}): ₱{(task.blanketCount * 50).toFixed(2)}
                  </p>
                )}
                <div className="border-t pt-1 mt-1">
                  <p className="font-medium">Total: ₱{task.totalPrice?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            <ReceiptButton task={task} />
          </div>
          <Button onClick={onEdit}>Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
