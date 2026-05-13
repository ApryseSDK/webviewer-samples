import {
  Authenticated,
  useMenu,
  useGetIdentity,
} from "@refinedev/core";

import {
  AuthPage,
  ErrorComponent,
  useNotificationProvider,
  ThemedLayout,
  ThemedSider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
} from "@refinedev/react-router";
import { TemplateList, TemplateCreate, TemplateEdit } from "./pages/templates";
import { Header } from "./components/header";
import {
  ContainerOutlined,
  FileFilled,
  FileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { UserCreate } from "./pages/users";
import { UserList } from "./pages/users/list";
import { UserEdit } from "./pages/users/edit";
import { useEffect } from "react";
import { AgreementList, AgreementCreate, AgreementShow } from "./pages/agreements";

const AppContent = () => {

  const { data: identity } = useGetIdentity<any>();

  useEffect(() => {
    console.log(identity);
  }, [identity]);


  const isAdmin = identity?.user_metadata?.role == "admin";

  useEffect(() => {
    console.log("Admin",isAdmin)
  },[isAdmin])

  return (
    <Routes>
      <Route
        element={
          <Authenticated
            key="authenticated-inner"
            fallback={<CatchAllNavigate to="/login" />}>
            <ThemedLayout
              Header={Header}
              Sider={(props) => <ThemedSider {...props} fixed />}>
              <Outlet />
            </ThemedLayout>
          </Authenticated>
        }>
            <Route
              index
              element={<NavigateToResource resource="templates" />}
            />
            <Route path="/templates">
              <Route index element={<TemplateList />} />
              <Route path="create" element={<TemplateCreate />} />
              <Route path="edit/:id" element={<TemplateEdit />} />
            </Route>
            <Route path="/users">
              <Route index element={<UserList />} />
              <Route path="edit/:id" element={<UserEdit />} />
            </Route>
            <Route path="/agreements">
              <Route index element={<AgreementList />} />
              <Route path="create" element={<AgreementCreate />} />
              <Route path="show/:id" element={<AgreementShow />} />
            </Route>
            <Route
              index
              element={<NavigateToResource resource="agreements" />}
            />
            <Route path="/agreements">
              <Route index element={<AgreementList />} />
              <Route path="create" element={<AgreementCreate />} />
              <Route path="show/:id" element={<AgreementShow />} />
            </Route>
        <Route path="*" element={<ErrorComponent />} />
      </Route>
      <Route
        element={
          <Authenticated
            key="authenticated-outer"
            fallback={<Outlet />}
          >
            <NavigateToResource />
          </Authenticated>
        }
      >
        <Route
          path="/login"
          element={
            <AuthPage
              type="login"
              formProps={{
                initialValues: {
                  email: "",
                  password: "",
                },
              }}
            />
          }
        />
        <Route
          path="/register"
          element={<AuthPage type="register" />}
        />
        <Route
          path="/forgot-password"
          element={<AuthPage type="forgotPassword" />}
        />
      </Route>
    </Routes>
  );
};  

export default AppContent