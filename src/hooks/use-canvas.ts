import { useCallback } from "react";
import { type CanvasState, type DrawingPath, type Shape, type EmojiElement } from "@shared/schema";

export function useCanvas() {
  const clearCanvas = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Set white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, []);

  const drawOnCanvas = useCallback((ctx: CanvasRenderingContext2D, canvasState: CanvasState) => {
    // Draw paths (pen strokes)
    if (canvasState.paths) {
      canvasState.paths.forEach((path: DrawingPath) => {
        if (path.points && path.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          
          path.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          
          ctx.strokeStyle = path.color;
          ctx.lineWidth = path.width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }
      });
    }

    // Draw shapes
    if (canvasState.shapes) {
      canvasState.shapes.forEach((shape: Shape) => {
        ctx.beginPath();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        switch (shape.type) {
          case "rectangle":
            ctx.rect(shape.start.x, shape.start.y, shape.end.x - shape.start.x, shape.end.y - shape.start.y);
            break;
          case "circle":
            const radius = Math.sqrt(Math.pow(shape.end.x - shape.start.x, 2) + Math.pow(shape.end.y - shape.start.y, 2));
            ctx.arc(shape.start.x, shape.start.y, radius, 0, 2 * Math.PI);
            break;
          case "line":
            ctx.moveTo(shape.start.x, shape.start.y);
            ctx.lineTo(shape.end.x, shape.end.y);
            break;
          case "triangle":
            const midX = (shape.start.x + shape.end.x) / 2;
            ctx.moveTo(midX, shape.start.y);
            ctx.lineTo(shape.start.x, shape.end.y);
            ctx.lineTo(shape.end.x, shape.end.y);
            ctx.closePath();
            break;
          case "arrow":
            ctx.moveTo(shape.start.x, shape.start.y);
            ctx.lineTo(shape.end.x, shape.end.y);
            
            // Draw arrowhead
            const angle = Math.atan2(shape.end.y - shape.start.y, shape.end.x - shape.start.x);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;
            
            ctx.lineTo(
              shape.end.x - arrowLength * Math.cos(angle - arrowAngle),
              shape.end.y - arrowLength * Math.sin(angle - arrowAngle)
            );
            ctx.moveTo(shape.end.x, shape.end.y);
            ctx.lineTo(
              shape.end.x - arrowLength * Math.cos(angle + arrowAngle),
              shape.end.y - arrowLength * Math.sin(angle + arrowAngle)
            );
            break;
          case "star":
            const centerX = (shape.start.x + shape.end.x) / 2;
            const centerY = (shape.start.y + shape.end.y) / 2;
            const outerRadius = Math.abs(shape.end.x - shape.start.x) / 2;
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
      });
    }

    // Draw emojis
    if (canvasState.emojis) {
      canvasState.emojis.forEach((emoji: EmojiElement) => {
        ctx.font = `${emoji.size}px Arial`;
        ctx.fillText(emoji.emoji, emoji.position.x, emoji.position.y);
      });
    }
  }, []);

  return { drawOnCanvas, clearCanvas };
}