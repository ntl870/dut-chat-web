import { axiosClient } from "./axios";

interface AuthBody {
  email: string;
  password: string;
}

export const login = (body: AuthBody) => axiosClient.post("/auth/login", body);
