import { useRef, useEffect, useState } from "react";
import { type CanvasState, type DrawingPath, type Shape, type EmojiElement, type DrawingPoint } from "@shared/schema";
import { useCanvas } from "@/hooks/use-canvas";

interface CanvasProps {
  canvasState: CanvasState;
  onCanvasChange: (state: CanvasState) => void;
  selectedTool: string;
  color: string;
  lineWidth: number;
  selectedEmoji?: string;
  onCursorMove?: (x: number, y: number) => void;
  cursors?: { [userId: string]: { x: number; y: number } };
}

export default function Canvas({
  canvasState,
  onCanvasChange,
  selectedTool,
  color,
  lineWidth,
  selectedEmoji = "😊",
  onCursorMove,
  cursors = {},
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<DrawingPoint | null>(null);
  const [currentPath, setCurrentPath] = useState<DrawingPoint[]>([]);

  const { drawOnCanvas, clearCanvas } = useCanvas();

  // Redraw canvas when state changes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    clearCanvas(ctx);
    drawOnCanvas(ctx, canvasState);
  }, [canvasState, drawOnCanvas, clearCanvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        clearCanvas(ctx);
        drawOnCanvas(ctx, canvasState);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasState, drawOnCanvas, clearCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): DrawingPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(point);

    if (selectedTool === "pen") {
      setCurrentPath([point]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    
    // Emit cursor position for real-time tracking
    if (onCursorMove) {
      onCursorMove(point.x, point.y);
    }

    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (selectedTool === "pen") {
      setCurrentPath(prev => [...prev, point]);
      
      // Draw current path
      clearCanvas(ctx);
      drawOnCanvas(ctx, canvasState);
      
      // Draw current stroke
      if (currentPath.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    } else if (startPoint) {
      // Preview shape while drawing
      clearCanvas(ctx);
      drawOnCanvas(ctx, canvasState);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      drawShape(ctx, selectedTool, startPoint, point);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const point = getMousePos(e);
    setIsDrawing(false);

    if (selectedTool === "pen" && currentPath.length > 1) {
      const newPath: DrawingPath = {
        points: [...currentPath, point],
        color,
        width: lineWidth,
      };
      
      onCanvasChange({
        ...canvasState,
        paths: [...(canvasState.paths || []), newPath],
      });
    } else if (startPoint && selectedTool !== "pen" && selectedTool !== "emoji" && selectedTool !== "move") {
      const newShape: Shape = {
        type: selectedTool as Shape["type"],
        start: startPoint,
        end: point,
        color,
        width: lineWidth,
      };
      
      onCanvasChange({
        ...canvasState,
        shapes: [...(canvasState.shapes || []), newShape],
      });
    }

    setCurrentPath([]);
    setStartPoint(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "emoji") {
      const point = getMousePos(e);
      const newEmoji: EmojiElement = {
        id: `emoji-${Date.now()}`,
        emoji: selectedEmoji,
        position: point,
        size: 24,
      };
      
      onCanvasChange({
        ...canvasState,
        emojis: [...(canvasState.emojis || []), newEmoji],
      });
    }
  };

  const drawShape = (ctx: CanvasRenderingContext2D, tool: string, start: DrawingPoint, end: DrawingPoint) => {
    ctx.beginPath();
    
    switch (tool) {
      case "rectangle":
        ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case "circle":
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        break;
      case "line":
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        break;
      case "triangle":
        const midX = (start.x + end.x) / 2;
        ctx.moveTo(midX, start.y);
        ctx.lineTo(start.x, end.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        break;
      case "arrow":
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        
        // Draw arrowhead
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        ctx.lineTo(
          end.x - arrowLength * Math.cos(angle - arrowAngle),
          end.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - arrowLength * Math.cos(angle + arrowAngle),
          end.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        break;
      case "star":
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        const outerRadius = Math.abs(end.x - start.x) / 2;
        const innerRadius = outerRadius * 0.4;
        
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = centerX + radius * Math.cos(angle - Math.PI / 2);
          const y = centerY + radius * Math.sin(angle - Math.PI / 2);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        break;
    }
    
    ctx.stroke();
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      />
      
      {/* Render other users' cursors */}
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute pointer-events-none z-10"
          style={{
            left: cursor.x - 6,
            top: cursor.y - 6,
          }}
        >
          <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md">
            <div className="absolute left-4 top-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              User {userId.slice(-4)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}