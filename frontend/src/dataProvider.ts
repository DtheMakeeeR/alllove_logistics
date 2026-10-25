import axios from "axios";
import type { DataProvider } from "@refinedev/core";

const API_URL = "http://127.0.0.1:8000";

const axiosInstance = axios.create({ baseURL: API_URL });

// Подставляем JWT-токен в каждый запрос, если он есть
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dataProvider: DataProvider = {
  getList: async ({ resource }) => {
    const { data } = await axiosInstance.get(`/${resource}`);
    return { data, total: data.length };
  },
  getOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.get(`/${resource}/${id}`);
    return { data };
  },
  create: async ({ resource, variables }) => {
    const { data } = await axiosInstance.post(`/${resource}`, variables);
    return { data };
  },
  update: async ({ resource, id, variables }) => {
    const { data } = await axiosInstance.patch(`/${resource}/${id}`, variables);
    return { data };
  },
  deleteOne: async ({ resource, id }) => {
    await axiosInstance.delete(`/${resource}/${id}`);
    return { data: { id } };
  },
  getApiUrl: () => API_URL,
};

export { axiosInstance };