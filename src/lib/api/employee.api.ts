import { apiClient } from "./client";
import type { Employee, Task, Activity, PageResult } from "@/types";
import type { EmployeeInput } from "@/schemas";

export interface EmployeeDetailResponse {
  employee: Employee;
  tasks: Task[];
  activity: Activity[];
}

export const employeeApi = {
  list: async (queryString = ""): Promise<PageResult<Employee>> => {
    const url = queryString ? `/employees?${queryString}` : "/employees";
    const res = await apiClient.get<PageResult<Employee>>(url);
    return res.data;
  },

  detail: async (id: string): Promise<EmployeeDetailResponse> => {
    const res = await apiClient.get<EmployeeDetailResponse>(`/employees/${id}`);
    return res.data;
  },

  create: async (data: EmployeeInput): Promise<Employee> => {
    const res = await apiClient.post<Employee>("/employees", data);
    return res.data;
  },

  update: async (id: string, data: EmployeeInput): Promise<Employee> => {
    const res = await apiClient.patch<Employee>(`/employees/${id}`, data);
    return res.data;
  },

  save: async (data: EmployeeInput, id?: string): Promise<Employee> => {
    return id ? employeeApi.update(id, data) : employeeApi.create(data);
  },
};

// Alias for backward compatibility
export const usersApi = employeeApi;
