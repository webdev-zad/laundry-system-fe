"use client";

import { useState, useEffect } from "react";
import { Calendar, Filter, Search, Shirt, Package, Truck, RefreshCw, Plus, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskDetail } from "@/components/tasks/task-detail";

import { getKanbanData } from "@/services/kanbanService";
import { createTask, updateTask, deleteTask } from "@/services/taskService";
import { Task } from "@/types/task";
import { formatDate, getRelativeTimeString } from "@/utils/dateUtils";

export default function OrdersPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<"all" | "paid" | "unpaid">("all");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tasks data
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getKanbanData();

      // Combine all tasks from different columns
      const allTasks = [...data.todo, ...data["in-progress"], ...data.done, ...data.delivery];

      // Sort by due date (most recent first)
      allTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      setTasks(allTasks);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter((task) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Apply priority filter
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;

    // Apply status filter
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;

    // Apply payment filter
    const matchesPayment = filterPayment === "all" || (filterPayment === "paid" ? task.isPaid : !task.isPaid);

    return matchesSearch && matchesPriority && matchesStatus && matchesPayment;
  });

  // Handle adding a new task
  const handleAddTask = () => {
    setEditingTask(null);
    setTaskFormOpen(true);
  };

  // Handle editing a task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  // Handle task form submission
  const handleTaskFormSubmit = async (formData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await updateTask(editingTask.id, formData);

        // Update tasks list
        setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
      } else {
        // Create new task
        const newTask = await createTask({
          ...formData,
          status: "todo" as "todo" | "in-progress" | "done" | "delivery",
        });

        // Add new task to list
        setTasks((prev) => [...prev, newTask]);
      }

      // Close the form
      setTaskFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save order. Please try again.");
    }
  };

  // Handle task click (open details)
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  // Handle task delete
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);

      // Remove task from list
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setTaskDetailOpen(false);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete order. Please try again.");
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Shirt className="h-3 w-3 mr-1" />;
      case "in-progress":
        return <RefreshCw className="h-3 w-3 mr-1" />;
      case "done":
        return <Package className="h-3 w-3 mr-1" />;
      case "delivery":
        return <Truck className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "To Wash";
      case "in-progress":
        return "Washing";
      case "done":
        return "Ready";
      case "delivery":
        return "Delivery";
      default:
        return status;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "todo":
        return "border-slate-400 text-slate-600";
      case "in-progress":
        return "border-blue-400 text-blue-600";
      case "done":
        return "border-green-400 text-green-600";
      case "delivery":
        return "border-purple-400 text-purple-600";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-4">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchTasks} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-2 w-full">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-40">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Wash</SelectItem>
            <SelectItem value="in-progress">Washing</SelectItem>
            <SelectItem value="done">Ready</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full md:w-40">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterPayment}
          onValueChange={(value) => setFilterPayment(value as "all" | "paid" | "unpaid")}
        >
          <SelectTrigger className="w-full md:w-40">
            <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid Only</SelectItem>
            <SelectItem value="unpaid">Unpaid Only</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Details</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-slate-500">No orders found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterPriority("all");
                        setFilterStatus("all");
                        setFilterPayment("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleTaskClick(task)}
                  >
                    <TableCell>
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-slate-500 line-clamp-1">{task.description}</div>
                      )}
                      <div className="text-xs text-slate-500">
                        Items: {task.items}{" "}
                        {task.hasBlankets &&
                          `(incl. ${task.blanketCount} blanket${task.blanketCount !== 1 ? "s" : ""})`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${task.customer.name}`}
                            alt={task.customer.name}
                          />
                          <AvatarFallback>{task.customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{task.customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <div className="text-xs text-slate-500">{getRelativeTimeString(task.dueDate)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(task.status)}>
                        {getStatusIcon(task.status)}
                        {getStatusText(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                            ? "outline"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={task.isPaid ? "outline" : "destructive"}
                        className={`text-xs ${task.isPaid ? "border-green-500 text-green-700" : ""}`}
                      >
                        {task.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₱{task.totalPrice?.toFixed(2) || "0.00"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Task form modal */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        onSubmit={handleTaskFormSubmit}
        columnId="todo"
        initialTask={editingTask}
        isEditing={!!editingTask}
      />

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetail
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          task={selectedTask}
          onEdit={() => handleEditTask(selectedTask)}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
