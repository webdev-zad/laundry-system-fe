"use client";

import { ProtectedRoute } from "../../components/auth/protected-route";
import { KanbanBoard } from "../../components/kanban/kanban-board";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <header className="border-b bg-background p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Laundry Management System</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name} ({user?.role})
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden p-4">
          <div className="container mx-auto h-full">
            <KanbanBoard />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
