
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import PaymentRequiredGuard from "@/components/auth/PaymentRequiredGuard";

import DashboardTabs from "@/components/dashboard/DashboardTabs";
import TickerManager from "@/components/dashboard/TickerManager";
import DashboardWidgets from "@/components/dashboard/DashboardWidgets";
import UserProfileWidget from "@/components/dashboard/UserProfileWidget";
import MarketOverview from "@/components/dashboard/MarketOverview";
import SignalsList from "@/components/dashboard/SignalsList";
import TradingStats from "@/components/dashboard/TradingStats";
import FeatureAccessGuard from "@/components/subscription/FeatureAccessGuard";



export default function Dashboard() {
  const { user } = useAuth(); // Get user data for subscription checks
  const [selectedTickers, setSelectedTickers] = useState<string[]>([
    "BTCUSDT",
    "ETHUSDT",
  ]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle ticker selection
  const handleTickerToggle = (symbol: string) => {
    setSelectedTickers((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol],
    );
  };

  return (
    <PaymentRequiredGuard featureName="the trading dashboard">
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />

          {/* Main Content */}
        <div className="w-full ml-0 md:ml-64 flex-1 bg-background">
          {/* Top Bar */}
          <TopBar
            title="Trading Dashboard"
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            showMobileMenu={isMobileMenuOpen}
          />

          {/* Dashboard Content */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-6">
            {/* Trading Stats - Require Basic Tier */}
            <FeatureAccessGuard
              requiredTier="basic"
              featureName="Trading Statistics"
              description="Access comprehensive trading performance metrics and statistics"
            >
              <TradingStats userTier={user?.subscriptionTier || "free"} />
            </FeatureAccessGuard>

            {/* Main Content Grid - Mobile First Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {/* Left Column - User Profile & Market */}
              <div className="lg:col-span-1 xl:col-span-1 space-y-3 sm:space-y-4 md:space-y-6">
                <UserProfileWidget />
                {/* Market Overview - Require Basic Tier */}
                <FeatureAccessGuard
                  requiredTier="basic"
                  featureName="Market Overview"
                  description="Access real-time market data and price monitoring"
                >
                  <MarketOverview />
                </FeatureAccessGuard>
              </div>

              {/* Middle Column - Signals & Charts */}
              <div className="lg:col-span-1 xl:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                {/* Basic Trading Signals - Require Basic Tier */}
                <FeatureAccessGuard
                  requiredTier="basic"
                  featureName="Trading Signals"
                  description="Access real-time trading signals and market alerts"
                >
                  <SignalsList ticker="BTCUSDT" limit={5} />
                </FeatureAccessGuard>
                
                {/* Advanced Charts - Require Premium Tier */}
                <FeatureAccessGuard
                  requiredTier="premium"
                  featureName="Advanced Charts"
                  description="Access multi-ticker charts and advanced technical analysis"
                >
                  <DashboardTabs selectedTickers={selectedTickers} />
                </FeatureAccessGuard>
              </div>

              {/* Right Column - Widgets & Tools */}
              <div className="lg:col-span-1 xl:col-span-1 space-y-3 sm:space-y-4 md:space-y-6">
                {/* Basic Features - Require Basic Tier */}
                <FeatureAccessGuard
                  requiredTier="basic"
                  featureName="Trading Tools"
                  description="Access basic trading tools and analytics"
                >
                  <TickerManager
                    selectedTickers={selectedTickers}
                    onTickerToggle={handleTickerToggle}
                  />
                </FeatureAccessGuard>
                
                {/* Premium Features */}
                <FeatureAccessGuard
                  requiredTier="premium"
                  featureName="Advanced Analytics"
                  description="Access detailed portfolio analysis and forecasting tools"
                >
                  <DashboardWidgets />
                </FeatureAccessGuard>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </PaymentRequiredGuard>
  );
}