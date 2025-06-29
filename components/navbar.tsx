"use client";

import { Bot } from "lucide-react";
import ThemeToggle from "./themeToggle";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface NavbarProps {
  showBackButton?: boolean;
}

export default function Navbar({ showBackButton = false }: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="border-b bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              ← Back
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Data Alchemist
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30"
          >
            Home
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
