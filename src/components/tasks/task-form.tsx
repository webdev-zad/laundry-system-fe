"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Task } from "../../types/task";
import { getCustomers } from "../../services/customerService";
import { Checkbox } from "../ui/checkbox";

const serviceTypes = [
  "Regular Wash & Fold",
  "Express Laundry",
  "Delicate Items",
  "Bedding & Comforters",
  "Dry Cleaning",
  "Family Package",
  "Weekly Subscription",
  "Same-Day Service",
  "Basic Wash",
];

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Partial<Task>) => void;
  columnId: string;
  initialTask: Task | null;
  isEditing: boolean;
}

export function TaskForm({ open, onOpenChange, onSubmit, initialTask, isEditing }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState(1);
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState<{ id: string; name: string; roomNumber?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"todo" | "in-progress" | "done" | "delivery">("todo");
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [totalPrice, setTotalPrice] = useState<number | undefined>(undefined);
  const [hasBlankets, setHasBlankets] = useState(false);
  const [blanketCount, setBlanketCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [showTitleField, setShowTitleField] = useState(false);

  const calculatePrice = useCallback(() => {
    if (!weight) return;

    // Base price: ₱100 for 4kg minimum
    let price = 0;

    if (weight <= 4) {
      price = 100; // Minimum price
    } else {
      // ₱25 per kg above 4kg
      price = 100 + (weight - 4) * 25;
    }

    // Add blanket charges if applicable
    if (hasBlankets && blanketCount) {
      price += blanketCount * 50; // ₱50 per blanket
    }

    setTotalPrice(Math.round(price * 100) / 100);
  }, [weight, hasBlankets, blanketCount]);

  useEffect(() => {
    calculatePrice();
  }, [weight, hasBlankets, blanketCount, calculatePrice]);

  useEffect(() => {
    if (open) {
      // Reset form when opened
      if (isEditing && initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || "");
        setPriority(initialTask.priority);
        // Format date for input
        const date = new Date(initialTask.dueDate);
        setDueDate(date.toISOString().slice(0, 16));
        setItems(initialTask.items);
        setCustomerId(initialTask.customerId);
        setStatus(initialTask.status);
        setWeight(initialTask.weight);
        setTotalPrice(initialTask.totalPrice);
        setHasBlankets(initialTask.hasBlankets);
        setBlanketCount(initialTask.blanketCount);
        setIsPaid(initialTask.isPaid);
        setServiceType(initialTask.serviceType || "");
      } else {
        setTitle("");
        setDescription("");
        setPriority("medium");
        // Set default due date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);
        setDueDate(tomorrow.toISOString().slice(0, 16));
        setItems(1);
        setCustomerId("");
        setStatus("todo");
        setWeight(undefined);
        setTotalPrice(undefined);
        setHasBlankets(false);
        setBlanketCount(0);
        setIsPaid(false);
        setServiceType("");
      }

      // Load customers
      const loadCustomers = async () => {
        try {
          setLoading(true);
          const data = await getCustomers();
          setCustomers(data);
        } catch (error) {
          console.error("Failed to load customers:", error);
        } finally {
          setLoading(false);
        }
      };

      loadCustomers();
    }
  }, [open, isEditing, initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData: Partial<Task> = {
      title,
      description: description || undefined,
      priority,
      dueDate,
      items,
      customerId,
      status,
      weight,
      totalPrice,
      hasBlankets,
      blanketCount,
      isPaid,
      serviceType,
    };

    if (isEditing && initialTask) {
      taskData.id = initialTask.id;
    }

    onSubmit(taskData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Order Title (Auto-generated)</Label>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTitleField(!showTitleField)}
                className="text-xs"
              >
                {showTitleField ? "Use auto-generated" : "Customize"}
              </Button>
            </div>
            {showTitleField ? (
              <Input
                id="title"
                placeholder="Order title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            ) : (
              <div className="p-2 border rounded-md bg-muted/50">
                {title || "Title will be generated automatically"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="items">Number of Items</Label>
              <Input
                id="items"
                type="number"
                min={1}
                value={items}
                onChange={(e) => setItems(parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              value={serviceType}
              onValueChange={(value) => {
                setServiceType(value);
                // Auto-generate title based on customer and service type
                if (customerId) {
                  const customer = customers.find((c) => c.id === customerId);
                  if (customer) {
                    setTitle(`${value} - ${customer.name}`);
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={customerId}
              onValueChange={(value) => {
                setCustomerId(value);
                // Auto-generate title when customer changes
                if (value && serviceType) {
                  const customer = customers.find((c) => c.id === value);
                  if (customer) {
                    setTitle(`${serviceType} - ${customer.name}`);
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              value={status}
              onValueChange={(value) => setStatus(value as "todo" | "in-progress" | "done" | "delivery")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter weight in kg"
                value={weight || ""}
                onChange={(e) => setWeight(parseFloat(e.target.value) || undefined)}
              />
              <p className="text-xs text-muted-foreground">Minimum 4kg (₱100 for 4kg)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice">Total Price (₱)</Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Calculated price"
                value={totalPrice || ""}
                onChange={(e) => setTotalPrice(parseFloat(e.target.value) || undefined)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasBlankets"
                checked={hasBlankets}
                onCheckedChange={(checked) => {
                  setHasBlankets(checked === true);
                  setBlanketCount(checked === false ? 0 : blanketCount);
                }}
              />
              <Label htmlFor="hasBlankets">Includes blankets</Label>
            </div>

            {hasBlankets && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="blanketCount">Number of blankets</Label>
                <Input
                  id="blanketCount"
                  type="number"
                  min="0"
                  placeholder="Enter number of blankets"
                  value={blanketCount || 0}
                  onChange={(e) => setBlanketCount(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">Additional charge for blankets: ₱50 each</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPaid"
                checked={isPaid}
                onCheckedChange={(checked) => setIsPaid(checked === true)}
              />
              <Label htmlFor="isPaid">Payment received</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
