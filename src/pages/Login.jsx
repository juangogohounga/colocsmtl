import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";

// Only allow same-site redirects after login.
const safeNext = (value) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/");

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const { isAuthenticated, user } = useAuth();

  const [mode, setMode] = useState("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { needsConfirmation } = await api.auth.signUp(email.trim(), password, fullName.trim());
        if (needsConfirmation) {
          setNotice("Check your email for a confirmation link, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        await api.auth.signIn(email.trim(), password);
      }
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return (
      <AuthLayout icon={Sparkles} title="You're signed in" subtitle={user?.email}>
        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate(next, { replace: true })}>
            Continue
          </Button>
          <Button variant="outline" className="w-full" onClick={() => api.auth.logout("/login")}>
            Sign out
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Sparkles}
      title={isSignUp ? "Create your ColocsMTL account" : "Welcome back to ColocsMTL"}
      subtitle="Find your perfect roommate in Montreal"
      footer={
        <>
          {isSignUp ? "Already have an account? " : "New to ColocsMTL? "}
          <button
            type="button"
            className="font-medium text-indigo-600 hover:underline"
            onClick={() => {
              setMode(isSignUp ? "signin" : "signup");
              setError("");
              setNotice("");
            }}
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </button>
          <span className="block mt-3">
            <Link to="/" className="hover:underline">Back to home</Link>
          </span>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {notice && <p className="text-sm text-green-700" role="status">{notice}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
        >
          {submitting ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
