import { UploadOutlined } from "@ant-design/icons";
import {
  Upload,
  Col,
  Row,
  Modal,
  Input,
  Form,
  Button,
  message,
  Image,
} from "antd";
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
    avatar: null,
    url: userInfo?.avatar || "",
  };

  return (
    <Form
      form={form}
      id="updateUserForm"
      onFinish={(value) => {
        setImageLoading(true);
        const uploadTask = uploadFile(
          value.avatar.fileList[0]?.originFileObj,
          `avatar/${value.avatar.fileList[0].name}`
        );
        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            alert(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setImageLoading(false);
              try {
                updateUserMutation.mutate({
                  ...value,
                  email: userInfo?.email,
                  avatar: downloadURL,
                });
              } catch (e) {
                message.error((e as Error).message);
              }
            });
          }
        );
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
            <Form.Item name="avatar" className="flex flex-col">
              <div className="flex flex-col">
                <div>
                  <Image src={form.getFieldValue("url")} width={200} />
                </div>
                <Upload
                  multiple={false}
                  beforeUpload={beforeUpload}
                  fileList={[]}
                  className="h-16"
                  onChange={(e) => {
                    const fr = new FileReader();
                    form.setFieldValue("avatar", e);
                    fr.readAsDataURL(e.file.originFileObj as Blob);
                    fr.onload = () => {
                      form.setFieldsValue({
                        url: fr.result,
                      });
                    };
                  }}
                >
                  <Button type="dashed" className="mt-3">
                    <UploadOutlined /> Upload
                  </Button>
                </Upload>
              </div>
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
