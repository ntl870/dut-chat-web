import { axiosClient } from "./axios";

export const getUser = () => axiosClient.get("/users");

export const updateUser = (body: {
  name: string;
  avatar: string;
  phone: string;
}) => axiosClient.put("/users", body);
