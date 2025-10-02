import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext({ notify: () => {} });

export const ToastProvider = ({ children }) => {
  const notify = useCallback((message, type = 'info', options = {}) => {
    const defaultOptions = {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      rtl: false,
      theme: 'colored',
      ...options
    };

    switch (type) {
      case 'success':
        return toast.success(message, defaultOptions);
      case 'error':
        return toast.error(message, defaultOptions);
      case 'warning':
      case 'warn':
        return toast.warning(message, defaultOptions);
      case 'info':
        return toast.info(message, defaultOptions);
      default:
        return toast(message, defaultOptions);
    }
  }, []);

  // Get theme from document or localStorage
  const getTheme = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  };

  const theme = getTheme();

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <ToastContainer 
        theme={theme}
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: '500'
        }}
        progressStyle={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);