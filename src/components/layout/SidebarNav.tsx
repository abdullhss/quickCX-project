import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Inbox, BarChart3, Users, Settings, Headphones, 
  Zap, Bell, ChevronDown, LogOut, Moon, Sun, Globe, MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SidebarNav = ({ activeTab, onTabChange }: SidebarNavProps) => {
  const { t, i18n } = useTranslation();
  const { profile, signOut , loading } = useAuth();
  console.log(profile);
  
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavItems = [
    { id: "inbox", label: t("nav.inbox"), icon: Inbox, badge: 24 },
    { id: "analytics", label: t("nav.analytics"), icon: BarChart3 },
    { id: "customers", label: t("nav.customers"), icon: Users },
    { id: "automation", label: t("nav.automation"), icon: Zap },
    { id: "channels", label: t("channels.title"), icon: MessageSquare, route: "/channels" },
  ];

  const bottomNavItems = [
    { id: "settings", label: t("common.settings"), icon: Settings, route: "/settings" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("auth.signedOut"));
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  if (loading) return null;
  return (
    <div className="w-16 lg:w-64 h-full flex flex-col bg-sidebar border-e border-sidebar-border shadow-lg">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md glow">
            <Headphones className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-sidebar-foreground">{t("branding.appName")}</h1>
            <p className="text-xs text-muted-foreground">{t("branding.tagline")}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = item.route ? location.pathname === item.route : activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.route) {
                  navigate(item.route);
                } else {
                  if (location.pathname !== "/") navigate("/");
                  onTabChange(item.id);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive && "text-primary"
              )} />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {item.badge && (
                <span className="hidden lg:flex ms-auto items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = item.route ? location.pathname === item.route : false;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.route) {
                  navigate(item.route);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive && "text-primary"
              )} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8 border-2 border-primary/20 shadow-sm">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block flex-1 text-start">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile?.job_title || "Agent"}
                </p>
              </div>
              <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Bell className="h-4 w-4 me-2" />
              {t("common.notifications")}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-4 w-4 me-2" />
              ) : (
                <Moon className="h-4 w-4 me-2" />
              )}
              {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Globe className="h-4 w-4 me-2" />
                {t("common.language")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  English {i18n.language === "en" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("ar")}>
                  العربية {i18n.language === "ar" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 me-2" />
              {t("common.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
