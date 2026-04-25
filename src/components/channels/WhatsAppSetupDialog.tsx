import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { ChannelConnection } from "@/pages/ChannelSettings";
import { toast } from "sonner";
import {
  createWhatsAppChannel,
  extractChannelIdFromResponse,
} from "@/services/channel/channelService";

const whatsappSchema = z.object({
  phoneNumberId: z.string().min(1, "Phone number ID is required"),
  whatsAppBusinessAccountId: z.string().min(1, "WhatsApp Business Account ID is required"),
  accessToken: z.string().min(10, "Access token is required"),
});

type WhatsAppFormValues = z.infer<typeof whatsappSchema>;

interface WhatsAppSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (connection: ChannelConnection) => void;
}

export const WhatsAppSetupDialog = ({
  open,
  onOpenChange,
  onConnect,
}: WhatsAppSetupDialogProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      phoneNumberId: "",
      whatsAppBusinessAccountId: "",
      accessToken: "",
    },
  });

  const resetAndClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: WhatsAppFormValues) => {
    setIsLoading(true);

    const { data, error } = await createWhatsAppChannel({
      phoneNumberId: values.phoneNumberId,
      whatsAppBusinessAccountId: values.whatsAppBusinessAccountId,
      accessToken: values.accessToken,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message || t("channels.setup.error"));
      return;
    }

    const channelId =
      extractChannelIdFromResponse(data) ?? `whatsapp-${Date.now()}`;

    const newConnection: ChannelConnection = {
      id: channelId,
      channel: "whatsapp",
      name: "WhatsApp Business",
      identifier: values.phoneNumberId,
      status: "connected",
      connectedAt: new Date().toISOString(),
    };

    onConnect(newConnection);
    resetAndClose();
    toast.success(t("channels.whatsapp.connectSuccess"));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          form.reset();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-[#25D366] flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>{t("channels.whatsapp.setupTitle")}</DialogTitle>
              <DialogDescription>{t("channels.whatsapp.setupDescription")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="phoneNumberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("channels.whatsapp.phoneNumberId")}</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsAppBusinessAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("channels.whatsapp.wabaId")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("channels.whatsapp.wabaIdPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("channels.whatsapp.accessToken")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("channels.whatsapp.accessTokenPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
                  {t("channels.setup.connecting")}
                </>
              ) : (
                t("channels.connect")
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
