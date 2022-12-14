import { Button, Form, Input, message } from "antd";
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
      className="min-h-screen bg-gray-50 flex flex-col justify-center"
    >
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex flex-wrap justify-center">
            <img
              src="/logo.png"
              className="p-1 bg-white border rounded max-w-sm"
            />
          </div>
        </div>
        <div className="max-w-md w-full mx-auto mt-4 bg-white p-8 border border-gray-300">
          <div>
            <label htmlFor="" className="text-sm font-bold text-gray-600 block">
              Email
            </label>
            <Form.Item name="email">
              <Input
                type="text"
                name="email"
                className="w-full p-2 border border-blue-300 rounded mt-"
                required
              />
            </Form.Item>
          </div>
          <div>
            <label htmlFor="" className="text-sm font-bold text-gray-600 block">
              Password
            </label>
            <Form.Item name="password">
              <Input.Password
                type="password"
                name="password"
                className="w-full p-2 border border-blue-300 rounded mt-1"
                required
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                Login
              </Button>
            </Form.Item>
          </div>
          <div>
            <Form.Item>
              <Button
                type="primary"
                onClick={() => navigate("/signup")}
                className="bg-green-500 w-full"
              >
                Register
              </Button>
            </Form.Item>
          </div>
          {/* </Form> */}
        </div>
      </div>
    </Form>
  );
};
