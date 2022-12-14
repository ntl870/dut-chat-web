import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Input,
  Skeleton,
  Spin,
  Typography,
  Upload,
  Image,
  Tooltip,
  message,
} from "antd";
import { getGroupMessage, GroupMessage } from "../api/message";
import { useRouter } from "../hooks/useRouter";
import styled from "styled-components";
import { sendGroupMessage } from "../api/message";
import { useEffect, useRef, useState } from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import InfiniteScroll from "react-infinite-scroll-component";
import { download, socket } from "../utils";
import uniqBy from "lodash/uniqBy";
import GroupModal from "../components/GroupDetailModel";
import { getGroupByID } from "../api/group";
import {
  FileFilled,
  PlusCircleFilled,
  SendOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { uploadFile } from "../utils/firebase";
import { getDownloadURL } from "firebase/storage";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
  padding-bottom: 60px;
  background-color: #242526;
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
  const [groupModelVisible, setGroupModelVisible] = useState(false);
  const [visibleMembersGroup, setVisibleMembersGroup] = useState(false);
  const [visibleJoinRequest, setVisibleJoinRequest] = useState(false);
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState<RcFile[]>([]);
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
          limit: 30,
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

  const totalPage = Math.ceil(Number(data?.data.result.total) / 30);

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
    if (files.length > 0) {
      files.map((file, index) => {
        const uploadTask = uploadFile(file, `${groupInfo._id}/${file.name}`);
        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            console.log(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              const fileType = file.type.includes("image") ? "image" : "file";
              try {
                sendMessage.mutate({
                  groupId: params.id || "",
                  content: downloadURL,
                  type: fileType,
                  fileName: file.name,
                });
              } catch (e) {
                message.error((e as Error).message);
              } finally {
                if (index === files.length - 1) setFiles([]);
              }
            });
          }
        );
      });
    }
    if (currentMessage)
      sendMessage.mutate({
        groupId: params.id || "",
        content,
        type: "text",
      });
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

    const isLastInPage =
      currentChat[currentChat.length - 1]._id === message._id;
    return (
      <div className="flex flex-col mb-2" key={message._id}>
        {isLastInPage && page < totalPage && (
          <Button
            className="mt-20 w-24 m-auto"
            onClick={() => {
              setPage((page) => page + 1);
              refetch();
            }}
          >
            Load more
          </Button>
        )}
        <span
          className={`ml-4 ${isSender ? "text-right" : "text-left"}`}
          style={{
            color: isSender ? "white" : "rgb(209 213 219)",
            marginTop: isLastInPage ? "2.5rem" : undefined,
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
          {(() => {
            if (message.type === "file") {
              return (
                <div className="flex flex-row w-24 h-10">
                  <FileFilled
                    style={{
                      fontSize: "2.25rem",
                    }}
                    onClick={() => download(message.content)}
                    className="text-gray-500 cursor-pointer"
                  />
                  <Typography.Text className="text-white">
                    {message?.fileName || ""}
                  </Typography.Text>
                </div>
              );
            }
            if (message.type === "image") {
              return <Image src={message.content} />;
            }
            return (
              <Message
                key={message._id}
                style={{
                  backgroundColor: isSender ? "rgb(59 130 246)" : "#3E4042",
                  color: "white",
                }}
              >
                {message.content}
              </Message>
            );
          })()}
        </div>
      </div>
    );
  };

  if (isFetchingMessage && page === 1) {
    return (
      <div
        style={{
          backgroundColor: "#242526",
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
        className="fixed top-0 h-10 z-50"
        style={{
          backgroundColor: "#242526",
          borderBottom: "1px solid #3E4042",
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          width: "83%",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar src={groupInfo.image} size="large" />
          <Typography.Title
            level={2}
            className="text-white"
            style={{
              marginLeft: "1rem",
              margin: 10,
            }}
          >
            {groupInfo?.name}
          </Typography.Title>
        </div>
        <button
          style={{
            textAlign: "right",
            alignItems: "flex-end",
            backgroundColor: "#3E4042",
          }}
          onClick={() => setGroupModelVisible(true)}
        >
          <SettingOutlined
            style={{
              color: "white",
              borderRadius: "100%",
            }}
          />
        </button>
      </div>
      <Wrapper className="pb-24">
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
          className="flex flex-col-reverse h-full z-20 pb-16"
          inverse
        >
          {uniqBy(currentChat, "_id").map((item) => renderItem(item))}
        </InfiniteScroll>

        <div
          ref={inputRef}
          className="flex flex-row items-center fixed bottom-0 w-full"
        >
          <div
            style={{
              width: "77%",
            }}
          >
            {files.length > 0 && (
              <div className="flex flex-row">
                {files.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    {item.type.includes("image") ? (
                      <Image
                        src={URL.createObjectURL(item)}
                        alt=""
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
                      />
                    ) : (
                      <Tooltip title={item.name}>
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            border: "1px solid white",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <FileFilled className="text-white text-lg" />
                        </div>
                      </Tooltip>
                    )}

                    <span
                      onClick={() => {
                        setFiles((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 cursor-pointer"
                    >
                      X
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-row items-center">
              <Upload
                multiple={false}
                fileList={[]}
                onChange={(e) => {
                  setFiles((prev) => [...prev, e.file.originFileObj as RcFile]);
                }}
              >
                <Button icon={<PlusCircleFilled />}></Button>
              </Upload>
              <Input.TextArea
                className="placeholder-white border-none"
                autoSize={{
                  minRows: 1,
                  maxRows: 6,
                }}
                style={{
                  backgroundColor: "#3A3B3C",
                  color: "white",
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
          </div>
        </div>
        {groupModelVisible && (
          <GroupModal
            open={groupModelVisible}
            groupId={groupInfo._id}
            onClose={() => setGroupModelVisible(false)}
          />
        )}
      </Wrapper>
    </>
  );
};
