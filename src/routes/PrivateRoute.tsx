import { ProtectedLayout } from "../components/ProtectedLayout";
import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardOutlined } from "@ant-design/icons";
import { ChatMessage } from "../pages/ChatMessage";

export interface Route {
  path: string;
  label: string;
  element: React.ReactNode;
  icon?: React.ReactNode;
  hidden?: boolean;
  key: string;
}

const routes: Route[] = [
  {
    path: "/",
    label: "Dashboard",
    element: <div />,
    icon: <DashboardOutlined />,
  },
  {
    path: "message/:id",
    label: "Message",
    element: <ChatMessage />,
  },
].map((route, index) => ({ ...route, key: String(index) }));

export const PrivateRoute = () => {
  return (
    <ProtectedLayout routes={routes.filter((item) => !item.hidden)}>
      <Routes>
        {routes.map((route) => {
          return (
            <Route key={route.path} path={route.path} element={route.element} />
          );
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProtectedLayout>
  );
};
