"use client";
import { create } from "zustand";
export const useUI = create<{
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
