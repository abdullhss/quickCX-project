import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ChannelConnection } from "@/pages/ChannelSettings";

interface EmailSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (connection: ChannelConnection) => void;
}

export const EmailSetupDialog = ({
  open,
  onOpenChange,
  onConnect,
}: EmailSetupDialogProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailAddress: "",
    imapHost: "",
    imapPort: "",
    smtpHost: "",
    smtpPort: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newConnection: ChannelConnection = {
      id: crypto.randomUUID(),
      channel: "email",
      name: formData.emailAddress.split("@")[0],
      identifier: formData.emailAddress,
      status: "connected",
      connectedAt: new Date().toISOString(),
    };

    onConnect(newConnection);
    setIsLoading(false);
    onOpenChange(false);
    toast.success(t("channels.setup.success"));

    // Reset form
    setFormData({
      emailAddress: "",
      imapHost: "",
      imapPort: "",
      smtpHost: "",
      smtpPort: "",
      password: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>{t("channels.setup.emailTitle")}</DialogTitle>
              <DialogDescription>
                {t("channels.setup.emailDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailAddress">{t("channels.setup.emailAddress")}</Label>
            <Input
              id="emailAddress"
              type="email"
              placeholder={t("channels.setup.emailAddressPlaceholder")}
              value={formData.emailAddress}
              onChange={(e) =>
                setFormData({ ...formData, emailAddress: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imapHost">{t("channels.setup.imapHost")}</Label>
              <Input
                id="imapHost"
                placeholder={t("channels.setup.imapHostPlaceholder")}
                value={formData.imapHost}
                onChange={(e) =>
                  setFormData({ ...formData, imapHost: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imapPort">{t("channels.setup.imapPort")}</Label>
              <Input
                id="imapPort"
                placeholder="993"
                value={formData.imapPort}
                onChange={(e) =>
                  setFormData({ ...formData, imapPort: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">{t("channels.setup.smtpHost")}</Label>
              <Input
                id="smtpHost"
                placeholder={t("channels.setup.smtpHostPlaceholder")}
                value={formData.smtpHost}
                onChange={(e) =>
                  setFormData({ ...formData, smtpHost: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">{t("channels.setup.smtpPort")}</Label>
              <Input
                id="smtpPort"
                placeholder="587"
                value={formData.smtpPort}
                onChange={(e) =>
                  setFormData({ ...formData, smtpPort: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("channels.setup.emailPassword")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t("channels.setup.cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? t("channels.setup.connecting") : t("channels.setup.connectEmail")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
