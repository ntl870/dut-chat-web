import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, Input } from "antd";
import { getGroupMessage, GroupMessage } from "../api/message";
import { useRouter } from "../hooks/useRouter";
import styled from "styled-components";
import { sendGroupMessage } from "../api/message";
import { useEffect, useRef, useState } from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import { socket } from "../utils";
const Wrapper = styled.div<{ padding: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
  justify-content: space-between;
  padding-bottom: ${(p) => {
    console.log("p", p);
    return p.children[0].props.padding;
  }}px;
`;

const MessageSection = styled.div`
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  width: 100%;
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
  const [page, setPage] = useState(1);
  const [inputHeight, setInputHeight] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [currentChat, setCurrentChat] = useState<GroupMessage[] | []>([]);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setInputHeight(inputRef.current?.offsetHeight);
  });

  useEffect(() => {
    setCurrentChat([]);
  }, [params.id]);

  useQuery({
    queryKey: ["group", params.id],
    cacheTime: 0,
    queryFn: () =>
      getGroupMessage({
        groupId: params.id || "",
        pagination: {
          page: page,
          limit: 20,
        },
      }),
    select: ({ data }) => {
      return data?.result;
    },
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const totalPage = Math.ceil(data?.total / 10);
      setTotalPage(totalPage);
      setCurrentChat((prev) => [...prev, ...data.data]);
    },
  });

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
    socket.on("messages", (data) => {
      if (data.message.sender !== userInfo?._id)
        setCurrentChat((prev) => [data.message, ...prev]);
    });
  }, []);

  return (
    <Wrapper>
      <MessageSection padding={inputHeight}>
        {currentChat?.map((message, index) => {
          const isSender =
            message.sender._id === userInfo._id ||
            message.sender === userInfo._id;
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
        })}
      </MessageSection>
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
              //   e.preventDefault();
            }
          }}
          size="large"
          placeholder="Text"
        />
      </div>
    </Wrapper>
  );
};
