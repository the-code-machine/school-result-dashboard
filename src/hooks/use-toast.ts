"use client";
import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

type ToastInput = Pick<ToastProps, "variant"> & {
  title?: string;
  description?: string;
  duration?: number;
};

type ToastState = ToastInput & { id: string; open: boolean };

type Action =
  | { type: "ADD"; toast: ToastState }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE"; id: string; toast: Partial<ToastState> };

const TOAST_LIMIT = 3;

function reducer(state: ToastState[], action: Action): ToastState[] {
  switch (action.type) {
    case "ADD":
      return [action.toast, ...state].slice(0, TOAST_LIMIT);
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    case "UPDATE":
      return state.map((t) =>
        t.id === action.id ? { ...t, ...action.toast } : t,
      );
    default:
      return state;
  }
}

const listeners: Array<(state: ToastState[]) => void> = [];
let memoryState: ToastState[] = [];

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

export function toast(input: ToastInput) {
  const id = genId();
  const duration = input.duration ?? 3000;

  dispatch({ type: "ADD", toast: { ...input, id, open: true } });

  if (duration > 0) {
    setTimeout(() => {
      dispatch({ type: "REMOVE", id });
    }, duration);
  }
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<ToastState[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    toasts: state,
    toast,
    dismiss: (id: string) => dispatch({ type: "REMOVE", id }),
  };
}
