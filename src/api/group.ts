import { axiosClient } from "./axios";
import { Pagination } from "./message";

interface Sender {
  _id: string;
  avatar: string;
  name: string;
}

interface LastMessage {
  _id: string;
  message: {
    _id: string;
    content: string;
    readBy: string[];
  };
  sender: Sender;
}

interface Member {
  joinedAt: Date;
  nickName: string;
  notify: boolean;
  user: string;
  _id: string;
}

interface Group {
  _id: string;
  image: string;
  name: string;
  joinRequests: string[];
  lastMessage: LastMessage;
  members: Member[];
}

export const getGroups = (
  pagination: Pagination
): Promise<{
  data: {
    result: {
      data: Group[];
    };
  };
}> => {
  return axiosClient.get("/groups", {
    params: pagination,
  });
};

export const createGroup = (body: { name: string; description: string }) => {
  return axiosClient.post("/groups", body);
};

export const getGroupByID = (id: string) => {
  return axiosClient.get(`/groups/${id}`);
};
