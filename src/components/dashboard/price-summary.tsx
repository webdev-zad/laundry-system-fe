"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/task";
import { CreditCard, DollarSign, Wallet } from "lucide-react";

interface PriceSummaryProps {
  tasks: Task[];
}

export function PriceSummary({ tasks }: PriceSummaryProps) {
  // Calculate total revenue
  const totalRevenue = tasks.reduce((sum, task) => sum + (task.totalPrice || 0), 0);

  // Calculate paid amount
  const paidAmount = tasks
    .filter((task) => task.isPaid)
    .reduce((sum, task) => sum + (task.totalPrice || 0), 0);

  // Calculate pending payments
  const pendingAmount = totalRevenue - paidAmount;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">From {tasks.length} orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payments Received</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{paidAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {tasks.filter((task) => task.isPaid).length} paid orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{pendingAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {tasks.filter((task) => !task.isPaid).length} unpaid orders
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
