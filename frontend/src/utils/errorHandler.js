/**
 * Centralized error handling utility
 */

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error || "An error occurred";

    switch (status) {
      case 400:
        return { type: "error", message: `Bad Request: ${message}` };
      case 401:
        return { type: "error", message: "Unauthorized. Please login again." };
      case 403:
        return { type: "error", message: "Access denied. You don't have permission." };
      case 404:
        return { type: "error", message: "Resource not found." };
      case 500:
        return { type: "error", message: "Server error. Please try again later." };
      default:
        return { type: "error", message: message };
    }
  } else if (error.request) {
    // Request made but no response received
    return { type: "error", message: "Network error. Please check your connection." };
  } else {
    // Something else happened
    return { type: "error", message: error.message || "An unexpected error occurred." };
  }
};

export const showError = (error, setMessage) => {
  const errorInfo = handleApiError(error);
  setMessage(errorInfo);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    setMessage({ type: "", text: "" });
  }, 5000);
};

export const showSuccess = (message, setMessage) => {
  setMessage({ type: "success", text: message });
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    setMessage({ type: "", text: "" });
  }, 3000);
};

