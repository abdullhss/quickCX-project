import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (requireOnboarding && profile && !profile.onboarding_completed) {
        navigate("/onboarding");
      }
    }
  }, [user, profile, loading, navigate, requireOnboarding]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <MessageSquare className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireOnboarding && profile && !profile.onboarding_completed) {
    return null;
  }

  return <>{children}</>;
};
