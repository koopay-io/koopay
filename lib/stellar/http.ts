import axios from "axios";
import { TRUSTLESS_API_KEY } from "../constants";

export const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": TRUSTLESS_API_KEY,
  },
});
