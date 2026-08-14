const API_BASE_URL = "https://foodfusion-backend-c20i.onrender.com/api";

const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error.message);
    return {
      ok: false,
      status: 0,
      error: "Backend server is offline or unreachable at https://foodfusion-backend-c20i.onrender.com. Please ensure the backend server is running.",
    };
  }
};

// food api
export const getFoods = async () => {
  const result = await safeFetch(`${API_BASE_URL}/foods`);
  if (!result.ok) {
    throw new Error(result.data?.message || result.error || "Failed to fetch food catalog");
  }
  return result.data.foods || [];
};

// auth api
export const loginUser = async (credentials) => {
  const result = await safeFetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Login failed. Please check your credentials.");
  }

  return result.data;
};

export const registerUser = async (userData) => {
  const result = await safeFetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Registration failed. Please check inputs.");
  }

  return result.data;
};

// order api
export const createOrder = async (orderData) => {
  const result = await safeFetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to place order.");
  }

  return result.data;
};

export const getAllOrders = async () => {
  const result = await safeFetch(`${API_BASE_URL}/orders`);
  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to fetch orders from server");
  }
  return result.data.orders || [];
};

export const updateOrderStatus = async (orderId, status) => {
  const result = await safeFetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to update order status");
  }

  return result.data;
};

export const deleteOrder = async (orderId) => {
  const result = await safeFetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
    method: "DELETE",
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to delete order record from database");
  }

  return result.data;
};

// admin portal api (users & orders)
export const getAdminDashboardData = async () => {
  const result = await safeFetch(`${API_BASE_URL}/admin/dashboard`);
  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Unable to load admin portal database records");
  }
  return result.data;
};

export const verifyAdminPasscode = async (passcode) => {
  const result = await safeFetch(`${API_BASE_URL}/admin/verify-passcode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode }),
  });

  if (!result.ok) {
    return {
      success: false,
      message: result.data?.message || result.error || "Passcode verification failed",
    };
  }

  return result.data;
};

export const getAllUsers = async () => {
  const result = await safeFetch(`${API_BASE_URL}/users`);
  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to fetch user database records");
  }
  return result.data.users || [];
};

export const deleteUser = async (userId) => {
  const result = await safeFetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to delete user record from database");
  }

  return result.data;
};

// health check
export const checkBackend = async () => {
  const result = await safeFetch("https://foodfusion-backend-c20i.onrender.com/");
  return result.ok ? result.data : { success: false, message: result.error };
};
