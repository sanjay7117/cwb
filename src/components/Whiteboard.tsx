import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../hooks/use-socket";
import { type CanvasState } from "../types/canvas";
import { Button } from "./ui/button";
import { Copy, Users, Wifi, WifiOff, Undo, Redo, Trash2, ArrowLeft } from "lucide-react";

interface WhiteboardProps {
  roomId: string;
  onBack: () => void;
}

export default function Whiteboard({ roomId, onBack }: WhiteboardProps) {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    paths: [],
    shapes: [],
    emojis: []
  });
  const [copied, setCopied] = useState(false);

  // Socket.IO event handlers
  const handleCanvasUpdate = useCallback((newCanvasState: CanvasState) => {
    setCanvasState(newCanvasState);
  }, []);

  const handleUserJoined = useCallback((userId: string) => {
    console.log("User joined:", userId);
  }, []);

  const handleCanvasCleared = useCallback(() => {
    setCanvasState({ paths: [], shapes: [], emojis: [] });
  }, []);

  const handleCursorMove = useCallback((data: { x: number; y: number; userId: string }) => {
    // Handle cursor movement
    console.log("Cursor move:", data);
  }, []);

  // Initialize Socket.IO
  const {
    isConnected,
    connectedUsers,
    emitCanvasUpdate,
    emitClearCanvas,
  } = useSocket({
    roomId,
    onCanvasUpdate: handleCanvasUpdate,
    onUserJoined: handleUserJoined,
    onCanvasCleared: handleCanvasCleared,
    onCursorMove: handleCursorMove,
  });

  const handleCopyRoomLink = async () => {
    try {
      const url = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleClear = () => {
    setCanvasState({ paths: [], shapes: [], emojis: [] });
    emitClearCanvas();
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-xl font-semibold text-gray-800">CollabBoard</h1>
          
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
            <Users className="text-green-600 w-4 h-4" />
            <span className="text-sm text-gray-600">{connectedUsers} user{connectedUsers !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
            {isConnected ? (
              <>
                <Wifi className="text-green-600 w-4 h-4" />
                <span className="text-sm text-gray-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="text-red-600 w-4 h-4" />
                <span className="text-sm text-gray-600">Disconnected</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
            <span className="text-sm text-gray-600 font-mono">{roomId}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-1 text-blue-600 hover:text-blue-700"
              onClick={handleCopyRoomLink}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          {copied && <span className="text-green-600 text-sm">Copied!</span>}

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="p-2 text-red-600 hover:text-red-700"
              onClick={handleClear}
              title="Clear canvas"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-white">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-semibold mb-2">Canvas Ready</h2>
            <p className="text-lg">Start drawing and collaborating!</p>
            <p className="text-sm mt-2">Room: {roomId}</p>
            <p className="text-sm">Connected users: {connectedUsers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}