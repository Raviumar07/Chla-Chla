declare module 'react-hot-toast' {
  import React from 'react';

  type ToastOptions = {
    id?: string;
    duration?: number;
    style?: React.CSSProperties;
    className?: string;
    icon?: React.ReactNode;
    iconTheme?: { primary: string; secondary: string };
    ariaProps?: React.AriaAttributes;
  };

  type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

  type ToasterProps = {
    position?: ToastPosition;
    toastOptions?: ToastOptions;
  };

  type Toast = {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    loading: (message: string, options?: ToastOptions) => void;
    promise: <T>(
      p: Promise<T>,
      options: { loading: string; success: string; error: string }
    ) => Promise<T>;
    dismiss: (id?: string) => void;
    remove: (id?: string) => void;
  };

  const toast: Toast;
  const Toaster: React.FC<ToasterProps>;
  export { toast, Toaster };
  export default toast;
}
