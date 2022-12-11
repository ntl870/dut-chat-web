import { Avatar, Layout, Typography } from "antd";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../api/group";
import { useRouter } from "../hooks/useRouter";

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
  const { data } = useQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups({ page: 1, limit: 20 }),
    select: ({ data }) => {
      return data?.result.data;
    },
  });
  const { navigate, params } = useRouter();
  const id = Object.values(params)[0]?.split("/")[1];

  return (
    <Layout.Sider
      className="bg-white overflow-auto h-screen fixed left-0 top-0 bottom-0"
      width={300}
    >
      {data?.map((group) => (
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
            }: ${group.lastMessage.message.content || ""}`}</Typography.Text>
          </div>
        </ChatItem>
      ))}
    </Layout.Sider>
  );
};
