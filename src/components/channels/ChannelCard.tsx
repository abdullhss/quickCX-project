import { useTranslation } from "react-i18next";
import { LucideIcon, Plus, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChannelConnection } from "@/pages/ChannelSettings";

interface ChannelCardProps {
  channel: "whatsapp" | "email";
  icon: LucideIcon;
  title: string;
  description: string;
  connections: ChannelConnection[];
  onConnect: () => void;
  onRemove: (id: string) => void;
  color: string;
}

export const ChannelCard = ({
  channel,
  icon: Icon,
  title,
  description,
  connections,
  onConnect,
  onRemove,
  color,
}: ChannelCardProps) => {
  const { t } = useTranslation();
  const isConnected = connections.some(c => c.status === "connected");

  const getStatusIcon = (status: ChannelConnection["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "disconnected":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ChannelConnection["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-medium">
            {t("channels.status.connected")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-medium">
            {t("channels.status.pending")}
          </Badge>
        );
      case "disconnected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
            {t("channels.status.disconnected")}
          </Badge>
        );
    }
  };

  return (
    <div className="card-premium group animate-fade-in-up">
      {/* Color Bar */}
      <div className={cn("h-1.5 w-full", color)} />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105",
              color
            )}>
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {connections.length} {t("channels.accountsConnected")}
              </p>
            </div>
          </div>
          {isConnected && (
            <div className="h-3 w-3 rounded-full bg-success animate-pulse shadow-glow" />
          )}
        </div>

        <p className="text-muted-foreground mb-5">{description}</p>

        {/* Connected Accounts */}
        {connections.length > 0 && (
          <div className="space-y-3 mb-5">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(connection.status)}
                  <div>
                    <p className="font-medium text-foreground">{connection.name}</p>
                    <p className="text-xs text-muted-foreground">{connection.identifier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(connection.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(connection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connect Button */}
        <Button
          onClick={onConnect}
          className={cn(
            "w-full h-11 gap-2 font-medium transition-all",
            connections.length > 0 
              ? "hover:border-primary" 
              : "btn-premium text-primary-foreground"
          )}
          variant={connections.length > 0 ? "outline" : "default"}
        >
          <Plus className="h-4 w-4" />
          {connections.length > 0 ? t("channels.addAnother") : t("channels.connect")}
        </Button>
      </div>
    </div>
  );
};