import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/user";
import { removeStorage } from "../utils";
import { useRouter } from "./useRouter";

interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
}

export default function useCurrentUser(): {
  userInfo: IUser;
  refetchUser: () => void;
  logout: () => void;
} {
  const { navigate } = useRouter();
  const { refetch, data } = useQuery(["user"], getUser, {
    cacheTime: Infinity,
    refetchOnWindowFocus: true,
  });

  const logout = () => {
    removeStorage("token");
    navigate("/login");
  };

  return { userInfo: data?.data?.result, refetchUser: refetch, logout };
}
