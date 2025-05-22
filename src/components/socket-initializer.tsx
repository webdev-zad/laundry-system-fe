"use client";

import { useEffect } from "react";
import { initializeSocket, disconnectSocket } from "../services/socketService";

export function SocketInitializer() {
  useEffect(() => {
    initializeSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  return null; // This component doesn't render anything
}
