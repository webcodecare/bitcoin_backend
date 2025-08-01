import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bitcoin, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, register, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Debug logging
    console.log('Login attempt:', {
      email: formData.email,
      password: '***' + formData.password.slice(-3),
      mode
    });

    try {
      if (mode === "login") {
        console.log('Calling login function with:', { email: formData.email.trim(), password: '***' });
        const result = await login(formData.email.trim(), formData.password.trim());
        console.log('Login result:', result);
        setLocation("/dashboard");
      } else {
        await register(formData.email.trim(), formData.password.trim(), formData.firstName, formData.lastName);
        setLocation("/dashboard");
      }
    } catch (err: any) {
      console.error('Full authentication error:', err);
      console.error('Error message:', err?.message);
      console.error('Error status:', err?.status);
      console.error('Error code:', err?.code);
      // Parse error message from server response
      let errorMessage = "Authentication failed";
      
      if (err.message) {
        // Check if the error already has a clean message (from our improved queryClient)
        if (err.code === 'INVALID_CREDENTIALS') {
          errorMessage = mode === "login" 
            ? "Invalid email or password. Please check your credentials."
            : "Authentication failed. Please try again.";
        } else if (err.code === 'USER_EXISTS') {
          errorMessage = "An account with this email already exists. Please try logging in instead.";
        } else if (err.status === 401) {
          errorMessage = mode === "login" 
            ? "Invalid email or password. Please check your credentials."
            : "Authentication failed. Please try again.";
        } else if (err.status === 409) {
          errorMessage = "An account with this email already exists. Please try logging in instead.";
        } else if (err.status === 422 || err.status === 400) {
          errorMessage = "Please check your information and try again.";
        } else if (err.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          // Use the error message directly if it's already clean
          errorMessage = err.message || "Authentication failed";
          
          // Fallback: try to parse JSON from legacy error format
          try {
            if (err.message.includes('{"message"')) {
              const jsonMatch = err.message.match(/\{.*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.message) {
                  errorMessage = parsed.message;
                  if (parsed.code === 'INVALID_CREDENTIALS') {
                    errorMessage = "Invalid email or password. Please check your credentials.";
                  }
                }
              }
            } else if (err.message.includes('401:')) {
              errorMessage = "Invalid email or password. Please check your credentials.";
            }
          } catch {
            // Clean up raw error message as last resort
            errorMessage = err.message.replace(/^\d+:\s*/, '').replace(/^Error:\s*/, '') || "Authentication failed";
          }
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2 text-2xl font-bold text-primary">
            <Bitcoin className="h-8 w-8" />
            <span>CryptoStrategy Pro</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "login" 
                ? "Sign in to access your trading dashboard" 
                : "Join thousands of successful crypto traders"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full crypto-gradient text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-primary"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </Button>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
