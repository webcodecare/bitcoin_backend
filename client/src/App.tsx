import React, { useEffect, lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import SessionWarning from "@/components/auth/SessionWarning";
import PerformanceOptimizer from "@/components/common/PerformanceOptimizer";
import AuthGuard from "@/components/auth/AuthGuard";
import PaymentRequiredGuard from "@/components/auth/PaymentRequiredGuard";

// Critical pages loaded immediately
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";

// Heavy pages lazy loaded for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const MultiTickerDashboard = lazy(() => import("@/pages/multi-ticker-dashboard"));
const Trading = lazy(() => import("@/pages/trading"));
const Admin = lazy(() => import("@/pages/admin"));
const Alerts = lazy(() => import("@/pages/alerts"));
const Settings = lazy(() => import("@/pages/settings"));
const Subscription = lazy(() => import("@/pages/subscription"));
const BitcoinAnalytics = lazy(() => import("@/pages/bitcoin-analytics"));
const Members = lazy(() => import("@/pages/members"));
const MarketData = lazy(() => import("@/pages/market-data"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Pricing = lazy(() => import("@/pages/pricing"));

// Additional pages from GitHub
const Achievements = lazy(() => import("@/pages/achievements"));
const AdvancedAlerts = lazy(() => import("@/pages/advanced-alerts"));
const AdvancedPortfolio = lazy(() => import("@/pages/advanced-portfolio"));
const DashboardWidgets = lazy(() => import("@/pages/dashboard-widgets"));
const HistoricalOhlc = lazy(() => import("@/pages/historical-ohlc"));
const LiveStreaming = lazy(() => import("@/pages/live-streaming"));
const MoodBoard = lazy(() => import("@/pages/mood-board"));
const NotificationCenter = lazy(() => import("@/pages/notification-center"));
const NotificationDashboard = lazy(() => import("@/pages/notification-dashboard"));
const NotificationSetup = lazy(() => import("@/pages/notification-setup"));
const Preferences = lazy(() => import("@/pages/preferences"));
const TradingPlayground = lazy(() => import("@/pages/trading-playground"));
const UserProgress = lazy(() => import("@/pages/user-progress"));
const UpgradePage = lazy(() => import("@/pages/upgrade"));

// Admin pages
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminTickers = lazy(() => import("@/pages/admin/tickers"));
const AdminSignals = lazy(() => import("@/pages/admin/signals"));
const AdminAlerts = lazy(() => import("@/pages/admin/alerts"));
const AdminNotifications = lazy(() => import("@/pages/admin/notifications"));
const AdminLogs = lazy(() => import("@/pages/admin/logs"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminIntegrations = lazy(() => import("@/pages/admin/integrations"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminPermissions = lazy(() => import("@/pages/admin/permissions"));
const AdminUserRoles = lazy(() => import("@/pages/admin/user-roles"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminSubscriptions = lazy(() => import("@/pages/admin/subscriptions"));
const AdminContent = lazy(() => import("@/pages/admin/content"));
const AdminNotificationSetup = lazy(() => import("@/pages/admin/notification-setup"));
const AdminTestUsers = lazy(() => import("@/pages/admin/test-users"));

// Loading component for better UX
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/signup" component={Auth} />
      <Route path="/login" component={Auth} />
      <Route path="/pricing">
        <Suspense fallback={<LoadingScreen />}>
          <Pricing />
        </Suspense>
      </Route>
      <Route path="/dashboard">
        <AuthGuard excludeRole="admin">
          <PaymentRequiredGuard requiredTier="basic" pageName="Dashboard">
            <Suspense fallback={<LoadingScreen />}>
              <Dashboard />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/multi-ticker-dashboard">
        <AuthGuard excludeRole="admin">
          <PaymentRequiredGuard requiredTier="basic" pageName="Multi-Ticker Dashboard">
            <Suspense fallback={<LoadingScreen />}>
              <MultiTickerDashboard />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/multi-ticker">
        <AuthGuard excludeRole="admin">
          <PaymentRequiredGuard requiredTier="basic" pageName="Multi-Ticker Dashboard">
            <Suspense fallback={<LoadingScreen />}>
              <MultiTickerDashboard />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/trading">
        <AuthGuard excludeRole="admin">
          <PaymentRequiredGuard requiredTier="basic" pageName="Trading">
            <Suspense fallback={<LoadingScreen />}>
              <Trading />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/admin">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <Admin />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/alerts">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="basic" pageName="Alerts">
            <Suspense fallback={<LoadingScreen />}>
              <Alerts />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/settings">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <Settings />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/subscription">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <Subscription />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/bitcoin-analytics">
        <Suspense fallback={<LoadingScreen />}>
          <BitcoinAnalytics />
        </Suspense>
      </Route>
      <Route path="/members">
        <Suspense fallback={<LoadingScreen />}>
          <Members />
        </Suspense>
      </Route>
      <Route path="/market-data">
        <Suspense fallback={<LoadingScreen />}>
          <MarketData />
        </Suspense>
      </Route>
      <Route path="/about">
        <Suspense fallback={<LoadingScreen />}>
          <About />
        </Suspense>
      </Route>
      <Route path="/contact">
        <Suspense fallback={<LoadingScreen />}>
          <Contact />
        </Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<LoadingScreen />}>
          <Privacy />
        </Suspense>
      </Route>
      <Route path="/terms">
        <Suspense fallback={<LoadingScreen />}>
          <Terms />
        </Suspense>
      </Route>
      
      {/* Additional authenticated pages */}
      <Route path="/achievements">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="basic" pageName="Achievements">
            <Suspense fallback={<LoadingScreen />}>
              <Achievements />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/advanced-alerts">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="premium" pageName="Advanced Alerts">
            <Suspense fallback={<LoadingScreen />}>
              <AdvancedAlerts />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/advanced-portfolio">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="premium" pageName="Advanced Portfolio">
            <Suspense fallback={<LoadingScreen />}>
              <AdvancedPortfolio />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/dashboard-widgets">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="basic" pageName="Dashboard Widgets">
            <Suspense fallback={<LoadingScreen />}>
              <DashboardWidgets />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/historical-ohlc">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="premium" pageName="Historical OHLC Data">
            <Suspense fallback={<LoadingScreen />}>
              <HistoricalOhlc />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/live-streaming">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="premium" pageName="Live Streaming">
            <Suspense fallback={<LoadingScreen />}>
              <LiveStreaming />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/mood-board">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="basic" pageName="Signal Mood Board">
            <Suspense fallback={<LoadingScreen />}>
              <MoodBoard />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/notification-center">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="basic" pageName="Notification Center">
            <Suspense fallback={<LoadingScreen />}>
              <NotificationCenter />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/notification-dashboard">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="premium" pageName="Notification Dashboard">
            <Suspense fallback={<LoadingScreen />}>
              <NotificationDashboard />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/notification-setup">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="basic" pageName="Notification Setup">
            <Suspense fallback={<LoadingScreen />}>
              <NotificationSetup />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/preferences">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="basic" pageName="Preferences">
            <Suspense fallback={<LoadingScreen />}>
              <Preferences />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/trading-playground">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="premium" pageName="Trading Playground">
            <Suspense fallback={<LoadingScreen />}>
              <TradingPlayground />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/user-progress">
        <AuthGuard>
          <PaymentRequiredGuard requiredTier="basic" pageName="User Progress">
            <Suspense fallback={<LoadingScreen />}>
              <UserProgress />
            </Suspense>
          </PaymentRequiredGuard>
        </AuthGuard>
      </Route>
      <Route path="/upgrade">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <UpgradePage />
          </Suspense>
        </AuthGuard>
      </Route>

      {/* Admin pages */}
      <Route path="/admin/users">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminUsers />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/tickers">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminTickers />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/signals">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminSignals />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/alerts">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminAlerts />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/notifications">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminNotifications />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/logs">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminLogs />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/analytics">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminAnalytics />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/integrations">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminIntegrations />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/reports">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminReports />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/permissions">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminPermissions />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/user-roles">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminUserRoles />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/payments">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminPayments />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/subscriptions">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminSubscriptions />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/content">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminContent />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/notification-setup">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminNotificationSetup />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/test-users">
        <AuthGuard requiredRole="admin">
          <Suspense fallback={<LoadingScreen />}>
            <AdminTestUsers />
          </Suspense>
        </AuthGuard>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  // Global error handling for chart-related issues
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent default behavior for specific known issues
      if (event.reason && event.reason.message) {
        const message = event.reason.message.toLowerCase();
        if (message.includes('tradingview') || 
            message.includes('chart') || 
            message.includes('widget')) {
          event.preventDefault();
          console.warn('Chart-related error handled gracefully');
          return;
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <PerformanceOptimizer>
            <div className="min-h-screen bg-background text-foreground">
              <Router />
              <SessionWarning 
                onExtend={() => console.log('Session extended')}
                onLogout={() => console.log('Session logged out')}
              />
              <Toaster />
            </div>
          </PerformanceOptimizer>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}