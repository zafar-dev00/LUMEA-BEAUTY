import { apiRequest, setToken, clearToken } from "./api";

export const authService = {
  async register({ name, email, phone, password, confirmPassword }) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      auth: false,
      body: { name, email, phone, password, confirmPassword },
    });
    if (data.token) setToken(data.token);
    return data.user;
  },

  async login({ email, password }) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    if (data.token) setToken(data.token);
    return data.user;
  },

  async requestOtp(email) {
    return apiRequest("/auth/request-otp", {
      method: "POST",
      auth: false,
      body: { email },
    });
  },

  async verifyOtp({ email, otp }) {
    const data = await apiRequest("/auth/verify-otp", {
      method: "POST",
      auth: false,
      body: { email, otp },
    });
    if (data.token) setToken(data.token);
    return data.user;
  },

  async getMe() {
    const data = await apiRequest("/auth/me");
    return data.user;
  },

  async logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      clearToken();
    }
  },

  async updateProfile(updates) {
    const data = await apiRequest("/users/profile", { method: "PUT", body: updates });
    return data.user;
  },
};
