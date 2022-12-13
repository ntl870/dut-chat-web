import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Upload, Col, Row, Modal, Input, Form, Button, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "../api/user";
import { RcFile } from "antd/es/upload";
import { getDownloadURL } from "firebase/storage";
import { useState } from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import { uploadFile } from "../utils/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
}

const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

export const EditUserPopover = ({ open, onClose }: Props) => {
  const { userInfo, refetchUser } = useCurrentUser();
  const [imageLoading, setImageLoading] = useState(false);
  const [form] = Form.useForm();
  const updateUserMutation = useMutation({
    mutationKey: ["updateUser"],
    mutationFn: updateUser,
    onSuccess: () => {
      onClose();
      refetchUser();
      message.success("User updated successfully");
    },
  });
  const initialValues = {
    name: userInfo?.name || "",
    phone: userInfo?.phone || "",
    avatar: userInfo?.avatar || "",
  };

  const uploadButton = (
    <div>
      {!imageLoading ? <PlusOutlined /> : <LoadingOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Form
      form={form}
      id="updateUserForm"
      onFinish={(value) => {
        console.log(value);
        try {
          updateUserMutation.mutate({ ...value, email: userInfo?.email });
        } catch (e) {
          message.error((e as Error).message);
        }
      }}
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
              loading={updateUserMutation.isLoading}
              disabled={imageLoading}
            >
              Save
            </Button>
          </>
        }
      >
        <Row>
          <Col span={24} className="text-center">
            <Form.Item name="avatar">
              <Upload
                listType="picture-card"
                onPreview={(e) => {
                  console.log(e);
                }}
                beforeUpload={beforeUpload}
                showUploadList={false}
                onChange={(e) => {
                  setImageLoading(true);
                  const uploadTask = uploadFile(
                    e.fileList[0]?.originFileObj,
                    `avatar/${e.fileList[0].name}`
                  );
                  uploadTask.on(
                    "state_changed",
                    null,
                    (error) => {
                      alert(error);
                    },
                    () => {
                      getDownloadURL(uploadTask.snapshot.ref).then(
                        (downloadURL) => {
                          setImageLoading(false);
                          form.setFieldValue("avatar", downloadURL);
                        }
                      );
                    }
                  );
                }}
              >
                {form.getFieldValue("avatar") ? (
                  <img
                    src={form.getFieldValue("avatar")}
                    alt="avatar"
                    style={{ width: "100%" }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
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
