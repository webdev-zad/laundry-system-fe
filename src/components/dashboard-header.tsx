"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const [view, setView] = useState("board");

  return (
    <header className="border-b border-border/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Laundry Tasks</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search tasks..." className="pl-8 w-[200px] bg-background/50" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <span>View: {view}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setView("board")}>Board view</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("calendar")}>Calendar view</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("list")}>List view</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
