import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Room, type CanvasState } from "@shared/schema";
import { useSocket } from "@/hooks/use-socket";
import Canvas from "@/components/whiteboard/canvas";
import Toolbar from "@/components/whiteboard/toolbar";
import DrawingToolbar from "@/components/whiteboard/drawing-toolbar";
import EmojiPicker from "@/components/whiteboard/emoji-picker";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Link as LinkIcon, Wifi, WifiOff, Undo, Redo, Trash2 } from "lucide-react";

export default function Whiteboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [roomId, setRoomId] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<string>("pen");
  const [color, setColor] = useState("#2563eb");
  const [lineWidth, setLineWidth] = useState(2);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    paths: [],
    shapes: [],
    emojis: []
  });
  const [selectedEmoji, setSelectedEmoji] = useState<string>("😊");
  const [cursors, setCursors] = useState<{ [userId: string]: { x: number; y: number } }>({});
  const [history, setHistory] = useState<CanvasState[]>([{
    paths: [],
    shapes: [],
    emojis: []
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Socket.IO event handlers
  const handleCanvasUpdate = useCallback((newCanvasState: CanvasState) => {
    // Ensure canvasState has proper structure
    setCanvasState({
      paths: Array.isArray(newCanvasState.paths) ? newCanvasState.paths : [],
      shapes: Array.isArray(newCanvasState.shapes) ? newCanvasState.shapes : [],
      emojis: Array.isArray(newCanvasState.emojis) ? newCanvasState.emojis : [],
    });
  }, []);

  const handleUserJoined = useCallback((userId: string) => {
    toast({
      title: "User joined",
      description: "Someone joined the room",
    });
  }, [toast]);

  const handleCanvasCleared = useCallback(() => {
    setCanvasState({ paths: [], shapes: [], emojis: [] });
    toast({
      title: "Canvas cleared",
      description: "The canvas has been cleared by another user",
    });
  }, [toast]);

  const handleCursorMove = useCallback((data: { x: number; y: number; userId: string }) => {
    setCursors(prev => ({
      ...prev,
      [data.userId]: { x: data.x, y: data.y }
    }));
    
    // Remove cursor after 2 seconds of inactivity
    setTimeout(() => {
      setCursors(prev => {
        const { [data.userId]: removed, ...rest } = prev;
        return rest;
      });
    }, 2000);
  }, []);

  // Extract room ID from URL or generate new one
  useEffect(() => {
    const match = location.match(/^\/room\/(.+)$/);
    if (match) {
      setRoomId(match[1]);
    } else {
      const newRoomId = `room-${Math.random().toString(36).substr(2, 9)}`;
      setRoomId(newRoomId);
      window.history.replaceState({}, "", `/room/${newRoomId}`);
    }
  }, [location]);

  // Initialize Socket.IO
  const {
    isConnected,
    connectedUsers,
    emitCanvasUpdate,
    emitCursorMove,
    emitClearCanvas,
  } = useSocket({
    roomId,
    onCanvasUpdate: handleCanvasUpdate,
    onUserJoined: handleUserJoined,
    onCanvasCleared: handleCanvasCleared,
    onCursorMove: handleCursorMove,
  });

  // Query for room data
  const { data: room, isLoading } = useQuery({
    queryKey: ["/api/rooms", roomId],
    enabled: !!roomId,
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (roomData: { id: string; name: string }) => {
      const response = await apiRequest("POST", "/api/rooms", roomData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
    },
  });

  // Update canvas mutation
  const updateCanvasMutation = useMutation({
    mutationFn: async (canvasData: CanvasState) => {
      const response = await apiRequest("PUT", `/api/rooms/${roomId}/canvas`, canvasData);
      return response.json();
    },
  });

  // Clear canvas mutation
  const clearCanvasMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/rooms/${roomId}/canvas`);
      return response.json();
    },
    onSuccess: () => {
      setCanvasState({ paths: [], shapes: [], emojis: [] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
    },
  });

  // Create room if it doesn't exist
  useEffect(() => {
    if (roomId && !room && !isLoading) {
      createRoomMutation.mutate({
        id: roomId,
        name: `Room ${roomId}`,
      });
    }
  }, [roomId, room, isLoading]);

  // Load canvas data from room
  useEffect(() => {
    if (room?.canvasData) {
      const canvasData = room.canvasData as CanvasState;
      // Ensure canvasData has proper structure
      setCanvasState({
        paths: Array.isArray(canvasData.paths) ? canvasData.paths : [],
        shapes: Array.isArray(canvasData.shapes) ? canvasData.shapes : [],
        emojis: Array.isArray(canvasData.emojis) ? canvasData.emojis : [],
      });
    }
  }, [room]);

  const addToHistory = (newState: CanvasState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleCanvasChange = (newCanvasState: CanvasState) => {
    setCanvasState(newCanvasState);
    updateCanvasMutation.mutate(newCanvasState);
    
    // Add to history
    addToHistory(newCanvasState);
    
    // Emit real-time update
    emitCanvasUpdate(newCanvasState);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setHistoryIndex(newIndex);
      setCanvasState(previousState);
      updateCanvasMutation.mutate(previousState);
      emitCanvasUpdate(previousState);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setHistoryIndex(newIndex);
      setCanvasState(nextState);
      updateCanvasMutation.mutate(nextState);
      emitCanvasUpdate(nextState);
    }
  };

  const handleCopyRoomLink = async () => {
    try {
      const url = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Room link copied!",
        description: "Share this link with others to collaborate",
      });
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    clearCanvasMutation.mutate();
    emitClearCanvas();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading whiteboard...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-canvas-bg">
      {/* Header */}
      <header className="bg-panel-bg border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">CollabBoard</h1>
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
            <Users className="text-success-green w-4 h-4" />
            <span className="text-sm text-gray-600">{connectedUsers} user{connectedUsers !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
            {isConnected ? (
              <>
                <Wifi className="text-success-green w-4 h-4" />
                <span className="text-sm text-gray-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="text-danger-red w-4 h-4" />
                <span className="text-sm text-gray-600">Disconnected</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
            <LinkIcon className="text-primary-blue w-4 h-4" />
            <span className="text-sm text-gray-600 font-mono">{roomId}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-primary-blue hover:text-blue-700"
              onClick={handleCopyRoomLink}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 w-6">{lineWidth}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-danger-red hover:text-red-600 hover:bg-red-50"
              onClick={handleClear}
              title="Clear canvas"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-full">
        {/* Sidebar with Drawing Tools */}
        <div className="w-16 bg-panel-bg border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
          <DrawingToolbar 
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            onToggleEmojiPicker={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas
            canvasState={canvasState}
            onCanvasChange={handleCanvasChange}
            selectedTool={selectedTool}
            color={color}
            lineWidth={lineWidth}
            selectedEmoji={selectedEmoji}
            onCursorMove={emitCursorMove}
            cursors={cursors}
          />
        </div>

        {/* Emoji Picker */}
        <EmojiPicker
          isOpen={isEmojiPickerOpen}
          onClose={() => setIsEmojiPickerOpen(false)}
          onEmojiSelect={(emoji) => {
            setSelectedEmoji(emoji);
            setSelectedTool("emoji");
            setIsEmojiPickerOpen(false);
          }}
        />
      </div>
    </div>
  );
}
