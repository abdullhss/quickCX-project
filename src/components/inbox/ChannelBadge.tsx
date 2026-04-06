import { MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export type Channel = "whatsapp" | "email";

interface ChannelBadgeProps {
  channel: Channel;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const channelConfig: Record<Channel, { icon: typeof MessageCircle; label: string; colorClass: string }> = {
  whatsapp: {
    icon: MessageCircle,
    label: "WhatsApp",
    colorClass: "bg-channel-whatsapp/20 text-channel-whatsapp border-channel-whatsapp/30",
  },
  email: {
    icon: Mail,
    label: "Email",
    colorClass: "bg-channel-email/20 text-channel-email border-channel-email/30",
  },
};

export const ChannelBadge = ({ channel, size = "sm", showLabel = false }: ChannelBadgeProps) => {
  const config = channelConfig[channel];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all duration-200",
        config.colorClass,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};
