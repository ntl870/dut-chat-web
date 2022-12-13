import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { Avatar, Input, Skeleton } from "antd";
import { getGroupMessage, GroupMessage } from "../api/message";
import { useRouter } from "../hooks/useRouter";
import styled from "styled-components";
import { sendGroupMessage } from "../api/message";
import { useEffect, useRef, useState } from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import InfiniteScroll from "react-infinite-scroll-component";
import { socket } from "../utils";
import uniqBy from "lodash/uniqBy";
import { getStorage } from "../utils";

const Wrapper = styled.div<{ padding: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  padding-bottom: ${(p) => {
    return p.children[0].props.padding;
  }}px;
`;

const Message = styled.div`
  border: 1px solid transparent;
  max-width: 20rem;
  max-height: 10rem;
  word-wrap: break-word;
  border-radius: 1.5rem;
  padding: 0.5rem;
  background-color: #e4e6eb;
  margin-left: 0.5rem;
`;

export const ChatMessage = () => {
  const { params } = useRouter();
  const { userInfo } = useCurrentUser();
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentChat, setCurrentChat] = useState<GroupMessage[] | []>([]);
  const inputRef = useRef<any>(null);

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ["group", params.id],
    cacheTime: 0,
    queryFn: ({ pageParam = 1 }) => {
      return getGroupMessage({
        groupId: params.id || "",
        pagination: {
          page: pageParam,
          limit: 20,
        },
      });
    },
    getNextPageParam: (lastPage) => {
      const totalPage = Math.ceil(lastPage.data.result.total / 20);
      if (lastPage.data.result.currentPage === totalPage)
        return lastPage.data.result.currentPage;

      return lastPage.data.result.currentPage + 1;
    },
    getPreviousPageParam: (firstPage) =>
      firstPage.data.result.currentPage - 1 ?? undefined,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    setCurrentChat([]);
  }, [params.id]);

  useEffect(() => {
    if (data?.pages.length) {
      setCurrentChat((prev) => [
        ...prev,
        ...data.pages.map((item) => item.data.result.data).flat(),
      ]);
    }
  }, [data?.pages.length]);

  const sendMessage = useMutation({
    mutationKey: ["message", params.id],
    mutationFn: sendGroupMessage,
    onSuccess: ({ data }) => {
      setCurrentChat((prev) => [data.result, ...prev]);
    },
  });

  const handleChangeMessage = (content: string) => {
    setCurrentMessage("");
    sendMessage.mutate({
      groupId: params.id || "",
      content,
    });
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connect");
    });
    socket.on("messages", (data) => {
      console.log("d", data);
      if (data.message.sender !== userInfo?._id)
        setCurrentChat((prev) => [data.message, ...prev]);
    });

    return () => {
      socket.off("connect");
      socket.off("messages");
    };
  }, []);

  const renderItem = (message) => {
    const isSender =
      message.sender._id === userInfo._id || message.sender === userInfo._id;
    return (
      <div className="flex flex-col mb-2" key={message._id}>
        <span className={`ml-4 ${isSender ? "text-right" : "text-left"}`}>
          {isSender ? userInfo.name : message.sender.name}
        </span>
        <div
          className={`flex flex-row ${
            isSender ? "justify-end" : "justify-start"
          }`}
        >
          <div className="flex flex-col justify-end ml-2">
            <Avatar src={message.sender.avatar} size="default" />
          </div>
          <Message key={message._id}>{message.content}</Message>
        </div>
      </div>
    );
  };
  return (
    <Wrapper>
      {/* <MessageSection padding={60}> */}
      <InfiniteScroll
        next={fetchNextPage}
        scrollThreshold={0.5}
        hasMore
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        dataLength={uniqBy(currentChat, "_id").length}
        endMessage={<div>end</div>}
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          paddingBottom: 60,
        }}
        inverse
      >
        {uniqBy(currentChat, "_id").map((item) => renderItem(item))}
      </InfiniteScroll>
      {/* </MessageSection> */}
      <div ref={inputRef} className="fixed bottom-0 w-full">
        <Input.TextArea
          autoSize={{
            minRows: 1,
            maxRows: 6,
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
      </div>
    </Wrapper>
  );
};
