import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext({ notify: () => {} });

export const ToastProvider = ({ children }) => {
  const notify = useCallback((message, type = 'info', options = {}) => {
    const opts = { position: 'bottom-right', autoClose: 3000, ...options };
    if (type === 'success') return toast.success(message, opts);
    if (type === 'error') return toast.error(message, opts);
    if (type === 'warn' || type === 'warning') return toast.warn(message, opts);
    return toast(message, opts);
  }, []);

  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <ToastContainer theme={theme} newestOnTop closeOnClick pauseOnHover draggable={false} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);