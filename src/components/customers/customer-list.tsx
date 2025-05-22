"use client";

import { Pencil, Trash2, MoreHorizontal, Mail, Phone } from "lucide-react";
import { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CustomerListProps {
  customers: Customer[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
  onSelect: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onRefresh: () => void;
}

export function CustomerList({
  customers,
  searchQuery,
  onSelect,
  onEdit,
  onDelete,
  onRefresh,
}: CustomerListProps) {
  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Information</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <p className="text-slate-500">No customers found</p>
                  {searchQuery && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => onRefresh()}>
                      Clear search
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell onClick={() => onSelect(customer)}>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${customer.id}`} alt={customer.name} />
                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-slate-500">
                          Customer since{" "}
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onSelect(customer)}>
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onSelect(customer)}>
                    <Badge variant="outline">{customer._count?.tasks || 0} orders</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(customer)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(customer.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
