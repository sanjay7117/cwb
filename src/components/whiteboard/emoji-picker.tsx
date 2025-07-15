import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({
  isOpen,
  onClose,
  onEmojiSelect,
}: EmojiPickerProps) {
  const emojis = [
    "😊", "😂", "😍", "🤔", "😎", "😢", "😡", "🤯",
    "👍", "👎", "👌", "✌️", "🤝", "👏", "🙌", "💪",
    "❤️", "💔", "💯", "🔥", "⭐", "✨", "🎉", "🎊",
    "🚀", "💡", "⚡", "🌟", "🎯", "🏆", "🎨", "📝",
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Select Emoji</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </Button>
      </div>
      
      <div className="grid grid-cols-8 gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            className="w-8 h-8 text-lg hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}