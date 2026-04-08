import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuth, selectIsApiAuthenticated } from "@/store/authSlice";
import { saveAuthSession } from "@/lib/authStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signinService } from "@/services/authServices/loginService";
import { signupService } from "@/services/authServices/signupService";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Mail, Lock, User, MessageSquare, Sparkles, Shield, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { LanguageThemeToggle } from "@/components/LanguageThemeToggle";
import { cn } from "@/lib/utils";


const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SigninResponseData = {
  AccessToken: string;
  refreshToken: {
    Email: string;
    TokenString: string;
    ExpireAt: string;
  };
};

type ApiEnvelope<T> = {
  Succeeded?: boolean;
  StatusCode?: number;
  Data?: T;
  Message?: string;
};

const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user, profile, loading } = useAuth();
  const isApiAuth = useAppSelector(selectIsApiAuthenticated);
  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (profile?.onboarding_completed) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    } else if (isApiAuth) {
      if (profile?.onboarding_completed) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, profile, loading, navigate, isApiAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await signinService({ email: loginEmail, password: loginPassword });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const envelope = data as ApiEnvelope<SigninResponseData> | undefined;
    const payload = envelope?.Data;

    if (envelope?.Succeeded && payload?.AccessToken && payload?.refreshToken) {
      const session = {
        accessToken: payload.AccessToken,
        refreshToken: payload.refreshToken,
      };
      dispatch(setAuth(session));
      saveAuthSession(session);
      toast.success(t("auth.welcomeBack") + "!");
    } else {
      toast.error(envelope?.Message ?? t("auth.signIn") + " failed");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse({
      fullName: signupName,
      email: signupEmail,
      password: signupPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
  

    const { data, error } = await signupService({
      fullName: signupName,
      email: signupEmail,
      password: signupPassword,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const envelope = data as ApiEnvelope<unknown> | undefined;
    if (envelope?.Succeeded) {
      toast.success(t("auth.accountCreated"));
      setLoginEmail(signupEmail);
      setLoginPassword("");
      setActiveTab("login");
      setErrors({});
    } else {
      toast.error(envelope?.Message ?? "Signup failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg gradient-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-soft glow">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div className="h-1 w-24 bg-secondary rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("common.signIn")} - {t("branding.appName")}</title>
        <meta name="description" content={t("branding.heroDescription")} />
      </Helmet>

      <div className="min-h-screen gradient-bg gradient-mesh flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden p-8 xl:p-12">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 start-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-32 end-10 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
            <div className="absolute top-1/2 start-1/3 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-pulse-soft" />
          </div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }} />

          <div className="relative z-10 flex flex-col justify-center max-w-xl mx-auto">
            {/* Logo & Language Toggle */}
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl glow-lg">
                  <MessageSquare className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-3xl font-bold gradient-text">{t("branding.appName")}</span>
              </div>
              <LanguageThemeToggle />
            </div>

            <div className="animate-fade-in-up">
              <h1 className="text-5xl xl:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                {t("branding.heroTitle")}<br />
                <span className="gradient-text">{t("branding.heroTitleHighlight")}</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-14 max-w-lg leading-relaxed">
                {t("branding.heroDescription")}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, title: t("branding.featureFast"), desc: t("branding.featureFastDesc"), color: "text-warning" },
                { icon: Sparkles, title: t("branding.featureAI"), desc: t("branding.featureAIDesc"), color: "text-accent" },
                { icon: Shield, title: t("branding.featureSecurity"), desc: t("branding.featureSecurityDesc"), color: "text-success" },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "group flex items-center gap-5 p-5 rounded-2xl card-interactive animate-fade-in-up",
                    `stagger-${i + 1}`
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                    i === 0 && "bg-warning/10",
                    i === 1 && "bg-accent/10",
                    i === 2 && "bg-success/10"
                  )}>
                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground/30 ml-auto opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="mt-14 pt-8 border-t border-border/50">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-card/50 backdrop-blur-sm lg:rounded-s-[3rem] lg:shadow-2xl lg:border-s border-border/50">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow">
                  <MessageSquare className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold gradient-text">{t("branding.appName")}</span>
              </div>
              <LanguageThemeToggle />
            </div>

            <div className="animate-scale-in">
              <Card className="glass-strong border-0 shadow-2xl">
                <CardHeader className="text-center pb-2 pt-8">
                  <CardTitle className="text-3xl font-bold">
                    {activeTab === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base mt-2">
                    {activeTab === "login"
                      ? t("auth.signInToContinue")
                      : t("auth.startFreeTrial")}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 pb-8 px-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-8 bg-secondary/50 p-1.5 rounded-xl h-12">
                      <TabsTrigger 
                        value="login" 
                        className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg font-medium transition-all"
                      >
                        {t("common.signIn")}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup" 
                        className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg font-medium transition-all"
                      >
                        {t("common.signUp")}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-0">
                      <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-sm font-medium">{t("common.email")}</Label>
                          <div className="relative group">
                            <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                              id="login-email"
                              type="email"
                              placeholder={t("auth.emailPlaceholder")}
                              className="ps-12 h-12 bg-secondary/30 border-border/50 focus:bg-background focus:border-primary transition-all"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-destructive" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-sm font-medium">{t("common.password")}</Label>
                          <div className="relative group">
                            <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                              id="login-password"
                              type="password"
                              placeholder={t("auth.passwordPlaceholder")}
                              className="ps-12 h-12 bg-secondary/30 border-border/50 focus:bg-background focus:border-primary transition-all"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                            />
                          </div>
                          {errors.password && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-destructive" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold btn-premium text-primary-foreground mt-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              {t("auth.signingIn")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {t("common.signIn")}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-0">
                      <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-sm font-medium">{t("common.fullName")}</Label>
                          <div className="relative group">
                            <User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                              id="signup-name"
                              type="text"
                              placeholder={t("auth.namePlaceholder")}
                              className="ps-12 h-12 bg-secondary/30 border-border/50 focus:bg-background focus:border-primary transition-all"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                            />
                          </div>
                          {errors.fullName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-destructive" />
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium">{t("auth.workEmail")}</Label>
                          <div className="relative group">
                            <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder={t("auth.emailPlaceholder")}
                              className="ps-12 h-12 bg-secondary/30 border-border/50 focus:bg-background focus:border-primary transition-all"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-destructive" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-sm font-medium">{t("common.password")}</Label>
                          <div className="relative group">
                            <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                              id="signup-password"
                              type="password"
                              placeholder={t("auth.passwordPlaceholder")}
                              className="ps-12 h-12 bg-secondary/30 border-border/50 focus:bg-background focus:border-primary transition-all"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                            />
                          </div>
                          {errors.password && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-destructive" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold btn-premium text-primary-foreground mt-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              {t("auth.creatingAccount")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {t("auth.createAccount")}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground pt-2">
                          {t("auth.termsAgreement")}
                        </p>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;