import { useState, useEffect, useCallback } from "react";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ConversationList } from "@/components/inbox/ConversationList";
import { ChatView, EmptyChatView } from "@/components/inbox/ChatView";
import { CustomerSidebar } from "@/components/inbox/CustomerSidebar";
import { StatsBar } from "@/components/inbox/StatsBar";
import { mockConversations as initialConversations, mockMessages, mockCustomers } from "@/data/mockData";
import { Message } from "@/components/inbox/MessageBubble";
import { Conversation, ConversationStatus } from "@/components/inbox/ConversationItem";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>("1");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const { toast } = useToast();

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  
  const selectedCustomer = selectedConversationId 
    ? mockCustomers[selectedConversationId] 
    : null;

  const currentMessages = selectedConversationId 
    ? messages[selectedConversationId] || [] 
    : [];

  const handleSendMessage = (content: string) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isFromCustomer: false,
      status: "sent",
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
    }));

    // Update conversation's last message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? {
              ...c,
              lastMessage: content,
              timestamp: "Just now",
            }
          : c
      )
    );
  };

  const handleStatusChange = useCallback((conversationId: string, newStatus: ConversationStatus) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, status: newStatus }
          : c
      )
    );

    toast({
      title: newStatus === "closed" ? "Conversation closed" : "Conversation reopened",
      description: newStatus === "closed" 
        ? "This conversation has been marked as closed." 
        : "This conversation is now open again.",
    });
  }, [toast]);

  // Simulate incoming message (real-time)
  useEffect(() => {
    const simulateIncomingMessage = () => {
      const randomConversation = conversations[Math.floor(Math.random() * conversations.length)];
      
      if (randomConversation) {
        const newMessage: Message = {
          id: `m${Date.now()}`,
          content: "Hi, I have a follow-up question about my order.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isFromCustomer: true,
        };

        setMessages((prev) => ({
          ...prev,
          [randomConversation.id]: [...(prev[randomConversation.id] || []), newMessage],
        }));

        // Update conversation and reopen if closed
        setConversations((prev) =>
          prev.map((c) =>
            c.id === randomConversation.id
              ? {
                  ...c,
                  lastMessage: newMessage.content,
                  timestamp: "Just now",
                  unreadCount: c.unreadCount + 1,
                  status: "open", // Reopen if closed
                }
              : c
          )
        );

        if (randomConversation.id !== selectedConversationId) {
          toast({
            title: `New message from ${randomConversation.customerName}`,
            description: newMessage.content.slice(0, 50) + "...",
          });
        }
      }
    };

    // Simulate every 30 seconds for demo
    const interval = setInterval(simulateIncomingMessage, 30000);
    return () => clearInterval(interval);
  }, [conversations, selectedConversationId, toast]);

  // Clear unread count when selecting a conversation
  useEffect(() => {
    if (selectedConversationId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    }
  }, [selectedConversationId]);

  return (
    <>
      <Helmet>
        <title>SupportHub - Unified Customer Support Inbox</title>
        <meta name="description" content="Manage all customer communications in one place. AI-powered support platform for e-commerce businesses." />
      </Helmet>

      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar Navigation */}
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Stats Bar */}
          <StatsBar />

          {/* Inbox Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversation List */}
            <div className="w-80 lg:w-96 flex-shrink-0">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
              />
            </div>

            {/* Chat View */}
            <div className="flex-1 min-w-0">
              {selectedConversation ? (
                <ChatView
                  customerName={selectedConversation.customerName}
                  customerAvatar={selectedConversation.customerAvatar}
                  channel={selectedConversation.channel}
                  isOnline={selectedConversation.isOnline}
                  lastSeen="2 hours ago"
                  messages={currentMessages}
                  status={selectedConversation.status}
                  onSendMessage={handleSendMessage}
                  onStatusChange={(status) => handleStatusChange(selectedConversationId!, status)}
                />
              ) : (
                <EmptyChatView />
              )}
            </div>

            {/* Customer Sidebar */}
            {selectedCustomer && (
              <CustomerSidebar customer={selectedCustomer} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
