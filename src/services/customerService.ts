import api from "./api";
import { Customer } from "../types/customer";

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get("/customers");
  return response.data;
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const response = await api.post("/customers", customerData);
  return response.data;
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};
