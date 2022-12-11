import { io } from "socket.io-client";

export const getStorage = (key: string) => localStorage.getItem(key);

export const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, value);
};

export const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};
export const socket = io(import.meta.env.VITE_API_URL_SOCKET, {
  auth: {
    token: getStorage("token"),
  },
  transports: ["websocket"],
});
