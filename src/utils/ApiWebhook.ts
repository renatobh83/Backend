import axios, { type AxiosInstance } from "axios";

interface ApiConfig {
  baseURl: string;
  token2: string;
}

export function createApiInstance(api: ApiConfig): AxiosInstance {
  return axios.create({
    baseURL: api.baseURl,
    headers: {
      Authorization: api.token2,
      "Content-Type": "application/json",
    },
  });
}
interface ApiConfigJTW {
  baseURl: string;
  token: string;
}
export function createApiInstanceJTW(api: ApiConfigJTW): AxiosInstance {
  return axios.create({
    baseURL: api.baseURl,
    headers: {
      Authorization: `Bearer ${api.token}`,
      "Content-Type": "application/json",
    },
  });
}
