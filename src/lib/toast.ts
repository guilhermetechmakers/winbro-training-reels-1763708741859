import { toast } from "sonner";

/**
 * Toast utility functions for consistent notifications
 * Uses Sonner for toast notifications
 */

export const showToast = {
  /**
   * Show success toast
   */
  success: (message: string, description?: string) => {
    return toast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, description?: string) => {
    return toast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, description?: string) => {
    return toast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, description?: string) => {
    return toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show loading toast (returns a toast ID for dismissal)
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Dismiss a toast by ID
   */
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  /**
   * Show promise toast (for async operations)
   */
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
  },
};
