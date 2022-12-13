import { Layout } from "antd";
import { Route } from "../routes/PrivateRoute";
import { ChatSidebar } from "./ChatSidebar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  routes: Route[];
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <Layout className="min-h-screen">
      <ChatSidebar />
      <Layout className="ml-300px min-h-screen overflow-auto">
        <Layout.Content>{children}</Layout.Content>
      </Layout>
    </Layout>
  );
};
