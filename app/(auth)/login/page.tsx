"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpMessage, setSignUpMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user exists in users table, if not create one
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", data.user.id)
          .single();

        if (!userData) {
          // Create user record if it doesn't exist
          await supabase.from("users").insert({
            auth_id: data.user.id,
            email: data.user.email!,
            name: data.user.email!.split("@")[0],
            role: "member",
            is_active: true,
          });
        }

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
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
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
                  required={isSignUp}
                />
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
                required
              />
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
                  required
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

