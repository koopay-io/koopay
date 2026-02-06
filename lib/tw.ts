import axios from "axios";
import { BASE_URL } from "./constants";

/**
 * Server-side Trustless Work API client.
 *
 * Uses a server-only API key (no NEXT_PUBLIC_ prefix) so it is never
 * bundled into the browser. Use this exclusively inside Server Actions
 * and API routes.
 */
export const tw = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.TRUSTLESS_API_KEY ?? "",
  },
});
