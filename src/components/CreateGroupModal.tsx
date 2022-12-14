import { Form, Input, Modal, Row, Col, Button, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import { createGroup } from "../api/group";

interface Props {
  open: boolean;
  onClose: () => void;
  refetchGroups: () => void;
}

export const CreateGroupModal = ({ open, onClose, refetchGroups }: Props) => {
  const createGroupMutation = useMutation({
    mutationKey: ["createGroup"],
    mutationFn: createGroup,
    onSuccess: () => {
      onClose();
      // refetchGroups();
      message.success("Group created successfully");
    },
  });
  return (
    <Form
      id="createGroupForm"
      initialValues={{
        name: "",
        description: "",
      }}
      onFinish={(value) => {
        try {
          createGroupMutation.mutate(value);
        } catch (error) {
          message.error((error as Error).message);
        }
      }}
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
              form="createGroupForm"
              key="submit"
              htmlType="submit"
              loading={createGroupMutation.isLoading}
            >
              Save
            </Button>
          </>
        }
      >
        <Row className="mt-6">
          <Col span={24}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Description" name="description">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    </Form>
  );
};
