import { axiosClient } from "./axios";
import { APIResponsePaging } from "../types";
import { Pagination } from "antd";

export interface Pagination {
  limit: number;
  page: number;
}

export interface GroupMessage {
  _id: string;
  content: string;
  createdAt: string;
  group: string;
  readBy: string[];
  sender: {
    avatar: string;
    name: string;
    _id: string;
  };
}

type GroupMessageResponse = APIResponsePaging<GroupMessage>;

export const getGroupMessage = ({
  groupId,
  pagination,
}: {
  groupId: string;
  pagination: Pagination;
}): Promise<GroupMessageResponse> => {
  return axiosClient.get(`/groups/${groupId}/messages`, { params: pagination });
};

export const sendGroupMessage = ({
  groupId,
  content,
}: {
  groupId: string;
  content: string;
}) => {
  return axiosClient.post(`/groups/${groupId}/messages`, {
    content,
  });
};
