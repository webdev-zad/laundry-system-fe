"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Mail, Phone, Home, ClipboardList, Pencil, Trash2, Award } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Customer } from "@/types/customer";
import { getCustomerById } from "@/services/customerService";
import { Task } from "@/types/task";
import { CustomerLoyalty } from "./customer-loyalty";

interface CustomerDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export function CustomerDetail({ open, onOpenChange, customer, onEdit, onDelete }: CustomerDetailProps) {
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);

  // Fetch customer details when dialog opens
  useEffect(() => {
    if (open && customer) {
      fetchCustomerDetails(customer.id);
    }
  }, [open, customer]);

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

  // Format date for display
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4 items-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-destructive mb-2">{error}</p>
            <Button variant="outline" onClick={() => customer && fetchCustomerDetails(customer.id)}>
              Try Again
            </Button>
          </div>
        ) : customerDetails ? (
          <>
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>View detailed information about this customer.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer profile */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${customerDetails.name}`}
                    alt={customerDetails.name}
                  />
                  <AvatarFallback>{customerDetails.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{customerDetails.name}</h3>
                  <p className="text-sm text-slate-500">
                    Customer since {formatDate(customerDetails.createdAt)}
                  </p>
                </div>
              </div>

              {/* Contact information */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-2">
                  {customerDetails.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{customerDetails.email}</span>
                    </div>
                  )}
                  {customerDetails.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{customerDetails.phone}</span>
                    </div>
                  )}
                  {customerDetails.roomNumber && (
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-slate-400" />
                      <span>Room {customerDetails.roomNumber}</span>
                    </div>
                  )}
                  {!customerDetails.email && !customerDetails.phone && !customerDetails.roomNumber && (
                    <p className="text-sm text-slate-500">No contact information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Order history */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Order History</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {customerDetails.tasks && customerDetails.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {(customerDetails.tasks as unknown as Task[]).map((task) => (
                        <div key={task.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{task.title}</div>
                              {task.description && (
                                <div className="text-xs text-slate-500">{task.description}</div>
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
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                            <div className="font-medium">₱{task.totalPrice?.toFixed(2) || "0.00"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <ClipboardList className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">No order history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" className="flex items-center" onClick={() => setLoyaltyOpen(true)}>
                <Award className="h-4 w-4 mr-2" />
                Loyalty Program
              </Button>

              <Button variant="outline" className="flex items-center" onClick={() => onEdit()}>
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
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>

      {customerDetails && (
        <CustomerLoyalty
          open={loyaltyOpen}
          onOpenChange={setLoyaltyOpen}
          customer={customerDetails}
          onPointsUpdated={handleLoyaltyUpdated}
        />
      )}
    </Dialog>
  );
}
