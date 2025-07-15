import { Button } from "@/components/ui/button";

interface ToolbarProps {
  // Add any toolbar-specific props here
}

export default function Toolbar({}: ToolbarProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-white border-b border-gray-200">
      {/* Toolbar content can be added here */}
    </div>
  );
}