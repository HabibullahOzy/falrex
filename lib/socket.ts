import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    const token = Cookies.get("auth_token");
    socket = io(API, {
      auth:            { token },
      withCredentials: true,
      transports:      ["websocket", "polling"],
      reconnection:    true,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export { socket };