import { Layout } from "antd";
import { ChatSidebar } from "./ChatSidebar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <Layout className="min-h-screen">
      <ChatSidebar />
      <Layout className="ml-300px">
        <Layout.Content>{children}</Layout.Content>
      </Layout>
    </Layout>
  );
};
