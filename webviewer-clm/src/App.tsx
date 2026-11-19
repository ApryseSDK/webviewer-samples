import {
  Refine,
} from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter } from "react-router";
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { supabaseClient } from "./utility";
import { ColorModeContextProvider } from "./contexts/color-mode";
import authProvider from "./authProvider";
import {
  ContainerOutlined,
  FileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AppContent from "./AppContent";
import AccessControlProvider from "./AccessControlProvider";

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
                <AppContent />
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
