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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Smartphone, Key, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { ChannelConnection } from "@/pages/ChannelSettings";
import { toast } from "sonner";

const whatsappSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  apiKey: z.string().min(10, "API key is required"),
  apiSecret: z.string().min(10, "API secret is required"),
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
      businessName: "",
      phoneNumber: "",
      apiKey: "",
      apiSecret: "",
    },
  });

  const onSubmit = async (values: WhatsAppFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newConnection: ChannelConnection = {
      id: `whatsapp-${Date.now()}`,
      channel: "whatsapp",
      name: values.businessName,
      identifier: values.phoneNumber,
      status: "connected",
      connectedAt: new Date().toISOString(),
    };
    
    onConnect(newConnection);
    setIsLoading(false);
    setStep(1);
    form.reset();
    onOpenChange(false);
    toast.success(t("channels.whatsapp.connectSuccess"));
  };

  const handleClose = () => {
    setStep(1);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("channels.whatsapp.businessName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("channels.whatsapp.businessNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("channels.whatsapp.phoneNumber")}</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormDescription>{t("channels.whatsapp.phoneNumberHint")}</FormDescription>
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
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("channels.whatsapp.apiKey")}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="sk_live_..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("channels.whatsapp.apiSecret")}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="whsec_..." {...field} />
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
                    <span className="text-muted-foreground">{t("channels.whatsapp.businessName")}:</span>
                    <span className="font-medium">{form.watch("businessName") || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("channels.whatsapp.phoneNumber")}:</span>
                    <span className="font-medium">{form.watch("phoneNumber") || "-"}</span>
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
                        {t("common.connecting")}
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
