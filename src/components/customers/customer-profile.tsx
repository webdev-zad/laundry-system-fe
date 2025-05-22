"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Mail, Phone, Home, ClipboardList, Pencil, Trash2, Award } from "lucide-react";
import { Customer } from "@/types/customer";
import { Task } from "@/types/task";
import { getCustomerById } from "@/services/customerService";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerLoyalty } from "./customer-loyalty";

interface CustomerProfileProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export function CustomerProfile({ customer, onEdit, onDelete }: CustomerProfileProps) {
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);

  useEffect(() => {
    fetchCustomerDetails(customer.id);
  }, [customer.id]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      setLoading(true);
      const data = await getCustomerById(customerId);
      setCustomerDetails(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
      setError("Failed to load customer details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  const handleLoyaltyUpdated = (updatedCustomer: Customer) => {
    if (customerDetails) {
      setCustomerDetails({
        ...customerDetails,
        loyaltyPoints: updatedCustomer.loyaltyPoints,
        loyaltyTier: updatedCustomer.loyaltyTier,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => fetchCustomerDetails(customer.id)}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!customerDetails) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://avatar.vercel.sh/${customerDetails.id}`} alt={customerDetails.name} />
            <AvatarFallback className="text-2xl">{customerDetails.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{customerDetails.name}</h2>
            <p className="text-slate-500">Customer since {formatDate(customerDetails.createdAt)}</p>
            {customerDetails.loyaltyTier && (
              <Badge className="mt-1" variant="outline">
                {customerDetails.loyaltyTier.charAt(0).toUpperCase() + customerDetails.loyaltyTier.slice(1)}{" "}
                Member
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 self-start">
          <Button variant="outline" className="flex items-center" onClick={() => setLoyaltyOpen(true)}>
            <Award className="h-4 w-4 mr-2" />
            Loyalty Program
          </Button>
          <Button variant="outline" className="flex items-center" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="flex items-center"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this customer?")) {
                onDelete(customerDetails.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Customer Details</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customerDetails.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-slate-400" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-slate-500">{customerDetails.email}</div>
                  </div>
                </div>
              )}
              {customerDetails.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-slate-400" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-slate-500">{customerDetails.phone}</div>
                  </div>
                </div>
              )}
              {customerDetails.roomNumber && (
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-3 text-slate-400" />
                  <div>
                    <div className="font-medium">Room Number</div>
                    <div className="text-slate-500">{customerDetails.roomNumber}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {customerDetails.tasks && customerDetails.tasks.length > 0 ? (
                <div className="space-y-4">
                  {(customerDetails.tasks as unknown as Task[]).map((task) => (
                    <div key={task.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-slate-500">{task.description}</div>
                          )}
                        </div>
                        <Badge
                          variant={
                            task.status === "todo"
                              ? "outline"
                              : task.status === "in-progress"
                              ? "secondary"
                              : task.status === "done"
                              ? "default"
                              : "outline"
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                        <div className="font-medium">₱{task.totalPrice?.toFixed(2) || "0.00"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-500">No order history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomerLoyalty
        open={loyaltyOpen}
        onOpenChange={setLoyaltyOpen}
        customer={customerDetails}
        onPointsUpdated={handleLoyaltyUpdated}
      />
    </div>
  );
}
