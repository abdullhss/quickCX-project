import { Phone, Video, Star, Archive, MoreHorizontal, CheckCircle, Circle, ChevronDown, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChannelBadge, Channel } from "./ChannelBadge";
import { ConversationStatus } from "./ConversationItem";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatHeaderProps {
  customerName: string;
  customerAvatar?: string;
  channel: Channel;
  isOnline?: boolean;
  lastSeen?: string;
  status: ConversationStatus;
  onStatusChange: (status: ConversationStatus) => void;
  onBack?: () => void;
}

export const ChatHeader = ({
  customerName,
  customerAvatar,
  channel,
  isOnline,
  lastSeen,
  status,
  onStatusChange,
  onBack,
}: ChatHeaderProps) => {
  const initials = customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      {/* Customer Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="relative">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-border">
            <AvatarImage src={customerAvatar} alt={customerName} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{customerName}</h3>
            <ChannelBadge channel={channel} showLabel />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {isOnline ? (
              <span className="text-success">Online now</span>
            ) : (
              `Last seen ${lastSeen}`
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Status Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-2 h-9",
                status === "open" 
                  ? "border-success/50 text-success hover:text-success hover:border-success" 
                  : "border-muted text-muted-foreground"
              )}
            >
              {status === "open" ? (
                <>
                  <Circle className="h-3 w-3 fill-success" />
                  <span className="hidden sm:inline">Open</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Closed</span>
                </>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => onStatusChange("open")}
              className="gap-2"
            >
              <Circle className="h-3.5 w-3.5 fill-success text-success" />
              Mark as Open
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onStatusChange("closed")}
              className="gap-2"
            >
              <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
              Mark as Closed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:block w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Call</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
              <Video className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Video Call</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
              <Star className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Star</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
              <Archive className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Archive</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View customer profile</DropdownMenuItem>
            <DropdownMenuItem>Assign to agent</DropdownMenuItem>
            <DropdownMenuItem>Add tags</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Block customer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
