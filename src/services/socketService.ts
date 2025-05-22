import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (!socket) {
    // Use the environment variable for the base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    socket = io(baseUrl);

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
