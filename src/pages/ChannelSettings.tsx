import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { WhatsAppSetupDialog } from "@/components/channels/WhatsAppSetupDialog";
import { EmailSetupDialog } from "@/components/channels/EmailSetupDialog";
import { LanguageThemeToggle } from "@/components/LanguageThemeToggle";
import { MessageCircle, Mail, CheckCircle2, Clock, Activity } from "lucide-react";

export interface ChannelConnection {
  id: string;
  channel: "whatsapp" | "email";
  name: string;
  identifier: string;
  status: "connected" | "disconnected" | "pending";
  connectedAt?: string;
}

const ChannelSettings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("settings");
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  
  const [connections, setConnections] = useState<ChannelConnection[]>([]);

  const getConnectionsByChannel = (channel: ChannelConnection["channel"]) => {
    return connections.filter(c => c.channel === channel);
  };

  const handleAddConnection = (connection: ChannelConnection) => {
    setConnections(prev => [...prev, connection]);
  };

  const handleRemoveConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const whatsappConnections = getConnectionsByChannel("whatsapp");
  const emailConnections = getConnectionsByChannel("email");

  const stats = [
    {
      label: t("channels.connected"),
      value: connections.filter(c => c.status === "connected").length,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: t("channels.pending"),
      value: connections.filter(c => c.status === "pending").length,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: t("channels.total"),
      value: connections.length,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t("channels.pageTitle")} - SupportHub</title>
        <meta name="description" content={t("channels.pageDescription")} />
      </Helmet>

      <div className="flex h-screen bg-background overflow-hidden">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {t("channels.title")}
                </h1>
                <p className="text-muted-foreground mt-1.5">
                  {t("channels.subtitle")}
                </p>
              </div>
              <LanguageThemeToggle />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stats.map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="stat-card flex items-center gap-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`h-14 w-14 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-7 w-7 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Channel Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChannelCard
                  channel="whatsapp"
                  icon={MessageCircle}
                  title="WhatsApp Business"
                  description={t("channels.whatsapp.description")}
                  connections={whatsappConnections}
                  onConnect={() => setWhatsappOpen(true)}
                  onRemove={handleRemoveConnection}
                  color="bg-[#25D366]"
                />

                <ChannelCard
                  channel="email"
                  icon={Mail}
                  title="Email"
                  description={t("channels.email.description")}
                  connections={emailConnections}
                  onConnect={() => setEmailOpen(true)}
                  onRemove={handleRemoveConnection}
                  color="bg-channel-email"
                />
              </div>

              {/* Help Section */}
              <div className="card-premium p-8">
                <h3 className="font-semibold text-foreground text-lg mb-3">
                  {t("channels.help.title")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("channels.help.description")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="h-10 w-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("channels.whatsapp.helpTitle")}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t("channels.whatsapp.helpText")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="h-10 w-10 rounded-xl bg-channel-email/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-channel-email" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("channels.email.helpTitle")}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t("channels.email.helpText")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WhatsAppSetupDialog
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
        onConnect={handleAddConnection}
      />
      <EmailSetupDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onConnect={handleAddConnection}
      />
    </>
  );
};

export default ChannelSettings;