import { Avatar, Input, Layout, Typography, Popover, Button, Spin } from "antd";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getGroups, Group } from "../api/group";
import { useRouter } from "../hooks/useRouter";
import {
  LogoutOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useCurrentUser from "../hooks/useCurrentUser";
import { useEffect, useState } from "react";
import { EditUserPopover } from "./EditUserPopover";
import debouce from "lodash/debounce";
import { CreateGroupModal } from "./CreateGroupModal";
import { SearchModal } from "./SearchModal";
import { formatTimeSpan, socket } from "../utils";

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
  const { userInfo, logout } = useCurrentUser();
  const { navigate, params } = useRouter();
  const [search, setSearch] = useState("");
  const [currentData, setCurrentData] = useState<Group[]>([]);
  const { isFetching, refetch } = useQuery({
    queryKey: ["groups", search],
    queryFn: () =>
      getGroups({ page: 1, limit: 100, keyword: search || undefined }),
    select: ({ data }) => {
      return data?.result.data;
    },
    onSuccess: (data) => {
      if (Object.keys(params).length === 1) {
        navigate(`/message/${data[0]._id}`);
      }
      setCurrentData(data);
    },
    refetchOnWindowFocus: false,
  });
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isOpenCreateGroupModal, setIsOpenCreateGroupModal] = useState(false);
  const [isOpenSearch, setIsOpenSearchModal] = useState(false);

  const id = Object.values(params)[0]?.split("/")[1];

  const onSearch = debouce((e) => {
    setSearch(e.target.value);
  }, 500);

  useEffect(() => {
    socket.on("messages", (data) => {
      if (currentData.find((item) => item._id === data.message.group._id)) {
        setCurrentData((prev) =>
          prev.filter((item) => item._id !== data.message.group._id)
        );
      }
      setCurrentData((prev) => [data.message.group, ...prev]);
    });

    return () => {
      socket.off("connect");
      socket.off("messages");
    };
  }, []);

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
          <Button
            type="primary"
            shape="circle"
            icon={<SearchOutlined />}
            className="mr-2"
            onClick={() => setIsOpenSearchModal(true)}
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
                <Button
                  danger
                  type="primary"
                  className="flex flex-row text-left items-center"
                  onClick={logout}
                >
                  <LogoutOutlined className="mr-1 ml-1" />
                  <Typography.Text className="text-white">
                    Logout
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
          currentData?.map((group) => (
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
                <div className="flex flex-row justify-center text-white">
                  <div className="flex flex-col">
                    <Typography.Text className="text-white">
                      {group.name}
                    </Typography.Text>
                    {group.lastMessage.message.type !== "text" ? (
                      <Typography.Text
                        style={{
                          fontSize: "0.55rem",
                        }}
                        className="text-gray-300"
                      >
                        {group.lastMessage.type === "file"
                          ? `${group.lastMessage.sender.name}: sent a file`
                          : `${group.lastMessage.sender.name}: sent an image`}
                      </Typography.Text>
                    ) : (
                      <Typography.Text
                        style={{
                          fontSize: "0.55rem",
                        }}
                        className=" text-gray-300"
                      >{`${group.lastMessage.sender.name || ""}: ${
                        group.lastMessage.message.content || ""
                      }`}</Typography.Text>
                    )}
                  </div>

                  <Typography.Text className="absolute right-6 text-right text-white">
                    {formatTimeSpan(group.lastMessage.sentAt)}
                  </Typography.Text>
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

      {isOpenSearch && (
        <SearchModal
          open={isOpenSearch}
          onClose={() => setIsOpenSearchModal(false)}
        />
      )}
    </>
  );
};
