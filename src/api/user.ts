import { axiosClient } from "./axios";

export const getUser = () => axiosClient.get("/users");
