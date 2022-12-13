import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Popover, Upload, Col, Row, Modal, Input, Form, Button } from "antd";
import useCurrentUser from "../hooks/useCurrentUser";

const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>Upload</div>
  </div>
);

interface Props {
  open: boolean;
  onClose: () => void;
}

export const EditUserPopover = ({ open, onClose }: Props) => {
  const { userInfo } = useCurrentUser();

  const initialValues = {
    name: userInfo?.name || "",
    phone: userInfo?.phone || "",
    avatar: userInfo?.avatar || "",
  };

  return (
    <Form
      id="updateUserForm"
      onFinish={(value) => console.log(value)}
      initialValues={initialValues}
    >
      <Modal
        open={open}
        onCancel={onClose}
        footer={
          <>
            <Button type="default" onClick={onClose}>
              Close
            </Button>
            <Button
              type="primary"
              form="updateUserForm"
              key="submit"
              htmlType="submit"
            >
              Save
            </Button>
          </>
        }
      >
        <Row>
          <Col span={24} className="text-center">
            <Upload name="avatar" listType="picture-card">
              {uploadButton}
            </Upload>
          </Col>
          <Col span={24} className="text-center">
            <Form.Item label="Username" name="name">
              <Input placeholder="Username" />
            </Form.Item>
          </Col>
          <Col span={24} className="text-center">
            <Form.Item label="Phone" name="phone">
              <Input placeholder="Phone" />
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    </Form>
  );
};
