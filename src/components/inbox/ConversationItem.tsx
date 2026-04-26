import { cn } from "@/lib/utils";
import { ChannelBadge, Channel } from "./ChannelBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Circle, CheckCircle2 } from "lucide-react";

export type ConversationStatus = "open" | "closed";

export interface Conversation {
  id: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  timestamp: string;
  channel: Channel;
  unreadCount: number;
  isOnline?: boolean;
  priority?: "high" | "medium" | "low";
  status: ConversationStatus;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem = ({ conversation, isSelected, onClick }: ConversationItemProps) => {
  const initials = conversation.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-border/50",
        "hover:bg-secondary/50",
        isSelected && "bg-secondary border-l-2 border-l-primary"
      )}
    >
      {/* Priority Indicator */}
      {conversation.priority === "high" && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-destructive rounded-r-full" />
      )}

      {/* Avatar with Online Status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-11 w-11 border-2 border-border">
          <AvatarImage src={conversation.customerAvatar} alt={conversation.customerName} />
          <AvatarFallback className="bg-secondary text-foreground font-medium text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        {conversation.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card animate-pulse-soft" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className={cn(
              "font-semibold text-sm truncate",
              conversation.unreadCount > 0 ? "text-foreground" : "text-foreground/80"
            )}>
              {conversation.customerName}
            </h4>
            {conversation.status === "closed" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            ) : conversation.unreadCount > 0 ? (
              <Circle className="h-3 w-3 text-success fill-success flex-shrink-0" />
            ) : null}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {conversation.timestamp}
          </span>
        </div>

        <p className={cn(
          "text-sm truncate mb-2",
          conversation.unreadCount > 0 ? "text-foreground/90 font-medium" : "text-muted-foreground"
        )}>
          {conversation.lastMessage}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ChannelBadge channel={conversation.channel} />
            {conversation.status === "closed" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground border-muted">
                Closed
              </Badge>
            )}
          </div>
          {conversation.unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
