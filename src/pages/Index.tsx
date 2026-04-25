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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  extractWhatsAppRecipientFromDetail,
  extractConversationsArray,
  getConversations,
  getConversationMessages,
  isConversationsEnvelopeFailed,
  mapConversationDto,
  mapDetailPayloadToMessages,
  updateConversationStatus,
  readApiEnvelopeMessage,
  sendEmailReply,
  sendWhatsAppMessage,
} from "@/services/conversation/conversationService";

const Index = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>("1");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [usingApiConversations, setUsingApiConversations] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [whatsAppRecipientsByConversation, setWhatsAppRecipientsByConversation] = useState<
    Record<string, string>
  >({});
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  
  const selectedCustomer = selectedConversationId 
    ? mockCustomers[selectedConversationId] 
    : null;

  const currentMessages = selectedConversationId 
    ? messages[selectedConversationId] || [] 
    : [];

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;
    const trimmed = content.trim();
    if (!trimmed) return;

    if (usingApiConversations && selectedConversation) {
      if (selectedConversation.channel === "email") {
        const { error } = await sendEmailReply({
          conversationId: selectedConversationId,
          body: trimmed,
        });
        if (error) {
          toast({
            variant: "destructive",
            title: "Could not send email reply",
            description: error.message,
          });
          return;
        }
      } else {
        const to = whatsAppRecipientsByConversation[selectedConversationId];
        if (!to) {
          toast({
            variant: "destructive",
            title: "Could not send WhatsApp message",
            description:
              "Recipient number is missing for this conversation. Open another message in this conversation and try again.",
          });
          return;
        }

        const { error } = await sendWhatsAppMessage({
          to,
          body: trimmed,
        });
        if (error) {
          toast({
            variant: "destructive",
            title: "Could not send WhatsApp message",
            description: error.message,
          });
          return;
        }
      }
    }

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content: trimmed,
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
              lastMessage: trimmed,
              timestamp: "Just now",
            }
          : c
      )
    );
  };

  const handleStatusChange = useCallback(
    async (conversationId: string, newStatus: ConversationStatus) => {
      if (usingApiConversations) {
        const { error } = await updateConversationStatus(conversationId, newStatus);
        if (error) {
          toast({
            variant: "destructive",
            title:
              newStatus === "closed"
                ? "Could not close conversation"
                : "Could not reopen conversation",
            description: error.message,
          });
          return;
        }
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, status: newStatus } : c))
      );

      toast({
        title: newStatus === "closed" ? "Conversation closed" : "Conversation reopened",
        description:
          newStatus === "closed"
            ? "This conversation has been marked as closed."
            : "This conversation is now open again.",
      });
    },
    [toast, usingApiConversations]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoadingConversations(true);
      try {
        const { data, error } = await getConversations({ pageSize: 50 });
        if (cancelled) return;

        if (error || data == null) {
          if (error) {
            toast({
              variant: "destructive",
              title: "Could not load conversations",
              description: error.message,
            });
          }
          return;
        }

        if (isConversationsEnvelopeFailed(data)) {
          toast({
            variant: "destructive",
            title: "Could not load conversations",
            description: readApiEnvelopeMessage(data) ?? "The server reported a failed response.",
          });
          return;
        }

        const raw = extractConversationsArray(data);
        const mapped = raw
          .map((item) => mapConversationDto(item))
          .filter((c): c is Conversation => c != null);

        if (cancelled || mapped.length === 0) return;

        setConversations(mapped);
        setUsingApiConversations(true);
        setSelectedConversationId((prev) => {
          if (prev && mapped.some((c) => c.id === prev)) return prev;
          return mapped[0]?.id ?? null;
        });
      } finally {
        if (!cancelled) setIsLoadingConversations(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  useEffect(() => {
    if (!usingApiConversations || !selectedConversationId) return;

    let cancelled = false;
    void (async () => {
      const { data, error } = await getConversationMessages(selectedConversationId, {
        pageNumber: 1,
        pageSize: 50,
      });
      if (cancelled || error || data == null) return;
      if (isConversationsEnvelopeFailed(data)) return;

      const threadMessages = mapDetailPayloadToMessages(data);
      const whatsAppRecipient = extractWhatsAppRecipientFromDetail(data);
      if (cancelled) return;

      if (whatsAppRecipient) {
        setWhatsAppRecipientsByConversation((prev) => ({
          ...prev,
          [selectedConversationId]: whatsAppRecipient,
        }));
      }

      setMessages((prev) => ({
        ...prev,
        [selectedConversationId]: threadMessages,
      }));
    })();

    return () => {
      cancelled = true;
    };
  }, [usingApiConversations, selectedConversationId]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // On mobile, prefer starting in the list view to avoid cramped 3-panel layout.
    setMobileView(isMobile ? "list" : "chat");
  }, [isMobile]);

  // Simulate incoming message (real-time) — demo only when not backed by the conversations API
  useEffect(() => {
    if (usingApiConversations) return;

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
  }, [conversations, selectedConversationId, toast, usingApiConversations]);

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

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    if (isMobile) setMobileView("chat");
  };

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
            <div
              className={cn(
                "flex-shrink-0 flex flex-col h-full min-h-0",
                isMobile ? "w-full" : "w-80 lg:w-96",
                isMobile && mobileView !== "list" && "hidden"
              )}
            >
              {isLoadingConversations ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                  <p className="text-sm text-center">Loading conversations…</p>
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversationId}
                  onSelectConversation={handleSelectConversation}
                />
              )}
            </div>

            {/* Chat View */}
            <div className={cn("flex-1 min-w-0 flex flex-col min-h-0", isMobile && mobileView !== "chat" && "hidden")}>
              {isLoadingConversations ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                  <p className="text-sm text-center">Loading conversations…</p>
                </div>
              ) : selectedConversation ? (
                <ChatView
                  customerName={selectedConversation.customerName}
                  customerAvatar={selectedConversation.customerAvatar}
                  channel={selectedConversation.channel}
                  isOnline={selectedConversation.isOnline}
                  lastSeen="2 hours ago"
                  messages={currentMessages}
                  status={selectedConversation.status}
                  onSendMessage={handleSendMessage}
                  onStatusChange={(status) => void handleStatusChange(selectedConversationId!, status)}
                  onBack={isMobile ? () => setMobileView("list") : undefined}
                />
              ) : (
                <EmptyChatView />
              )}
            </div>

            {/* Customer Sidebar */}
            {!isMobile && !isLoadingConversations && selectedCustomer && (
              <CustomerSidebar customer={selectedCustomer} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
