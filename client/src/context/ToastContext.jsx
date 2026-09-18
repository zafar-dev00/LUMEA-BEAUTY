import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-charcoal text-ivory px-5 py-3 text-sm shadow-xl"
        >
          <CheckCircle size={16} className="text-rose shrink-0" />
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components -- context + hook colocated by design
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
