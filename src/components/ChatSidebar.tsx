import { Avatar, Input, Layout, Typography, Popover, Button, Spin } from "antd";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../api/group";
import { useRouter } from "../hooks/useRouter";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import useCurrentUser from "../hooks/useCurrentUser";
import { useState } from "react";
import { EditUserPopover } from "./EditUserPopover";
import debouce from "lodash/debounce";
import { CreateGroupModal } from "./CreateGroupModal";

const ChatItem = styled.div`
  width: 100%;
  height: 4rem;
  background-color: transparent;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
  &:hover {
    background-color: rgb(56, 88, 152, 0.1);
    cursor: pointer;
  }
`;

export const ChatSidebar = () => {
  const { userInfo } = useCurrentUser();
  const [search, setSearch] = useState("");
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["groups", search],
    queryFn: () =>
      getGroups({ page: 1, limit: 20, keyword: search || undefined }),
    select: ({ data }) => {
      return data?.result.data;
    },
    refetchOnWindowFocus: false,
  });
  const { navigate, params } = useRouter();
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isOpenCreateGroupModal, setIsOpenCreateGroupModal] = useState(false);

  const id = Object.values(params)[0]?.split("/")[1];

  const onSearch = debouce((e) => {
    setSearch(e.target.value);
  }, 500);

  return (
    <>
      <Layout.Sider
        className="bg-white overflow-auto h-screen fixed left-0 top-0 bottom-0"
        width={300}
      >
        <div className="flex flex-row p-4">
          <Input placeholder="Search" className="mr-3" onChange={onSearch} />
          <Popover
            trigger="click"
            placement="bottom"
            content={
              <div className="flex flex-col">
                <Button
                  type="text"
                  className="text-black flex flex-row text-left"
                  onClick={() => setIsOpenUserModal(true)}
                >
                  <Avatar src={userInfo?.avatar} size="small" />
                  <Typography.Text className="ml-2">Settings</Typography.Text>
                </Button>
                <Button
                  type="text"
                  className="text-black text-left"
                  onClick={() => setIsOpenCreateGroupModal(true)}
                >
                  <PlusOutlined size={24} className="mr-1 ml-1" />
                  <Typography.Text className="ml-2">
                    Create group
                  </Typography.Text>
                </Button>
              </div>
            }
          >
            <Button
              type="primary"
              shape="circle"
              icon={<MoreOutlined />}
              size="middle"
            />
          </Popover>
        </div>
        {isFetching ? (
          <div className="h-full flex justify-center">
            <Spin />
          </div>
        ) : (
          data?.map((group) => (
            <ChatItem
              key={group._id}
              className={id === group._id ? "bg-slate-300" : undefined}
              onClick={() => navigate(`/message/${group._id}`)}
            >
              <Avatar size={50} className="mr-4" src={group.image} />
              <div className="flex flex-col text-white">
                <Typography.Text className="text-black">
                  {group.name}
                </Typography.Text>
                <Typography.Text className="text-0.65rem text-gray-500">{`${
                  group.lastMessage.sender.name
                }: ${
                  group.lastMessage.message.content || ""
                }`}</Typography.Text>
              </div>
            </ChatItem>
          ))
        )}
      </Layout.Sider>
      {isOpenUserModal && (
        <EditUserPopover
          open={isOpenUserModal}
          onClose={() => setIsOpenUserModal(false)}
        />
      )}

      {isOpenCreateGroupModal && (
        <CreateGroupModal
          refetchGroups={refetch}
          open={isOpenCreateGroupModal}
          onClose={() => setIsOpenCreateGroupModal(false)}
        />
      )}
    </>
  );
};
