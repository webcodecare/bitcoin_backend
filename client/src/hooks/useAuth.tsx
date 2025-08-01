import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI, tokenStorage, User, UserSettings } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SessionManager } from "@/lib/sessionManager";
import { AuthUtils } from "@/lib/authUtils";

interface AuthContextType {
  user: User | null;
  settings: UserSettings | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  extendSession: () => void;
  hasPermission: (requiredRole?: string) => boolean;
  getUserDisplayName: () => string;
  getUserInitials: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    // Try session manager first, fallback to legacy token storage
    return SessionManager.getToken() || tokenStorage.get();
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize session on mount
  useEffect(() => {
    const session = SessionManager.getSession();
    if (session) {
      setToken(session.token);
    } else if (token) {
      // Migrate legacy token to session
      const user = SessionManager.getUser();
      if (user) {
        SessionManager.createSession(token, user);
      }
    }
  }, []);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/user/profile", token],
    queryFn: () => token ? authAPI.getProfile(token) : null,
    enabled: !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authAPI.login(email, password),
    onSuccess: (data) => {
      setToken(data.token);
      // Create session with user data
      SessionManager.createSession(data.token, data.user);
      tokenStorage.set(data.token); // Keep legacy support
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      
      // Don't auto-redirect, let login page handle it
      // const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      // sessionStorage.removeItem('redirectAfterLogin');
      // window.location.href = redirectUrl;
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, firstName, lastName }: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => authAPI.register(email, password, firstName, lastName),
    onSuccess: (data) => {
      setToken(data.token);
      // Create session with user data
      SessionManager.createSession(data.token, data.user);
      tokenStorage.set(data.token); // Keep legacy support
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      
      // Redirect to dashboard after registration
      window.location.href = '/dashboard';
      
      toast({
        title: "Registration successful",
        description: "Welcome to CryptoStrategy Pro!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<UserSettings>) =>
      token ? authAPI.updateSettings(token, settings) : Promise.reject("No token"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    await registerMutation.mutateAsync({ email, password, firstName, lastName });
  };

  const logout = () => {
    AuthUtils.logSecurityEvent('USER_LOGOUT', { userId: profileData?.user?.id });
    setToken(null);
    AuthUtils.clearAllAuthData();
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    // Redirect to login page
    window.location.href = '/login';
  };

  const extendSession = () => {
    SessionManager.extendSession();
    AuthUtils.logSecurityEvent('SESSION_EXTENDED', { userId: profileData?.user?.id });
    toast({
      title: "Session extended",
      description: "Your session has been extended",
    });
  };

  const hasPermission = (requiredRole?: string) => {
    return AuthUtils.hasPermission(profileData?.user, requiredRole);
  };

  const getUserDisplayName = () => {
    return AuthUtils.getUserDisplayName(profileData?.user);
  };

  const getUserInitials = () => {
    return AuthUtils.getUserInitials(profileData?.user);
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    await updateSettingsMutation.mutateAsync(settings);
  };

  const contextValue: AuthContextType = {
    user: profileData?.user || SessionManager.getUser(),
    settings: profileData?.settings || null,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!token && (!!profileData?.user || !!SessionManager.getUser()),
    login,
    register,
    logout,
    updateSettings,
    extendSession,
    hasPermission,
    getUserDisplayName,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
