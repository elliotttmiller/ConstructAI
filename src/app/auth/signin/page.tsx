"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, AlertCircle, Loader2, CheckCircle, Shield } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [authMethod, setAuthMethod] = useState<'nextauth' | 'direct'>('nextauth');
  const router = useRouter();

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);

    // Add small delay to show the form update
    setTimeout(() => {
      handleSubmit(null, userEmail, userPassword);
    }, 100);
  };

  const handleDirectAuth = async (loginEmail: string, loginPassword: string) => {
    setDebugInfo("Trying direct authentication...");

    try {
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDebugInfo("Direct authentication successful! Redirecting...");
        setAuthMethod('direct');

        // Store user data in localStorage for the session
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('authMethod', 'direct');

        router.push("/");
        router.refresh();
        return true;
      } else {
        setDebugInfo(`Direct auth failed: ${data.error}`);
        return false;
      }
    } catch (error) {
      setDebugInfo(`Direct auth error: ${error}`);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent | null, quickEmail?: string, quickPassword?: string) => {
    if (e) e.preventDefault();

    const loginEmail = quickEmail || email;
    const loginPassword = quickPassword || password;

    if (!loginEmail || !loginPassword) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");
    setDebugInfo("Starting authentication...");

    try {
      setDebugInfo("Trying NextAuth signIn...");

      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      setDebugInfo(`NextAuth result: ${JSON.stringify(result)}`);

      if (result?.error) {
        setDebugInfo("NextAuth failed, trying direct authentication...");

        // Try direct authentication as fallback
        const directSuccess = await handleDirectAuth(loginEmail, loginPassword);

        if (!directSuccess) {
          setError("Invalid email or password. Please check your credentials.");
        }
      } else if (result?.ok) {
        setDebugInfo("NextAuth successful, getting session...");

        // Get the session to confirm login
        const session = await getSession();

        if (session) {
          setDebugInfo("Session confirmed, redirecting...");
          setAuthMethod('nextauth');
          router.push("/");
          router.refresh();
        } else {
          setDebugInfo("No session found, trying direct auth...");
          await handleDirectAuth(loginEmail, loginPassword);
        }
      } else {
        setDebugInfo("Unknown NextAuth response, trying direct auth...");
        await handleDirectAuth(loginEmail, loginPassword);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setDebugInfo(`Error occurred, trying direct auth: ${error}`);

      // Try direct authentication as final fallback
      const directSuccess = await handleDirectAuth(loginEmail, loginPassword);

      if (!directSuccess) {
        setError("An error occurred during sign-in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-6 p-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">ConstructAI</h1>
          <p className="text-muted-foreground">AI Construction Platform</p>
        </div>

        {/* Sign In Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@constructai.demo"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {debugInfo && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{debugInfo}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login Demo Credentials */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Demo Accounts - Quick Login</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("admin@constructai.demo", "ConstructAI2025!")}
                  disabled={isLoading}
                  className="text-left justify-start"
                >
                  <div>
                    <p className="font-medium">👨‍💼 System Administrator</p>
                    <p className="text-xs opacity-70">admin@constructai.demo</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("manager@constructai.demo", "ConstructAI2025!")}
                  disabled={isLoading}
                  className="text-left justify-start"
                >
                  <div>
                    <p className="font-medium">� Project Manager</p>
                    <p className="text-xs opacity-70">manager@constructai.demo</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("architect@constructai.demo", "ConstructAI2025!")}
                  disabled={isLoading}
                  className="text-left justify-start"
                >
                  <div>
                    <p className="font-medium">👩‍🎨 Senior Architect</p>
                    <p className="text-xs opacity-70">architect@constructai.demo</p>
                  </div>
                </Button>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-xs text-center">
                Password for all accounts: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ConstructAI2025!</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Authentication service ready</span>
              </div>
              {authMethod && (
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <Shield className="w-3 h-3" />
                  <span>Method: {authMethod === 'nextauth' ? 'NextAuth.js' : 'Direct Auth'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
