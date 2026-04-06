import { cn } from "@/lib/utils";
import { Check, CheckCheck, Bot } from "lucide-react";

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isFromCustomer: boolean;
  status?: "sent" | "delivered" | "read";
  isAIGenerated?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isCustomer = message.isFromCustomer;

  return (
    <div
      className={cn(
        "flex w-full animate-fade-in",
        isCustomer ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
          isCustomer
            ? "bg-secondary text-foreground rounded-bl-md"
            : "bg-primary text-primary-foreground rounded-br-md"
        )}
      >
        {/* AI Badge */}
        {message.isAIGenerated && !isCustomer && (
          <div className="flex items-center gap-1 mb-2 opacity-80">
            <Bot className="h-3 w-3" />
            <span className="text-[10px] font-medium uppercase tracking-wide">
              AI Suggested
            </span>
          </div>
        )}

        {/* Message Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Timestamp and Status */}
        <div
          className={cn(
            "flex items-center gap-1.5 mt-2 text-[10px]",
            isCustomer ? "text-muted-foreground" : "text-primary-foreground/70"
          )}
        >
          <span>{message.timestamp}</span>
          {!isCustomer && message.status && (
            <span className="flex items-center">
              {message.status === "sent" && <Check className="h-3 w-3" />}
              {message.status === "delivered" && <CheckCheck className="h-3 w-3" />}
              {message.status === "read" && (
                <CheckCheck className="h-3 w-3 text-primary-foreground" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
