"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "../../components/auth/login-form";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and the user is authenticated
    if (isAuthenticated && !loading) {
      console.log("User is authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Don't render the login form if we're authenticated or still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <LoginForm />
      </div>
    </div>
  );
}
