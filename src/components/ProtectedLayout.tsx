import { LogoutOutlined } from "@ant-design/icons";
import { Layout, Menu, Button, MenuProps } from "antd";
import { useState } from "react";
import { Route } from "../routes/PrivateRoute";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "../hooks/useRouter";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  routes: Route[];
}

export const ProtectedLayout = ({ children, routes }: ProtectedLayoutProps) => {
  const { navigate, pathname } = useRouter();
  const { logout } = useAuth();
  const initRouteKey =
    routes?.find((route) => route?.path?.includes(pathname))?.key || "0";
  const [collapsed, setCollapsed] = useState(false);
  const [currentKey, setCurrentKey] = useState(initRouteKey);

  const onNavigate: MenuProps["onClick"] = (e) => {
    setCurrentKey(e.key);
    navigate(routes[Number(e.key)].path);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        collapsible
        breakpoint="lg"
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="logo" />
        <Menu
          theme="dark"
          defaultSelectedKeys={[currentKey]}
          mode="inline"
          items={routes}
          onClick={onNavigate}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Content>{children}</Layout.Content>
        <Layout.Footer style={{ textAlign: "end" }}>
          <Button
            icon={<LogoutOutlined />}
            type="primary"
            danger
            onClick={logout}
          />
        </Layout.Footer>
      </Layout>
    </Layout>
  );
};
