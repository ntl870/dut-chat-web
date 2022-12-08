import { Button, Form, Input, Row, Col, message } from "antd";
import { useState } from "react";
import { login } from "../api/auth";
import { useRouter } from "../hooks/useRouter";
import { setStorage } from "../utils";

interface LoginForm {
  email: string;
  password: string;
}
export const Login = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const { data } = await login(values);
      setStorage("token", data.token);
      navigate("/", { replace: true });
      message.success("Login Successful");
    } catch (e) {
      message.error("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
      style={{ marginTop: "4rem" }}
    >
      <Row justify="center" align="middle">
        <Col span={14}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input size="large" />
          </Form.Item>
        </Col>
        <Col span={14}>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password size="large" />
          </Form.Item>
        </Col>
        <Col span={14}>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
