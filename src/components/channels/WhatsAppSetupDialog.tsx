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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Smartphone, Key, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { ChannelConnection } from "@/pages/ChannelSettings";
import { toast } from "sonner";
import {
  createWhatsAppChannel,
  extractChannelIdFromResponse,
} from "@/services/channel/channelService";

const whatsappSchema = z.object({
  name: z.string().min(2, "Name is required"),
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
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      name: "",
      phoneNumberId: "",
      whatsAppBusinessAccountId: "",
      accessToken: "",
    },
  });

  const resetAndClose = () => {
    setStep(1);
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: WhatsAppFormValues) => {
    setIsLoading(true);

    const { data, error } = await createWhatsAppChannel({
      type: 1,
      name: values.name,
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
      name: values.name,
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
          setStep(1);
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

        <Tabs value={`step-${step}`} className="mt-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6 px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s
                      ? "bg-[#25D366] text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-0.5 w-16 md:w-24 mx-2 transition-all ${
                      step > s ? "bg-[#25D366]" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="step-1" className="mt-0 space-y-4">
                <div className="text-center py-4">
                  <Smartphone className="h-12 w-12 mx-auto text-[#25D366] mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{t("channels.whatsapp.step1Title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("channels.whatsapp.step1Description")}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("channels.whatsapp.channelName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("channels.whatsapp.channelNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("channels.whatsapp.phoneNumberId")}</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789012345" {...field} />
                      </FormControl>
                      <FormDescription>{t("channels.whatsapp.phoneNumberIdHint")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  onClick={() => setStep(2)}
                >
                  {t("common.continue")}
                  <ArrowRight className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
                </Button>
              </TabsContent>

              <TabsContent value="step-2" className="mt-0 space-y-4">
                <div className="text-center py-4">
                  <Key className="h-12 w-12 mx-auto text-[#25D366] mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{t("channels.whatsapp.step2Title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("channels.whatsapp.step2Description")}
                  </p>
                </div>

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
                        <Input type="password" placeholder={t("channels.whatsapp.accessTokenPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    {t("common.back")}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                    onClick={() => setStep(3)}
                  >
                    {t("common.continue")}
                    <ArrowRight className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="step-3" className="mt-0 space-y-4">
                <div className="text-center py-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-[#25D366] mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{t("channels.whatsapp.step3Title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("channels.whatsapp.step3Description")}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("channels.whatsapp.channelName")}:</span>
                    <span className="font-medium">{form.watch("name") || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("channels.whatsapp.phoneNumberId")}:</span>
                    <span className="font-medium">{form.watch("phoneNumberId") || "-"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    {t("common.back")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
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
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
