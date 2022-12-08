export const getStorage = (key: string) => localStorage.getItem(key);

export const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, value);
};

export const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};
