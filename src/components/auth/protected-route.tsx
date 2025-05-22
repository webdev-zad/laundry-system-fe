"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      console.log("Auth state in protected route:", { isAuthenticated, isAdmin, user });

      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push("/login");
      } else if (adminOnly && !isAdmin) {
        console.log("Not admin, redirecting to dashboard");
        router.push("/dashboard");
      }

      setIsChecking(false);
    }
  }, [isAuthenticated, isAdmin, loading, router, adminOnly, user]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
