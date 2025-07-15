import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { type CanvasState } from "../types/canvas";

interface UseSocketProps {
  roomId: string;
  onCanvasUpdate: (canvasState: CanvasState) => void;
  onUserJoined: (userId: string) => void;
  onCanvasCleared: () => void;
  onCursorMove: (data: { x: number; y: number; userId: string }) => void;
}

export function useSocket({
  roomId,
  onCanvasUpdate,
  onUserJoined,
  onCanvasCleared,
  onCursorMove,
}: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);

  useEffect(() => {
    if (!roomId) return;

    // Initialize socket connection
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("user-joined", (data: { userId: string }) => {
      onUserJoined(data.userId);
    });

    socket.on("user-count", (count: number) => {
      setConnectedUsers(count);
    });

    socket.on("canvas-update", (canvasState: CanvasState) => {
      onCanvasUpdate(canvasState);
    });

    socket.on("canvas-cleared", () => {
      onCanvasCleared();
    });

    socket.on("cursor-move", (data: { x: number; y: number; userId: string }) => {
      onCursorMove(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, onCanvasUpdate, onUserJoined, onCanvasCleared, onCursorMove]);

  const emitCanvasUpdate = (canvasState: CanvasState) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("canvas-update", { roomId, canvasState });
    }
  };

  const emitCursorMove = (x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("cursor-move", { roomId, x, y });
    }
  };

  const emitClearCanvas = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("clear-canvas", { roomId });
    }
  };

  return {
    isConnected,
    connectedUsers,
    emitCanvasUpdate,
    emitCursorMove,
    emitClearCanvas,
  };
}