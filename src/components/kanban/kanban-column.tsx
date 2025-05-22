"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  id: string;
  title: string;
  icon?: ReactNode;
  count: number;
  onAddTask: () => void;
  color?: string;
  children: ReactNode;
}

export function KanbanColumn({ id, title, icon, count, onAddTask, color, children }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  const getBackgroundColor = () => {
    if (color) return color;

    switch (id) {
      case "todo":
        return "bg-blue-50 dark:bg-blue-950/30";
      case "in-progress":
        return "bg-amber-50 dark:bg-amber-950/30";
      case "done":
        return "bg-green-50 dark:bg-green-950/30";
      case "delivery":
        return "bg-purple-50 dark:bg-purple-950/30";
      default:
        return "bg-slate-50 dark:bg-slate-800/30";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
      style={{ height: "100%", minHeight: "300px" }}
    >
      <div className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="flex items-center">
          {icon}
          <h3 className="font-medium text-sm">{title}</h3>
          <div className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
            {count}
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onAddTask}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </div>
      <div className={`flex-1 overflow-y-auto p-2 scrollbar-thin ${getBackgroundColor()}`}>{children}</div>
    </div>
  );
}
