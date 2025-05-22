"use client";

import type React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <div className="container p-4 mx-auto">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
