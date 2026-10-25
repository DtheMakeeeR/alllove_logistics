import React from "react";
import { Refine, Authenticated } from "@refinedev/core";
import { ThemedLayout } from "@refinedev/antd";
import { RefineKbarProvider } from "@refinedev/kbar";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
} from "@refinedev/react-router";
// Use BrowserRouter instead of createBrowserRouter/RouterProvider
import { BrowserRouter, Outlet, Routes, Route } from "react-router";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";

import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { Login } from "./pages/Login";
import { UsersList } from "./pages/UsersList";
import { UserCreate } from "./pages/UserCreate";

import "@refinedev/antd/dist/reset.css";

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={ruRU}>
        <RefineKbarProvider>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            routerProvider={routerProvider}
            resources={[{ name: "users", list: "/users", create: "/users/create" }]}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="auth" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayout>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="users" />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/create" element={<UserCreate />} />
              </Route>
              <Route
                element={
                  <Authenticated key="noauth" fallback={<Outlet />}>
                    <NavigateToResource resource="users" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>
          </Refine>
        </RefineKbarProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}