import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector } from "@/store/hooks";
import { selectIsApiAuthenticated } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  Building2,
  Briefcase,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  Headphones,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageThemeToggle } from "@/components/LanguageThemeToggle";
import { skipOnboarding } from "@/config/features";
import {
  addUserToRoleService,
  createOrganizationService,
  setOrganizationSizeService,
} from "@/services/onBoarding/onBordingService";

const Onboarding = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, profile, updateProfile, loading } = useAuth();
  const isApiAuth = useAppSelector(selectIsApiAuthenticated);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRTL = i18n.language === "ar";

  const steps = [
    { id: 1, title: t("onboarding.companyInfo"), icon: Building2 },
    { id: 2, title: t("onboarding.yourRole"), icon: Briefcase },
    { id: 3, title: t("onboarding.teamSize"), icon: Users },
    { id: 4, title: t("onboarding.allSet"), icon: Zap },
  ];

  const teamSizes = [
    { value: "1-5", label: t("teamSizes.small"), description: t("teamSizes.smallDesc") },
    { value: "6-20", label: t("teamSizes.growing"), description: t("teamSizes.growingDesc") },
    { value: "21-50", label: t("teamSizes.medium"), description: t("teamSizes.mediumDesc") },
    { value: "50+", label: t("teamSizes.large"), description: t("teamSizes.largeDesc") },
  ];

  const jobTitles = [
    { value: "Support Agent", label: t("roles.supportAgent"), icon: Headphones },
    { value: "Team Lead", label: t("roles.teamLead"), icon: Users },
    { value: "Support Manager", label: t("roles.supportManager"), icon: BarChart3 },
    { value: "Customer Success", label: t("roles.customerSuccess"), icon: Zap },
  ];

  // Form data
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [teamSize, setTeamSize] = useState("");

  const [didCreateOrganization, setDidCreateOrganization] = useState(false);
  const [didAssignRole, setDidAssignRole] = useState(false);
  const [didSetTeamSize, setDidSetTeamSize] = useState(false);

  // useEffect(() => {
  //   if (!loading && !user && !isApiAuth) {
  //     navigate("/auth");
  //   } else if (!loading && (skipOnboarding || profile?.onboarding_completed)) {
  //     navigate("/");
  //   }
  // }, [user, profile, loading, navigate, isApiAuth]);

  const roleNameFromJobTitle = (title: string): number | null => {
    const mapping: Record<string, number> = {
      "Team Lead": 1,
      "Support Manager": 2,
      "Customer Success": 3,
      "Support Agent": 4,
    };
    return mapping[title] ?? null;
  };

  const orgSizeFromTeamSizeValue = (value: string): number | null => {
    const mapping: Record<string, number> = {
      "1-5": 1,
      "6-20": 2,
      "21-50": 3,
      "50+": 4,
    };
    return mapping[value] ?? null;
  };

  const canSkipToComplete = companyName.trim().length >= 2 && !!jobTitle && !!teamSize;

  const handleNext = async () => {
    if (!user) {
      toast.error("You must be logged in to continue.");
      return;
    }

    if (isSubmitting) return;

    // Step 1 -> create organization
    if (currentStep === 1) {
      setIsSubmitting(true);
      const { error } = await createOrganizationService({
        name: companyName.trim(),
        creatorUserId: user.id,
        contactPhone: phone.trim() || undefined,
      });
      setIsSubmitting(false);

      if (error) {
        toast.error(error.message || "Failed to create your organization.");
        return;
      }

      setDidCreateOrganization(true);
      setCurrentStep(2);
      return;
    }

    // Step 2 -> assign role
    if (currentStep === 2) {
      const roleName = roleNameFromJobTitle(jobTitle);
      if (roleName == null) {
        toast.error("Please select your role.");
        return;
      }

      setIsSubmitting(true);
      const { error } = await addUserToRoleService({
        userId: user.id,
        roleName,
      });
      setIsSubmitting(false);

      if (error) {
        toast.error(error.message || "Failed to save your role.");
        return;
      }

      setDidAssignRole(true);
      setCurrentStep(3);
      return;
    }

    // Step 3 -> set team size
    if (currentStep === 3) {
      const size = orgSizeFromTeamSizeValue(teamSize);
      if (size == null) {
        toast.error("Please select your team size.");
        return;
      }

      setIsSubmitting(true);
      const { error } = await setOrganizationSizeService({ size });
      setIsSubmitting(false);

      if (error) {
        toast.error(error.message || "Failed to save your team size.");
        return;
      }

      setDidSetTeamSize(true);
      setCurrentStep(4);
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // If user goes back and changes answers, allow re-calling the corresponding endpoints.
      if (currentStep === 4) setDidSetTeamSize(false);
      if (currentStep === 3) {
        setDidSetTeamSize(false);
        setDidAssignRole(false);
      }
      if (currentStep === 2) {
        setDidAssignRole(false);
        setDidCreateOrganization(false);
      }
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error("You must be logged in to continue.");
      return;
    }

    setIsSubmitting(true);

    // Step 1 API (if not already done via Continue)
    if (!didCreateOrganization) {
      if (companyName.trim().length < 2) {
        setIsSubmitting(false);
        toast.error("Please enter your company name.");
        return;
      }

      const { error } = await createOrganizationService({
        name: companyName.trim(),
        creatorUserId: user.id,
        contactPhone: phone.trim() || undefined,
      });
      if (error) {
        setIsSubmitting(false);
        toast.error(error.message || "Failed to create your organization.");
        return;
      }
      setDidCreateOrganization(true);
    }

    // Step 2 API (if not already done via Continue)
    if (!didAssignRole) {
      const roleName = roleNameFromJobTitle(jobTitle);
      if (roleName == null) {
        setIsSubmitting(false);
        toast.error("Please select your role.");
        return;
      }

      const { error } = await addUserToRoleService({ userId: user.id, roleName });
      if (error) {
        setIsSubmitting(false);
        toast.error(error.message || "Failed to save your role.");
        return;
      }
      setDidAssignRole(true);
    }

    // Step 3 API (if not already done via Continue)
    if (!didSetTeamSize) {
      const size = orgSizeFromTeamSizeValue(teamSize);
      if (size == null) {
        setIsSubmitting(false);
        toast.error("Please select your team size.");
        return;
      }

      const { error } = await setOrganizationSizeService({ size });
      if (error) {
        setIsSubmitting(false);
        toast.error(error.message || "Failed to save your team size.");
        return;
      }
      setDidSetTeamSize(true);
    }

    const { error } = await updateProfile({
      company_name: companyName || null,
      phone: phone || null,
      job_title: jobTitle || null,
      onboarding_completed: true,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to save your information. Please try again.");
    } else {
      toast.success(t("auth.welcomeBack") + "!");
      navigate("/");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return companyName.trim().length >= 2;
      case 2:
        return jobTitle.length > 0;
      case 3:
        return teamSize.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <MessageSquare className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("onboarding.completeProfile")} - {t("branding.appName")}</title>
        <meta name="description" content={t("onboarding.companyInfoDesc")} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">{t("branding.appName")}</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress Steps */}
              <div className="hidden sm:flex items-center gap-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                        currentStep > step.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : currentStep === step.id
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-8 h-0.5 mx-1",
                          currentStep > step.id ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              <LanguageThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl">
            <Card className="glass border-border/50 shadow-xl">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {(() => {
                    const StepIcon = steps[currentStep - 1].icon;
                    return <StepIcon className="w-8 h-8 text-primary" />;
                  })()}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {currentStep === 1 && t("onboarding.companyInfo")}
                  {currentStep === 2 && t("onboarding.yourRole")}
                  {currentStep === 3 && t("onboarding.teamSize")}
                  {currentStep === 4 && t("onboarding.allSet")}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {currentStep === 1 && t("onboarding.companyInfoDesc")}
                  {currentStep === 2 && t("onboarding.yourRoleDesc")}
                  {currentStep === 3 && t("onboarding.teamSizeDesc")}
                  {currentStep === 4 && t("onboarding.allSetDesc")}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Step 1: Company Info */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="company">{t("onboarding.companyName")}</Label>
                      <div className="relative">
                        <Building2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="company"
                          type="text"
                          placeholder={t("onboarding.companyPlaceholder")}
                          className="ps-10"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("onboarding.phoneNumber")}</Label>
                      <div className="relative">
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={t("onboarding.phonePlaceholder")}
                          className="ps-10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Job Title */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    {jobTitles.map((job) => (
                      <button
                        key={job.value}
                        onClick={() => setJobTitle(job.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-center transition-all",
                          jobTitle === job.value
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <job.icon
                          className={cn(
                            "w-6 h-6 mb-2 mx-auto",
                            jobTitle === job.value
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                        <span className="font-medium text-foreground text-sm">{job.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 3: Team Size */}
                {currentStep === 3 && (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    {teamSizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setTeamSize(size.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-start transition-all",
                          teamSize === size.value
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <span className="block font-semibold text-foreground">
                          {size.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {size.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 4: Finish */}
                {currentStep === 4 && (
                  <div className="text-center space-y-6 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto shadow-lg">
                      <Check className="w-10 h-10 text-success" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {t("onboarding.welcomeUser", { name: profile?.full_name?.split(" ")[0] || "" })}
                      </h3>
                      <p className="text-muted-foreground">
                        {t("onboarding.readyMessage")}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      {[
                        { icon: MessageSquare, label: t("onboarding.unifiedInbox") },
                        { icon: Zap, label: t("onboarding.aiAssist") },
                        { icon: BarChart3, label: t("onboarding.analytics") },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-muted/50 border border-border/50">
                          <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                  {currentStep > 1 ? (
                    <Button variant="ghost" onClick={handleBack}>
                      {isRTL ? <ChevronRight className="w-4 h-4 me-1" /> : <ChevronLeft className="w-4 h-4 me-1" />}
                      {t("common.back")}
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < steps.length ? (
                    <Button 
                      onClick={handleNext} 
                      disabled={!canProceed() || isSubmitting}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      {t("common.continue")}
                      {isRTL ? <ChevronLeft className="w-4 h-4 ms-1" /> : <ChevronRight className="w-4 h-4 ms-1" />}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleComplete} 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      {isSubmitting ? t("onboarding.settingUp") : t("onboarding.goToDashboard")}
                      {isRTL ? <ChevronLeft className="w-4 h-4 ms-1" /> : <ChevronRight className="w-4 h-4 ms-1" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skip Option */}
            {currentStep < 4 && canSkipToComplete && (
              <p className="text-center mt-4">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("common.skip")}
                </button>
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Onboarding;
