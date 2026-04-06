import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield } from "lucide-react";

const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <>
      <Helmet>
        <title>{t("settings.pageTitle")} - SupportHub</title>
        <meta name="description" content={t("settings.pageDescription")} />
      </Helmet>

      <div className="flex h-screen bg-background overflow-hidden">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">{t("settings.title")}</h1>
              <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("settings.profile")}
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t("settings.account")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileSettings />
              </TabsContent>

              <TabsContent value="account">
                <AccountSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
