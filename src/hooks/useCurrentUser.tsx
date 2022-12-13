import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/user";

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
} {
  const { refetch, data } = useQuery(["user"], getUser, {
    cacheTime: Infinity,
    refetchOnWindowFocus: true,
  });

  return { userInfo: data?.data?.result, refetchUser: refetch };
}
