import { useState } from "react";
import { Send, Paperclip, Smile, Sparkles, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isAIMode, setIsAIMode] = useState(false);

  const handleSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
      {/* Quick Actions */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setIsAIMode(!isAIMode)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
            isAIMode
              ? "bg-primary text-primary-foreground glow"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Assist
        </button>
        <span className="text-xs text-muted-foreground">
          {isAIMode ? "AI will suggest responses" : "Press Tab for AI suggestions"}
        </span>
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={cn(
              "min-h-[52px] max-h-[150px] resize-none pr-24 bg-secondary border-border",
              "focus:border-primary focus:ring-1 focus:ring-primary/20",
              isAIMode && "border-primary/50"
            )}
            rows={1}
          />

          {/* Inline Actions */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Emoji</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach File</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Mic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Message</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="h-[52px] w-[52px] rounded-xl bg-primary hover:bg-primary/90 glow disabled:opacity-50 disabled:glow-none"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
