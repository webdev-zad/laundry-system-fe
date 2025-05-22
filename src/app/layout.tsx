import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "../contexts/AuthContext";
import { SocketInitializer } from "../components/socket-initializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Laundry System",
  description: "A Notion-inspired laundry management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SocketInitializer />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
