"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LogoMark } from "./Logo";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "signin" | "signup";
  onSuccess?: () => void;
}

export function AuthModal({
  open,
  onOpenChange,
  initialMode = "signup",
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // When the requested mode changes (e.g., user clicks "Sign in" vs "Sign up"
  // in the header), keep the modal's mode in sync. Also clear errors/state.
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setErrors({});
    }
  }, [open, initialMode]);

  // Validate per-mode.
  const validate = (): boolean => {
    const e: { username?: string; password?: string } = {};
    if (!username.trim()) {
      e.username = "Username is required.";
    } else if (username.length < 3) {
      e.username = "Username must be at least 3 characters.";
    } else if (!/^[a-z0-9_]+$/.test(username)) {
      e.username = "Only lowercase letters, numbers, and underscores.";
    } else if (username.length > 20) {
      e.username = "Username must be 20 characters or fewer.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);

    if (mode === "signup") {
      // Register first.
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBusy(false);
        setErrors({ username: data?.error ?? "Signup failed" });
        toast.error(data?.error ?? "Signup failed");
        return;
      }
      // Auto-sign-in.
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      setBusy(false);
      if (result?.error) {
        toast.error("Account created, but auto-login failed. Please sign in.");
        setMode("signin");
        return;
      }
      toast.success(`Welcome to thechess, ${username}!`, {
        description: "Your journey begins at 1200 rating.",
      });
      onSuccess?.();
      onOpenChange(false);
      setUsername("");
      setPassword("");
      return;
    }

    // Sign-in flow only — no account creation.
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setBusy(false);
    if (result?.error) {
      // Distinguish "user doesn't exist" from "wrong password" to give better UX.
      // NextAuth returns the same error for both, so check if the user exists.
      try {
        const check = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(username)}`,
        );
        const checkData = await check.json();
        if (checkData.exists === false) {
          setErrors({
            username:
              "No account with that username. Use 'Create account' to sign up.",
          });
        } else {
          setErrors({ password: "Incorrect password. Try again." });
        }
      } catch {
        setErrors({ password: "Invalid username or password." });
      }
      return;
    }
    toast.success(`Welcome back, ${username}!`);
    onSuccess?.();
    onOpenChange(false);
    setUsername("");
    setPassword("");
  };

  const isSignup = mode === "signup";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-border bg-card pop-in">
        <DialogHeader>
          <div className="mb-2 flex justify-center">
            <LogoMark size={48} className="float" />
          </div>
          <DialogTitle className="text-center text-xl">
            {isSignup ? "Join thechess" : "Welcome back"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignup
              ? "Create an account to play online, track your rating, and earn XP."
              : "Sign in to your account to continue your climb."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="auth-username" className="text-xs text-muted-foreground">
              Username
            </Label>
            <Input
              id="auth-username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
              }}
              placeholder="your_handle"
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              className="bg-background"
              aria-invalid={!!errors.username}
            />
            {errors.username ? (
              <p className="text-[11px] font-medium text-red-500">{errors.username}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Lowercase letters, numbers, underscores. 3–20 chars.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="auth-password" className="text-xs text-muted-foreground">
              Password
            </Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              className="bg-background"
              aria-invalid={!!errors.password}
            />
            {errors.password ? (
              <p className="text-[11px] font-medium text-red-500">{errors.password}</p>
            ) : isSignup ? (
              <p className="text-[10px] text-muted-foreground">At least 6 characters.</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full gap-2"
            size="lg"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>

        {/* Single clear toggle between modes — labeled to make intent obvious */}
        <div className="pt-2 text-center text-xs text-muted-foreground">
          {isSignup ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setErrors({});
              setPassword("");
            }}
            className="font-semibold text-emerald-400 hover:underline"
          >
            {isSignup ? "Sign in instead" : "Create an account"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
