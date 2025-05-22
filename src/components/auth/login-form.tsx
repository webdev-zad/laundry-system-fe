"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "../../contexts/AuthContext";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.log("Attempting login with:", email); // Don't log password

    try {
      await authLogin(email, password);
      console.log("Login successful, navigating to dashboard");
      router.push("/dashboard");
    } catch (err: Error | unknown) {
      // Show detailed error in alert
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      const errorDetails = JSON.stringify(err, null, 2);
      alert(`Error: ${errorMessage}\n\nDetails: ${errorDetails}`);

      console.error("Login error details:", JSON.stringify(err));
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your credentials to access the laundry management system
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 text-sm text-white bg-red-500 rounded">{error}</div>}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      {/* <div className="text-center text-sm">
        <p>Demo Credentials:</p>
        <p>Admin: admin@laundry.com / admin123</p>
        <p>Staff: staff@laundry.com / staff123</p>
      </div> */}
    </div>
  );
}
