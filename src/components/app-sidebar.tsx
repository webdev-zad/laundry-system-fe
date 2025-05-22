"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Shirt,
  Users,
  WashingMachineIcon as Washing,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const pathname = usePathname();

  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/dashboard";
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-border/50">
        <Search className="absolute left-7 top-6.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search..." className="pl-8 bg-white border-none" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/orders")}>
                <Link href="/dashboard/orders">
                  <ClipboardList className="h-4 w-4" />
                  <span>Orders</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/calendar")}>
                <Link href="/dashboard/calendar">
                  <CalendarDays className="h-4 w-4" />
                  <span>Calendar</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/customers")}>
                <Link href="/dashboard/customers">
                  <Users className="h-4 w-4" />
                  <span>Customers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/services/washing")}>
                  <Link href="/dashboard/services/washing">
                    <Washing className="h-4 w-4" />
                    <span>Washing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/services/dry-cleaning")}>
                  <Link href="/dashboard/services/dry-cleaning">
                    <Shirt className="h-4 w-4" />
                    <span>Dry Cleaning</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/services/delivery")}>
                  <Link href="/dashboard/services/delivery">
                    <Package className="h-4 w-4" />
                    <span>Delivery</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span>Admin User</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
