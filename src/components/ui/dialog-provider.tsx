"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
};

type PromptOptions = {
  title: string;
  description?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
};

type DialogContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

export function useDialogs() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogs must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = React.useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({ isOpen: false, options: null, resolve: null });

  const [promptState, setPromptState] = React.useState<{
    isOpen: boolean;
    options: PromptOptions | null;
    resolve: ((value: string | null) => void) | null;
    value: string;
  }>({ isOpen: false, options: null, resolve: null, value: "" });

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ isOpen: true, options, resolve });
    });
  }, []);

  const prompt = React.useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setPromptState({ 
        isOpen: true, 
        options, 
        resolve, 
        value: options.defaultValue || "" 
      });
    });
  }, []);

  const handleConfirmClose = (value: boolean) => {
    setConfirmState((prev) => {
      if (prev.resolve) prev.resolve(value);
      return { ...prev, isOpen: false };
    });
  };

  const handlePromptClose = (submit: boolean) => {
    setPromptState((prev) => {
      if (prev.resolve) prev.resolve(submit ? prev.value : null);
      return { ...prev, isOpen: false };
    });
  };

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      
      {/* Confirm Dialog */}
      <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => {
         if (!open) handleConfirmClose(false);
      }}>
        <AlertDialogContent className="bg-white dark:bg-[#151518] border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-white">{confirmState.options?.title || "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">{confirmState.options?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-0 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-300">
              {confirmState.options?.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmClose(true)} className="bg-red-600 hover:bg-red-700 text-white">
              {confirmState.options?.confirmText || "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Prompt Dialog */}
      <Dialog open={promptState.isOpen} onOpenChange={(open) => {
         if (!open) handlePromptClose(false);
      }}>
        <DialogContent className="bg-white dark:bg-[#151518] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">{promptState.options?.title}</DialogTitle>
            {promptState.options?.description && (
              <DialogDescription className="text-zinc-500">{promptState.options.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4 flex flex-col gap-2">
            <Input
              value={promptState.value}
              onChange={(e) => setPromptState(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                   e.preventDefault();
                   handlePromptClose(true);
                }
              }}
              autoFocus
              className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-[#C8A856] text-zinc-900 dark:text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handlePromptClose(false)} className="border-0 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-300">
              {promptState.options?.cancelText || "Cancel"}
            </Button>
            <Button onClick={() => handlePromptClose(true)} className="bg-[#C8A856] hover:bg-[#b09348] text-black font-bold">
              {promptState.options?.confirmText || "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DialogContext.Provider>
  );
}
