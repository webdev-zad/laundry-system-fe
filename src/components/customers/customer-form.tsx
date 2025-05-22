"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { createCustomer, updateCustomer } from "@/services/customerService";

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  roomNumber: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialCustomer?: Customer | null;
  isEditing?: boolean;
  onSubmit?: (customer: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({
  open,
  onOpenChange,
  initialCustomer,
  isEditing = false,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialCustomer?.name || "",
      email: initialCustomer?.email || "",
      phone: initialCustomer?.phone || "",
      roomNumber: initialCustomer?.roomNumber || "",
    },
  });

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      let customer: Customer;

      if (isEditing && initialCustomer) {
        // Update existing customer
        customer = await updateCustomer(initialCustomer.id, values);
      } else {
        // Create new customer
        customer = await createCustomer(values);
      }

      // Close the form and notify parent
      onOpenChange?.(false);
      if (onSubmit) {
        onSubmit(customer);
      }

      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Failed to save customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Customer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email address (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Phone number (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roomNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number</FormLabel>
              <FormControl>
                <Input placeholder="Room number (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );

  // If used as a dialog
  if (typeof open !== "undefined" && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update customer information below."
                : "Fill in the details to add a new customer."}
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  // If used as a regular form
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Customer" : "Add New Customer"}</h2>
      {formContent}
    </div>
  );
}
