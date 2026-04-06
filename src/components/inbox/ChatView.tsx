import { ChatHeader } from "./ChatHeader";
import { MessageThread } from "./MessageThread";
import { MessageInput } from "./MessageInput";
import { Message } from "./MessageBubble";
import { Channel } from "./ChannelBadge";
import { ConversationStatus } from "./ConversationItem";
import { MessageCircle } from "lucide-react";

interface ChatViewProps {
  customerName: string;
  customerAvatar?: string;
  channel: Channel;
  isOnline?: boolean;
  lastSeen?: string;
  messages: Message[];
  status: ConversationStatus;
  onSendMessage: (message: string) => void;
  onStatusChange: (status: ConversationStatus) => void;
}

export const ChatView = ({
  customerName,
  customerAvatar,
  channel,
  isOnline,
  lastSeen,
  messages,
  status,
  onSendMessage,
  onStatusChange,
}: ChatViewProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader
        customerName={customerName}
        customerAvatar={customerAvatar}
        channel={channel}
        isOnline={isOnline}
        lastSeen={lastSeen}
        status={status}
        onStatusChange={onStatusChange}
      />
      <MessageThread messages={messages} />
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export const EmptyChatView = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-background">
      <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        <MessageCircle className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Select a Conversation
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Choose a conversation from the inbox to start messaging. All your customer communications are unified here.
      </p>
    </div>
  );
};
