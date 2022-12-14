import { io } from "socket.io-client";

export const getStorage = (key: string) => localStorage.getItem(key);

export const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, value);
};

export const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};

export const scrollToBottom = () => {
  const objDiv = document.getElementById("endDiv");
  if (objDiv) objDiv.scrollTop = objDiv?.scrollHeight;
};

export const socket = io(import.meta.env.VITE_API_URL_SOCKET, {
  auth: {
    token: getStorage("token"),
  },
  transports: ["websocket"],
});

export const formatTimeSpan = (time: string): string => {
  const now = new Date();
  const date = new Date(time);
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / 1000 / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  if (diffInMinutes < 1) {
    return "Just now";
  }
  if (diffInHours < 1) {
    return `${diffInMinutes}m`;
  }
  if (diffInDays < 1) {
    return `${diffInHours}h`;
  }
  if (diffInWeeks < 1) {
    return `${diffInDays}d`;
  }
  if (diffInMonths < 1) {
    return `${diffInWeeks}w`;
  }
  if (diffInYears < 1) {
    return `${diffInMonths}m`;
  }
  return `${diffInYears}y`;
};

export const download = (link: string) => {
  const element = document.createElement("a");
  element.setAttribute("href", link);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};
