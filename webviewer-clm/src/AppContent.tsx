import { Authenticated } from "@refinedev/core";

import {
  AuthPage,
  ErrorComponent,
  ThemedLayout,
  ThemedSider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { Route, Routes, Outlet } from "react-router";
import {
  NavigateToResource,
  CatchAllNavigate,
} from "@refinedev/react-router";
import { TemplateList, TemplateCreate, TemplateEdit } from "./pages/templates";
import { Header } from "./components/header";
import { UserList } from "./pages/users/list";
import { UserEdit } from "./pages/users/edit";
import { AgreementList, AgreementCreate, AgreementShow } from "./pages/agreements";
import { AgreementSign } from "./pages/agreements/sign";

const AppContent = () => {
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
        <Route index element={<NavigateToResource resource="agreements" />} />
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
          <Route path="sign/:id" element={<AgreementSign />} />
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

export default AppContent;
