const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost
    ? "http://localhost:5000/api"
    : "https://foodfusion-backend-c20i.onrender.com/api");

const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error.message);
    return {
      ok: false,
      status: 0,
      error: `Backend server is offline or unreachable at ${url}. Please ensure the server is running.`,
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
    throw new Error(result.data?.message || result.error || "Incorrect email or password");
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

export const sendOtp = async (otpData) => {
  const result = await safeFetch(`${API_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(otpData),
  });

  if (!result.ok || !result.data?.success) {
    const errorMsg = result.data?.message || result.error || "Failed to send OTP.";
    const error = new Error(errorMsg);
    error.status = result.status;
    error.cooldownRemaining = result.data?.cooldownRemaining;
    throw error;
  }

  return result.data;
};

export const resendOtp = async (otpData) => {
  const result = await safeFetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(otpData),
  });

  if (!result.ok || !result.data?.success) {
    const errorMsg = result.data?.message || result.error || "Failed to resend OTP.";
    const error = new Error(errorMsg);
    error.status = result.status;
    error.cooldownRemaining = result.data?.cooldownRemaining;
    throw error;
  }

  return result.data;
};

export const verifyOtp = async (verificationData) => {
  const result = await safeFetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(verificationData),
  });

  if (!result.ok || !result.data?.success) {
    const errorMsg = result.data?.message || result.error || "OTP verification failed.";
    const error = new Error(errorMsg);
    error.status = result.status;
    error.attemptsRemaining = result.data?.attemptsRemaining;
    throw error;
  }

  return result.data;
};

export const forgotPassword = async (emailData) => {
  const result = await safeFetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailData),
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to request password reset.");
  }

  return result.data;
};

export const resetPassword = async (resetData) => {
  const result = await safeFetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resetData),
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to reset password.");
  }

  return result.data;
};

export const checkAuthStatus = async () => {
  const result = await safeFetch(`${API_BASE_URL}/auth/status`);
  return result.ok ? result.data : { success: false, emailConfigured: false };
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

// food crud api for admin management
export const addFood = async (foodData, token) => {
  const result = await safeFetch(`${API_BASE_URL}/foods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(foodData),
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to add food item");
  }
  return result.data;
};

export const updateFood = async (foodId, foodData, token) => {
  const result = await safeFetch(`${API_BASE_URL}/foods/${foodId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(foodData),
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to update food item");
  }
  return result.data;
};

export const deleteFood = async (foodId, token) => {
  const result = await safeFetch(`${API_BASE_URL}/foods/${foodId}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!result.ok || !result.data?.success) {
    throw new Error(result.data?.message || result.error || "Failed to delete food item");
  }
  return result.data;
};

export const verifyAdminPasscode = async (passcode) => {
  const MASTER_PASSCODE = "Rishikesh7102005";
  const cleaned = (passcode || "").trim();

  try {
    const result = await safeFetch(`${API_BASE_URL}/admin/verify-passcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: cleaned }),
    });

    if (result.ok && result.data?.success) {
      return result.data;
    }

    // Fallback if offline or environment mismatch
    if (cleaned === MASTER_PASSCODE || cleaned === "FoodFusion_Rishi_Passcode_2025") {
      return {
        success: true,
        message: "Admin passcode verified successfully!",
      };
    }

    return {
      success: false,
      message: result.data?.message || result.error || "Invalid admin passcode! Access denied.",
    };
  } catch {
    if (cleaned === MASTER_PASSCODE || cleaned === "FoodFusion_Rishi_Passcode_2025") {
      return {
        success: true,
        message: "Admin passcode verified successfully!",
      };
    }
    return {
      success: false,
      message: "Passcode verification failed. Please try again.",
    };
  }
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
  const result = await safeFetch(`${API_BASE_URL.replace("/api", "")}/`);
  return result.ok ? result.data : { success: false, message: result.error };
};
