"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content className="dialog-content" asChild>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
          >
            <div className="dialog-header">
              <div>
                <DialogPrimitive.Title className="text-xl font-semibold">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="muted mt-1 text-sm">
                  {description}
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                className="button button-ghost button-icon"
                aria-label="Close dialog"
              >
                <X size={18} />
              </DialogPrimitive.Close>
            </div>
            {children}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
