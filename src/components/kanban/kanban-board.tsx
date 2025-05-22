"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  MoreHorizontal,
  Plus,
  Shirt,
  Package,
  Truck,
  Search,
  Filter,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanColumn } from "./kanban-column";
import { KanbanItem } from "./kanban-item";
import { TaskForm } from "../tasks/task-form";
import { TaskDetail } from "../tasks/task-detail";

import type { Task, KanbanColumn as KanbanColumnType } from "../../types/task";
import { getKanbanData } from "../../services/kanbanService";
import { createTask, updateTask, deleteTask } from "../../services/taskService";
import { initializeSocket } from "../../services/socketService";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getRelativeTimeString } from "../../utils/dateUtils";

export function KanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumnType[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [currentColumnId, setCurrentColumnId] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<"all" | "paid" | "unpaid">("all");
  const [activeView, setActiveView] = useState("kanban");
  const [refreshing, setRefreshing] = useState(false);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Fetch kanban data from API
  useEffect(() => {
    fetchKanbanData();
  }, []);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      const data = await getKanbanData();

      // Convert the data to the format expected by the component
      const columnsData: KanbanColumnType[] = [
        {
          id: "todo",
          title: "To Wash",
          icon: <Shirt className="h-4 w-4 mr-2 text-slate-500" />,
          tasks: data.todo || [],
        },
        {
          id: "in-progress",
          title: "Washing",
          icon: <RefreshCw className="h-4 w-4 mr-2 text-slate-500" />,
          tasks: data["in-progress"] || [],
        },
        {
          id: "done",
          title: "Ready",
          icon: <Package className="h-4 w-4 mr-2 text-slate-500" />,
          tasks: data.done || [],
        },
        {
          id: "delivery",
          title: "Delivery",
          icon: <Truck className="h-4 w-4 mr-2 text-slate-500" />,
          tasks: data.delivery || [],
        },
      ];

      setColumns(columnsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch kanban data:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKanbanData();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Initialize socket connection
  useEffect(() => {
    const socket = initializeSocket();

    // Listen for task moved events
    socket.on("task-moved", (data) => {
      console.log("Received task-moved event:", data);
      const { taskId, newStatus, task } = data;

      // Update the columns state
      setColumns((prev) => {
        // First, remove the task from all columns
        const columnsWithoutTask = prev.map((column) => ({
          ...column,
          tasks: column.tasks.filter((t) => t.id !== taskId),
        }));

        // Then, add the task to the new column
        return columnsWithoutTask.map((column) => {
          if (column.id === newStatus) {
            return {
              ...column,
              tasks: [...column.tasks, task],
            };
          }
          return column;
        });
      });
    });

    // Cleanup function
    return () => {
      socket.off("task-moved");
    };
  }, []);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;

    // Find the task and its column
    const column = columns.find((col) => col.tasks.some((task) => task.id === taskId));
    if (column) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
      }
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the source column of the active task
    const activeColumn = columns.find((col) => col.tasks.some((task) => task.id === activeId));

    // Find the target column - could be a direct column drop or a drop on another task
    let overColumn;

    // Check if we're dropping directly on a column
    overColumn = columns.find((col) => col.id === overId);

    // If not, check if we're dropping on a task and find its column
    if (!overColumn) {
      const overTask = columns.flatMap((col) => col.tasks).find((task) => task.id === overId);
      if (overTask) {
        overColumn = columns.find((col) => col.tasks.some((task) => task.id === overId));
      }
    }

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    setColumns((prev) => {
      // Find the task in the active column
      const activeTask = activeColumn.tasks.find((task) => task.id === activeId);
      if (!activeTask) return prev;

      // Create a new array with the task moved to the new column
      const newColumns = prev.map((column) => {
        // Remove the task from its current column
        if (column.id === activeColumn.id) {
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== activeId),
          };
        }

        // Add the task to the new column
        if (column.id === overColumn.id) {
          // Ensure status is one of the allowed values with type assertion
          const newTask = {
            ...activeTask,
            status: column.id as "todo" | "in-progress" | "done" | "delivery",
          };

          return {
            ...column,
            tasks: [...column.tasks, newTask],
          };
        }

        return column;
      });

      return newColumns;
    });
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Drag end event:", { active, over });

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    console.log("Active task ID:", activeId);

    if (activeId === over.id) {
      setActiveTask(null);
      return;
    }

    // Find the active task's column
    const activeColumn = columns.find((col) => col.tasks.some((task) => task.id === activeId));
    if (!activeColumn) {
      setActiveTask(null);
      return;
    }

    // Determine which column the task was dropped into
    let overColumnId: string | undefined;

    // Check if dropping directly on a column
    const isColumn = columns.some((col) => col.id === over.id);
    if (isColumn) {
      overColumnId = over.id as string;
    } else {
      // Find the column containing the task we dropped on
      const overTaskId = over.id as string;
      const foundCol = columns.find((col) => col.tasks.some((task) => task.id === overTaskId));
      overColumnId = foundCol?.id;
    }

    // If task is dropped in a different column
    if (activeColumn.id !== overColumnId && overColumnId) {
      // Find the task that's being moved
      const taskToMove = activeColumn.tasks.find((task) => task.id === activeId);

      if (!taskToMove) {
        setActiveTask(null);
        return;
      }

      // Optimistically update the UI
      setColumns((prev) => {
        return prev.map((column) => {
          // Remove from source column
          if (column.id === activeColumn.id) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== activeId),
            };
          }

          // Add to target column
          if (column.id === overColumnId) {
            const updatedTask = {
              ...taskToMove,
              status: overColumnId as "todo" | "in-progress" | "done" | "delivery",
            };

            return {
              ...column,
              tasks: [...column.tasks, updatedTask],
            };
          }

          return column;
        });
      });

      // Make the API call
      updateTaskStatus(activeId, overColumnId);
    }

    setActiveTask(null);
  };

  // Update task status via API
  const updateTaskStatus = (taskId: string, newStatus: string) => {
    console.log(`Updating task ${taskId} to status ${newStatus}`);

    const token = localStorage.getItem("token");

    // Use the full URL if needed
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    fetch(`${apiUrl}/api/kanban/move`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        taskId,
        newStatus,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Task updated successfully:", data);
      })
      .catch((error) => {
        console.error("Error updating task status:", error);
        // Revert the UI change on error
        fetchKanbanData();
      });
  };

  // Handle adding a new task
  const handleAddTask = (columnId: string) => {
    setCurrentColumnId(columnId);
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
        // Check if status has changed
        const statusChanged = editingTask.status !== formData.status;

        // Update the task
        const updatedTask = await updateTask(editingTask.id, formData);

        // If status changed, update the columns
        if (statusChanged) {
          setColumns((prev) => {
            // Remove the task from its current column
            const columnsWithoutTask = prev.map((column) => ({
              ...column,
              tasks: column.tasks.filter((t) => t.id !== editingTask!.id),
            }));

            // Add the task to the new column
            return columnsWithoutTask.map((column) => {
              if (column.id === formData.status) {
                return {
                  ...column,
                  tasks: [...column.tasks, updatedTask],
                };
              }
              return column;
            });
          });
        } else {
          // Just update the task in its current column
          setColumns((prev) => {
            return prev.map((column) => {
              if (column.id === formData.status) {
                return {
                  ...column,
                  tasks: column.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
                };
              }
              return column;
            });
          });
        }
      } else {
        // Create a new task
        const newTask = await createTask({
          ...formData,
          status: currentColumnId as "todo" | "in-progress" | "done" | "delivery",
        });

        // Add the new task to the appropriate column
        setColumns((prev) => {
          return prev.map((column) => {
            if (column.id === currentColumnId) {
              return {
                ...column,
                tasks: [...column.tasks, newTask],
              };
            }
            return column;
          });
        });
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

      setColumns((prev) => {
        return prev.map((col) => {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task.id !== taskId),
          };
        });
      });

      setTaskDetailOpen(false);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete order. Please try again.");
    }
  };

  // Filter tasks based on search query and priority filter
  const filterTasks = useCallback(() => {
    let filtered = [...columns];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.map((column) => ({
        ...column,
        tasks: column.tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      }));
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      filtered = filtered.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.priority === filterPriority),
      }));
    }

    // Apply payment filter
    if (filterPayment !== "all") {
      filtered = filtered.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => (filterPayment === "paid" ? task.isPaid : !task.isPaid)),
      }));
    }

    return filtered;
  }, [columns, searchQuery, filterPriority, filterPayment]);

  const filteredColumns = filterTasks();

  // Render task card
  const renderTaskCard = (task: Task) => {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow shadow-none">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    task.priority === "high"
                      ? "destructive"
                      : task.priority === "medium"
                      ? "outline"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>

                {/* Payment status badge */}
                <Badge
                  variant={task.isPaid ? "outline" : "destructive"}
                  className={`text-[10px] ${task.isPaid ? "border-green-500 text-green-700" : ""}`}
                >
                  {task.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <div className="font-medium">{task.title}</div>
              {task.description && (
                <div className="text-xs text-slate-500 line-clamp-2">{task.description}</div>
              )}
            </div>

            {/* Format the due date */}
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(task.dueDate)}</span>
              <span className="ml-1 text-xs text-slate-400">({getRelativeTimeString(task.dueDate)})</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${task.customer.name}`}
                    alt={task.customer.name}
                  />
                  <AvatarFallback>{task.customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{task.customer.name}</span>
              </div>
              <div className="font-medium text-sm">
                {task.totalPrice ? `₱${task.totalPrice.toFixed(2)}` : ""}
              </div>
            </div>

            {/* Blanket information if applicable */}
            {task.hasBlankets && (
              <div className="text-xs text-slate-500">
                Includes {task.blanketCount} blanket{task.blanketCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchKanbanData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search orders..."
                className="pl-8 border-slate-200 dark:border-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-40 border-slate-200 dark:border-slate-800">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filter" />
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
              <SelectTrigger className="w-full sm:w-40 border-slate-200 dark:border-slate-800">
                <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="unpaid">Unpaid Only</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-slate-200 dark:border-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <Tabs defaultValue="kanban" value={activeView} onValueChange={setActiveView} className="space-y-4">
          <TabsList className="bg-slate-100 dark:bg-slate-900">
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-0">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToWindowEdges]}
            >
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                style={{ height: "calc(100vh - 200px)" }}
              >
                {filteredColumns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    icon={column.icon}
                    count={column.tasks.length}
                    onAddTask={() => handleAddTask(column.id)}
                  >
                    <SortableContext
                      id={column.id}
                      items={column.tasks.map((task) => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {column.tasks.map((task) => (
                          <KanbanItem key={task.id} id={task.id}>
                            <div onClick={() => handleTaskClick(task)}>{renderTaskCard(task)}</div>
                          </KanbanItem>
                        ))}

                        {column.tasks.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-24 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 text-sm">
                            <p>No orders</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleAddTask(column.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add order
                            </Button>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </KanbanColumn>
                ))}
              </div>

              {/* Drag overlay - shows a preview of the task being dragged */}
              <DragOverlay adjustScale={true} modifiers={[restrictToWindowEdges]}>
                {activeTask ? renderTaskCard(activeTask) : null}
              </DragOverlay>
            </DndContext>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <div className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-12 gap-2 p-3 bg-slate-50 dark:bg-slate-900 font-medium text-sm">
                <div className="col-span-4">Order Details</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-1">Items</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2">Status</div>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredColumns.flatMap((column) =>
                  column.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-12 gap-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="col-span-4">
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-slate-500 line-clamp-1">{task.description}</div>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${task.customer.name}`}
                            alt={task.customer.name}
                          />
                          <AvatarFallback>{task.customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">{task.customer.name}</span>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                          <Shirt className="h-3 w-3" />
                          <span className="text-xs font-medium">{task.items}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(task.dueDate)}
                      </div>
                      <div className="col-span-1 flex items-center">
                        {task.priority === "high" ? (
                          <Badge variant="destructive" className="text-[10px]">
                            High
                          </Badge>
                        ) : task.priority === "medium" ? (
                          <Badge variant="outline" className="text-[10px] border-yellow-500 text-yellow-700">
                            Medium
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-green-500 text-green-700">
                            Low
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center">
                        <Badge
                          variant="outline"
                          className={`
                            ${task.status === "todo" ? "border-slate-400 text-slate-600" : ""}
                            ${task.status === "in-progress" ? "border-blue-400 text-blue-600" : ""}
                            ${task.status === "done" ? "border-green-400 text-green-600" : ""}
                            ${task.status === "delivery" ? "border-purple-400 text-purple-600" : ""}
                          `}
                        >
                          {task.status === "todo" && <Shirt className="h-3 w-3 mr-1" />}
                          {task.status === "in-progress" && <RefreshCw className="h-3 w-3 mr-1" />}
                          {task.status === "done" && <Package className="h-3 w-3 mr-1" />}
                          {task.status === "delivery" && <Truck className="h-3 w-3 mr-1" />}
                          {task.status === "todo" && "To Wash"}
                          {task.status === "in-progress" && "Washing"}
                          {task.status === "done" && "Ready"}
                          {task.status === "delivery" && "Delivery"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}

                {filteredColumns.flatMap((column) => column.tasks).length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <p>No orders match your filters</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterPriority("all");
                        setFilterPayment("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Task form modal */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        onSubmit={handleTaskFormSubmit}
        columnId={currentColumnId}
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
    </>
  );
}
