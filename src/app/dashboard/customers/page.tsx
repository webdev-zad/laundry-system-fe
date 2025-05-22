"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { CustomerForm } from "@/components/customers/customer-form";
import { getCustomers, deleteCustomer } from "@/services/customerService";
import { Customer } from "@/types/customer";
import { CustomerList } from "@/components/customers/customer-list";
import { CustomerProfile } from "@/components/customers/customer-profile";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"list" | "detail" | "form">("list");

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveView("detail");
    setEditMode(false);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setActiveView("form");
    setEditMode(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveView("form");
    setEditMode(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      await deleteCustomer(customerId);
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
        setActiveView("list");
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
      alert("Failed to delete customer. Please try again.");
    }
  };

  const handleCustomerFormSubmit = async (customer: Customer) => {
    if (editMode) {
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    } else {
      setCustomers((prev) => [...prev, customer]);
    }
    setSelectedCustomer(customer);
    setActiveView("detail");
  };

  const handleBackToList = () => {
    setActiveView("list");
    setSelectedCustomer(null);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-4">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchCustomers} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex gap-2">
          {activeView !== "list" && (
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          )}
          <Button onClick={handleAddCustomer}>
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>

      {activeView === "list" && (
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <CustomerList
            customers={customers}
            searchQuery={searchQuery}
            loading={loading}
            error={error}
            onSelect={handleCustomerSelect}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onRefresh={fetchCustomers}
          />
        </div>
      )}

      {activeView === "detail" && selectedCustomer && (
        <CustomerProfile
          customer={selectedCustomer}
          onEdit={() => handleEditCustomer(selectedCustomer)}
          onDelete={handleDeleteCustomer}
        />
      )}

      {activeView === "form" && (
        <CustomerForm
          initialCustomer={selectedCustomer}
          isEditing={editMode}
          onSubmit={handleCustomerFormSubmit}
          onCancel={handleBackToList}
        />
      )}
    </div>
  );
}
