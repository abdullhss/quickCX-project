import { MessageCircle, Clock, TrendingUp, CheckCircle2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: typeof MessageCircle;
  iconColor?: string;
  iconBg?: string;
}

const stats: Stat[] = [
  {
    label: "Open",
    value: "24",
    change: "-12%",
    changeType: "positive",
    icon: MessageCircle,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
  {
    label: "Unread",
    value: "8",
    icon: Mail,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    label: "Avg Response",
    value: "2.4m",
    change: "-18%",
    changeType: "positive",
    icon: Clock,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
  },
  {
    label: "Resolved Today",
    value: "47",
    change: "+12",
    changeType: "positive",
    icon: CheckCircle2,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
  {
    label: "Resolution Rate",
    value: "94%",
    change: "+3%",
    changeType: "positive",
    icon: TrendingUp,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
  },
];

export const StatsBar = () => {
  return (
    <div className="flex items-center gap-3 p-4 bg-card/80 backdrop-blur-sm border-b border-border overflow-x-auto">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "stat-card flex items-center gap-3 min-w-fit animate-fade-in",
            "!p-3"
          )}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            stat.iconBg || "bg-primary/10"
          )}>
            <stat.icon className={cn("h-5 w-5", stat.iconColor || "text-primary")} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              {stat.change && (
                <span
                  className={cn(
                    "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                    stat.changeType === "positive" && "text-success bg-success/10",
                    stat.changeType === "negative" && "text-destructive bg-destructive/10",
                    stat.changeType === "neutral" && "text-muted-foreground bg-muted"
                  )}
                >
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};