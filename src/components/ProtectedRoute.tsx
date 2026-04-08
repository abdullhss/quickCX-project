import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector } from "@/store/hooks";
import { selectIsApiAuthenticated } from "@/store/authSlice";
import { skipOnboarding } from "@/config/features";
import { MessageSquare } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const isApiAuth = useAppSelector(selectIsApiAuthenticated);
  const onboardingRequired = requireOnboarding && !skipOnboarding;

  useEffect(() => {
    if (loading) return;

    if (!user && !isApiAuth) {
      navigate("/auth");
      return;
    }

    if (onboardingRequired) {
      if (profile && !profile.onboarding_completed) {
        navigate("/onboarding");
      } else if (!profile && isApiAuth && !user) {
        navigate("/onboarding");
      }
    }
  }, [user, profile, loading, navigate, onboardingRequired, isApiAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <MessageSquare className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!user && !isApiAuth) {
    return null;
  }

  if (onboardingRequired) {
    if (profile && !profile.onboarding_completed) {
      return null;
    }
    if (!profile && isApiAuth && !user) {
      return null;
    }
  }

  return <>{children}</>;
};
