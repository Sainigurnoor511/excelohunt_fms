"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

const signUpSchema = loginSchema.extend({
  name: z.string().min(2, "Full name must be at least 2 characters."),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});
  const [signUpMessage, setSignUpMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              <p className="font-semibold mb-2">Supabase is not configured</p>
              <p>Please set the following environment variables in your <code className="bg-red-100 px-1 rounded">.env.local</code> file:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              </ul>
              <p className="mt-2 text-xs">See SETUP.md for instructions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        const fe = parsed.error.flatten().fieldErrors;
        setFieldErrors({
          email: fe.email?.[0],
          password: fe.password?.[0],
        });
        setError("Please fix the highlighted fields.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) throw error;

      if (data.user) {
        // Ensure there's a users row linked to this auth user for RLS (e.g. templates, approvals)
        try {
          const email = data.user.email;
          if (email) {
            const { data: existingUser } = await supabase
              .from("users")
              .select("*")
              .eq("email", email)
              .maybeSingle();

            if (existingUser) {
              if (!existingUser.auth_id) {
                await supabase
                  .from("users")
                  .update({ auth_id: data.user.id })
                  .eq("id", existingUser.id);
              }
            } else {
              // Fallback: create a member record for self-service signups
              await supabase.from("users").insert({
                auth_id: data.user.id,
                email,
                name: email.split("@")[0],
                role: "member",
                is_active: true,
              });
            }
          }
        } catch (syncError) {
          console.error("Failed to sync auth user to users table", syncError);
        }

        // Clear any cached data from previous sessions so the dashboard loads fresh data
        queryClient.clear();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      const friendly =
        err?.message?.toLowerCase().includes("invalid login") ||
        err?.message?.toLowerCase().includes("invalid credentials")
          ? "Incorrect email or password."
          : err?.message || "Failed to sign in.";
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignUpMessage(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const parsed = signUpSchema.safeParse({ email, password, name });
      if (!parsed.success) {
        const fe = parsed.error.flatten().fieldErrors;
        setFieldErrors({
          email: fe.email?.[0],
          password: fe.password?.[0],
          name: fe.name?.[0],
        });
        setError("Please fix the highlighted fields.");
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { name: parsed.data.name },
        },
      });

      // Supabase behavior: if email already registered, identities will be empty.
      const alreadyExists =
        authData?.user &&
        Array.isArray((authData.user as any).identities) &&
        (authData.user as any).identities.length === 0;

      if (authError || alreadyExists) {
        const msg =
          authError?.message ||
          (alreadyExists ? "User already exists. Please sign in instead." : "Failed to sign up.");
        setError(msg);
        setSignUpMessage(null);
        return;
      }

      // Do NOT insert into users table here; RLS blocks inserts before email confirmation.
      // User row is created on first successful login (see handleLogin).
      setError(null);
      setSignUpMessage("Please confirm your email — check your mail to finish sign-up.");
      setIsSignUp(false);
      setName("");
    } catch (err: any) {
      setError(err.message || "Failed to sign up.");
      setSignUpMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Flow Management System</CardTitle>
          <CardDescription>
            {isSignUp ? "Create a new account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signUpMessage && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 mb-3">
              {signUpMessage}
            </div>
          )}
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters. For better security, use a mix of
                  letters, numbers, and symbols.
                </p>
              )}
              {fieldErrors.password && (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                ? "Sign up"
                : "Sign in"}
            </Button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setName("");
                }}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

