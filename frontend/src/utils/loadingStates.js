/**
 * Loading state management utilities
 */

export const createLoadingState = () => {
  return {
    loading: false,
    error: null,
    data: null,
  };
};

export const setLoading = (setState) => {
  setState((prev) => ({ ...prev, loading: true, error: null }));
};

export const setSuccess = (setState, data) => {
  setState({ loading: false, error: null, data });
};

export const setError = (setState, error) => {
  setState((prev) => ({ 
    ...prev, 
    loading: false, 
    error: error.message || "An error occurred",
    data: null 
  }));
};

export const withLoading = async (setState, asyncFunction) => {
  setLoading(setState);
  try {
    const result = await asyncFunction();
    setSuccess(setState, result);
    return result;
  } catch (error) {
    setError(setState, error);
    throw error;
  }
};

