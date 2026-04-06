import { 
  User, Mail, Phone, MapPin, Calendar, Package, 
  CreditCard, ExternalLink, Tag, Clock, ShoppingBag,
  TrendingUp, AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  memberSince: string;
  totalOrders: number;
  totalSpent: string;
  avgOrderValue: string;
  lifetimeValue: string;
  tags: string[];
  recentOrders: {
    id: string;
    date: string;
    total: string;
    status: "delivered" | "processing" | "shipped" | "cancelled";
  }[];
  notes?: string;
}

interface CustomerSidebarProps {
  customer: CustomerData;
}

const statusColors: Record<string, string> = {
  delivered: "bg-success/20 text-success border-success/30",
  processing: "bg-warning/20 text-warning border-warning/30",
  shipped: "bg-channel-email/20 text-channel-email border-channel-email/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export const CustomerSidebar = ({ customer }: CustomerSidebarProps) => {
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-80 h-full border-l border-border bg-card overflow-y-auto">
      {/* Customer Header */}
      <div className="p-6 text-center border-b border-border">
        <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-secondary">
          <AvatarImage src={customer.avatar} alt={customer.name} />
          <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-bold text-foreground mb-1">{customer.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">Customer since {customer.memberSince}</p>
        
        <div className="flex flex-wrap gap-1.5 justify-center">
          {customer.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 border-b border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Contact Information
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground truncate">{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{customer.phone}</span>
            </div>
          )}
          {customer.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{customer.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Customer Stats */}
      <div className="p-4 border-b border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Customer Value
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Orders</span>
            </div>
            <span className="text-lg font-bold text-foreground">{customer.totalOrders}</span>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Spent</span>
            </div>
            <span className="text-lg font-bold text-foreground">{customer.totalSpent}</span>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Order</span>
            </div>
            <span className="text-lg font-bold text-foreground">{customer.avgOrderValue}</span>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-primary">LTV</span>
            </div>
            <span className="text-lg font-bold text-primary">{customer.lifetimeValue}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Orders
          </h4>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary">
            View All
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="space-y-2">
          {customer.recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-foreground">#{order.id}</p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{order.total}</p>
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px] capitalize", statusColors[order.status])}
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      {customer.notes && (
        <div className="p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Notes
          </h4>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm text-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <p>{customer.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <Button className="w-full" variant="outline">
          <User className="h-4 w-4 mr-2" />
          View Full Profile
        </Button>
      </div>
    </div>
  );
};
