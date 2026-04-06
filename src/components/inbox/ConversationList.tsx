import { useState } from "react";
import { Search, Filter, MessageCircle, Mail, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConversationItem, Conversation, ConversationStatus } from "./ConversationItem";
import { Channel } from "./ChannelBadge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
}

type StatusFilter = "all" | "open" | "closed";

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
];

const channelOptions: { key: Channel; label: string; icon: typeof MessageCircle }[] = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "email", label: "Email", icon: Mail },
];

export const ConversationList = ({
  conversations,
  selectedId,
  onSelectConversation,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const clearChannelFilters = () => {
    setSelectedChannels([]);
  };

  const filteredConversations = conversations.filter((conversation) => {
    // Search filter
    const matchesSearch =
      conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      conversation.status === statusFilter;

    // Channel filter (if no channels selected, show all)
    const matchesChannel =
      selectedChannels.length === 0 ||
      selectedChannels.includes(conversation.channel);

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const openCount = conversations.filter((c) => c.status === "open").length;
  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Inbox</h2>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {openCount} open
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-secondary/50 border-border/50 focus:bg-background"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-secondary/50 rounded-lg p-1 flex-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                  statusFilter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Channel Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 gap-1.5 text-xs",
                  selectedChannels.length > 0 && "border-primary text-primary"
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                {selectedChannels.length > 0 ? (
                  <span>{selectedChannels.length}</span>
                ) : (
                  <span>Channel</span>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Filter by Channel
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {channelOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.key}
                  checked={selectedChannels.includes(option.key)}
                  onCheckedChange={() => toggleChannel(option.key)}
                  className="text-sm"
                >
                  <option.icon className="h-4 w-4 mr-2" />
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedChannels.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-muted-foreground"
                    onClick={clearChannelFilters}
                  >
                    <X className="h-3 w-3 mr-2" />
                    Clear filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Channel Filters */}
        {selectedChannels.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedChannels.map((channel) => {
              const option = channelOptions.find((o) => o.key === channel);
              return (
                <Badge
                  key={channel}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 text-xs"
                >
                  {option && <option.icon className="h-3 w-3" />}
                  {option?.label}
                  <button
                    onClick={() => toggleChannel(channel)}
                    className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {filteredConversations.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No conversations found
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
