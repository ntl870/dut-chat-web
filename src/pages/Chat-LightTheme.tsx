import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, Input, Skeleton, Spin, Typography } from "antd";
import { getGroupMessage, GroupMessage } from "../api/message";
import { useRouter } from "../hooks/useRouter";
import styled from "styled-components";
import { sendGroupMessage } from "../api/message";
import { useEffect, useRef, useState } from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import InfiniteScroll from "react-infinite-scroll-component";
import { socket } from "../utils";
import uniqBy from "lodash/uniqBy";
import { getGroupByID } from "../api/group";
import { SendOutlined } from "@ant-design/icons";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
  padding-bottom: 60px;
  background-color: #ffffff;
  padding-right: 1rem;
  padding-left: 1rem;
  .infinite-scroll-component__outerdiv {
    height: 100%;
  }
`;

const Message = styled.div`
  border: 1px solid transparent;
  max-width: 20rem;
  max-height: 10rem;
  word-wrap: break-word;
  border-radius: 1.5rem;
  padding: 0.5rem;
  margin-left: 0.5rem;
`;

export const ChatMessage = () => {
  const { params } = useRouter();
  const { userInfo } = useCurrentUser();
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentChat, setCurrentChat] = useState<GroupMessage[] | []>([]);
  const [page, setPage] = useState(1);
  const inputRef = useRef<any>(null);

  const { data: groupInfo } = useQuery({
    queryKey: ["group", params.id],
    queryFn: () => getGroupByID(params?.id || ""),
    enabled: !!params.id,
    select: ({ data }) => data?.result,
  });

  const {
    data,
    refetch,
    isFetching: isFetchingMessage,
  } = useQuery({
    queryKey: ["groupMessage", params.id, page],
    cacheTime: 0,
    queryFn: () =>
      getGroupMessage({
        groupId: params.id || "",
        pagination: {
          page: page,
          limit: 20,
        },
      }),
    onSuccess: ({ data }) => {
      setCurrentChat((prev) => [
        ...prev,
        ...data.result.data.map((item) => item),
      ]);
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const totalPage = Math.ceil(Number(data?.data.result.total) / 20);

  useEffect(() => {
    setCurrentChat([]);
    setPage(1);
  }, [params.id]);

  const sendMessage = useMutation({
    mutationKey: ["message", params.id],
    mutationFn: sendGroupMessage,
    onSuccess: ({ data }) => {
      setCurrentChat((prev) => [data.result, ...prev]);
    },
  });

  const handleChangeMessage = (content: string) => {
    setCurrentMessage("");
    // sendMessage.mutate({
    //   groupId: params.id || "",
    //   content,
    // });
  };
  useEffect(() => {
    socket.on("messages", (data) => {
      if (data.message.message.sender !== userInfo?._id) {
        const sender = groupInfo?.members.find(
          (item) => item.user._id === data.message.message.sender
        ).user;
        setCurrentChat((prev) => [
          { ...data.message.message, sender },
          ...prev,
        ]);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("messages");
    };
  }, []);

  const renderItem = (message) => {
    const isSender =
      message.sender?._id === userInfo?._id ||
      message?.sender === userInfo?._id;
    return (
      <div className="flex flex-col mb-2" key={message._id}>
        <span
          className={`ml-4 ${isSender ? "text-right" : "text-left"}`}
          style={{
            color: isSender ? "black" : "black",
          }}
        >
          {isSender ? userInfo?.name : message?.sender?.name}
        </span>
        <div
          className={`flex flex-row z-0 ${
            isSender ? "justify-end" : "justify-start"
          }`}
        >
          <div className="flex flex-col justify-end ml-2 z-0">
            <Avatar
              src={!isSender ? message.sender?.avatar : userInfo?.avatar}
              size="default"
            />
          </div>
          <Message
            key={message._id}
            style={{
              backgroundColor: isSender ? "rgb(59 130 246)" : "#3E4042",
              color: "white",
            }}
          >
            {message.content}
          </Message>
        </div>
      </div>
    );
  };

  if (isFetchingMessage && page === 1) {
    return (
      <div
        style={{
          backgroundColor: "white",
        }}
        className="flex justify-center h-full items-center"
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div
        className="w-full fixed top-0 h-10 z-50"
        style={{
          backgroundColor: "rgb(59 130 246)",
        }}
      >
        <Typography.Title level={2} className="text-white">
          {groupInfo?.name}
        </Typography.Title>
      </div>
      <Wrapper>
        <InfiniteScroll
          next={() => {
            if (page < totalPage) {
              setPage((page) => page + 1);
              refetch();
            }
          }}
          scrollThreshold={0.5}
          hasMore={totalPage !== 1 && page < totalPage}
          loader={<Skeleton paragraph={{ rows: 1 }} active />}
          dataLength={uniqBy(currentChat, "_id").length}
          className="flex flex-col-reverse h-full z-20"
          inverse
        >
          {uniqBy(currentChat, "_id").map((item) => renderItem(item))}
        </InfiniteScroll>

        <div
          ref={inputRef}
          className="flex flex-row items-center fixed bottom-0 w-full"
        >
          <Input.TextArea
            className="placeholder-white border-none"
            autoSize={{
              minRows: 1,
              maxRows: 6,
            }}
            style={{
              backgroundColor: "#AFD5FF",
              color: "black",
              width: "75%",
            }}
            value={currentMessage}
            onChange={(e) => {
              setCurrentMessage(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key == "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleChangeMessage(currentMessage);
              }

              if (e.key == "Enter" && e.shiftKey) {
                return;
              }
            }}
            size="large"
            placeholder="Text"
          />
          <Button
            type="primary"
            onClick={() => handleChangeMessage(currentMessage)}
            icon={<SendOutlined />}
          ></Button>
        </div>
      </Wrapper>
    </>
  );
};
