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
    background-color: #385898;
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
        className="overflow-auto h-screen fixed left-0 top-0 bottom-0"
        width={300}
        style={{ backgroundColor: "#242526" }}
      >
        <div className="flex flex-row p-4">
          <Input
            style={{
              backgroundColor: "#3A3B3C",
            }}
            placeholder="Search"
            className="mr-3 text-gray-400 border-none placeholder-white"
            onChange={onSearch}
          />
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
            <div key={group._id}>
              <ChatItem
                style={{
                  backgroundColor: id === group._id ? "#385898" : undefined,
                  width: "90%",
                  margin: "0 auto",
                }}
                className="px-6 rounded-lg"
                onClick={() => navigate(`/message/${group._id}`)}
              >
                <Avatar size={50} className="mr-4" src={group.image} />
                <div className="flex flex-col text-white">
                  <Typography.Text className="text-white">
                    {group.name}
                  </Typography.Text>
                  <Typography.Text className="text-0.65rem text-gray-300">{`${
                    group.lastMessage.sender.name
                  }: ${
                    group.lastMessage.message.content || ""
                  }`}</Typography.Text>
                </div>
              </ChatItem>
            </div>
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
