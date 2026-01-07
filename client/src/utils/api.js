import { API_BASE_URL } from '../constants/api.js';

export const makeRequest = async (endpoint, method = 'GET', data = null, useFormData = false, setApiResponse = null, setLoading = null) => {
  if (setLoading) setLoading(true);

  const token = localStorage.getItem("accessToken");
  const headers = {};

  if (!useFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = {
    method,
    headers,
    credentials: 'include',
    body: data ? (useFormData ? data : JSON.stringify(data)) : null
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Check if response is ok before parsing JSON
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      // If response is not JSON, create error response
      result = {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}`,
        statusCode: response.status
      };
    }

    if (setApiResponse) {
      setApiResponse({ 
        status: response.status, 
        success: response.ok, 
        ...result,
        endpoint,
        method
      });
    }
    
    // Store access token if present in response
    if (result?.data?.accessToken) {
      localStorage.setItem('accessToken', result.data.accessToken);
    }
    
    return result;
  } catch (error) {
    // Network error or fetch failed
    const errorMessage = error.message.includes('Failed to fetch') 
      ? 'Cannot connect to server. Please check if the backend is running on port 8000.'
      : error.message;
    
    if (setApiResponse) {
      setApiResponse({ 
        success: false, 
        message: errorMessage,
        status: 0,
        endpoint,
        method
      });
    }
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};