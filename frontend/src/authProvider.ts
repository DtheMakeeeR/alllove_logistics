import type { AuthProvider } from "@refinedev/core";
import { axiosInstance } from "./dataProvider";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      // Бэк ждёт form-data (OAuth2PasswordRequestForm), а не JSON
      const { data } = await axiosInstance.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", data.access_token);

      // Проверим роль — в админку пускаем только admin
      const me = await axiosInstance.get("/auth/me");
      localStorage.setItem("role", me.data.role);
      localStorage.setItem("full_name", me.data.full_name);

      if (me.data.role !== "admin") {
        localStorage.clear();
        return {
          success: false,
          error: {
            name: "Доступ запрещён",
            message: "Только администратор может войти в панель",
          },
        };
      }

      return { success: true, redirectTo: "/users" };
    } catch (e: any) {
      const message = e.response?.data?.detail || "Неверный email или пароль";
      return { success: false, error: { name: "Ошибка входа", message } };
    }
  },

  logout: async () => {
    localStorage.clear();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { authenticated: false, redirectTo: "/login" };
    }
    try {
      await axiosInstance.get("/auth/me");
      return { authenticated: true };
    } catch {
      localStorage.clear();
      return { authenticated: false, redirectTo: "/login" };
    }
  },

  getPermissions: async () => localStorage.getItem("role"),

  getIdentity: async () => ({
    id: 1,
    name: localStorage.getItem("full_name") || "Администратор",
    avatar: "https://i.pravatar.cc/150?img=12",
  }),

  onError: async (error) => {
    if (error?.response?.status === 401) {
      return { logout: true, redirectTo: "/login" };
    }
    return { error };
  },
};