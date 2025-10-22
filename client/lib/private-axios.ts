import axios from "axios";
const serverUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const privateAxios = axios.create({
  baseURL: serverUrl,
});
