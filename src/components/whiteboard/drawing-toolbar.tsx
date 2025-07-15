import { Button } from "@/components/ui/button";
import { 
  Pen, 
  Square, 
  Circle, 
  Minus, 
  Triangle, 
  ArrowRight, 
  Star,
  Smile,
  Move
} from "lucide-react";

interface DrawingToolbarProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  onToggleEmojiPicker: () => void;
}

export default function DrawingToolbar({
  selectedTool,
  onToolSelect,
  onToggleEmojiPicker,
}: DrawingToolbarProps) {
  const tools = [
    { id: "pen", icon: Pen, label: "Pen" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "triangle", icon: Triangle, label: "Triangle" },
    { id: "arrow", icon: ArrowRight, label: "Arrow" },
    { id: "star", icon: Star, label: "Star" },
    { id: "move", icon: Move, label: "Move" },
  ];

  return (
    <>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "outline"}
            size="sm"
            className={`w-12 h-12 p-2 ${
              selectedTool === tool.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
          >
            <Icon className="w-5 h-5" />
          </Button>
        );
      })}
      
      <Button
        variant={selectedTool === "emoji" ? "default" : "outline"}
        size="sm"
        className={`w-12 h-12 p-2 ${
          selectedTool === "emoji"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
        }`}
        onClick={onToggleEmojiPicker}
        title="Emoji"
      >
        <Smile className="w-5 h-5" />
      </Button>
    </>
  );
}