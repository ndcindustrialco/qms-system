"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error";

type Props = {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
};

export default function Toast({ type, message, onClose, duration = 4000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const alertClass = type === "success" ? "alert-success" : "alert-error";
  const icon =
    type === "success" ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );

  return createPortal(
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${alertClass} shadow-sm rounded-xl text-[14px]`}>
        {icon}
        <span className="text-[14px]">{message}</span>
        <button onClick={onClose} className="btn btn-ghost btn-xs">✕</button>
      </div>
    </div>,
    document.body,
  );
}
