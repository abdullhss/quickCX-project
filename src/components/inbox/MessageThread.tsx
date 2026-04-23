import { useRef, useEffect } from "react";
import { MessageBubble, Message } from "./MessageBubble";

interface MessageThreadProps {
  messages: Message[];
}

export const MessageThread = ({ messages }: MessageThreadProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  messages.forEach((message) => {
    const messageDate = message.timestamp.includes(" · ")
      ? message.timestamp.split(" · ")[0]
      : message.timestamp.split(" ")[0] || "Today";
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: messageDate, messages: [] });
    }
    groupedMessages[groupedMessages.length - 1].messages.push(message);
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {groupedMessages.map((group) => (
        <div key={group.date} className="space-y-4">
          {/* Date Separator */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground px-2">
              {group.date}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Messages */}
          {group.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
