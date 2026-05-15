import {
  Refine,
  Authenticated,
} from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  AuthPage,
  ErrorComponent,
  useNotificationProvider,
  ThemedLayout,
  ThemedSider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { TemplateList, TemplateCreate, TemplateEdit } from "./pages/templates";
import { supabaseClient } from "./utility";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import authProvider from "./authProvider";
import {
  ContainerOutlined,
  FileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { UserList } from "./pages/users/list";
import { UserEdit } from "./pages/users/edit";
import { AgreementCreate, AgreementList, AgreementShow } from "./pages/agreements";
import AccessControlProvider from "./AccessControlProvider";
import { AgreementSign } from "./pages/agreements/sign";

function App() {
  const resources = [
    {
      name: "templates",
      list: "/templates",
      edit: "/templates/edit/:id",
      create: "/templates/create",
      meta: {
        canDelete: true,
        icon: <FileOutlined />,
      },
    },
    {
      name: "users",
      list: "/users",
      edit: "/users/edit/:id",
      meta: {
        canDelete: true,
        icon: <UserOutlined />,
      },
    },
    {
      name: "agreements",
      list: "/agreements",
      create: "/agreements/create",
      show: "/agreements/show/:id",
      sign: "/agreements/sign/:id",
      meta: {
        icon: <ContainerOutlined />,
      },
    },
  ];

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider(supabaseClient)}
                liveProvider={liveProvider(supabaseClient)}
                authProvider={authProvider}
                routerProvider={routerProvider}
                notificationProvider={useNotificationProvider}
                accessControlProvider={AccessControlProvider}
                resources={resources}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "8c9e3i-8i0lWl-XgrDTD",
                  title: { text: "", icon: <></> },
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayout
                          Header={Header}
                          Sider={(props) => <ThemedSider {...props} fixed />}>
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="agreements" />}
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
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
