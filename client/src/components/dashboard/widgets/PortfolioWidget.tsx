import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PortfolioWidgetProps {
  widget: any;
  onUpdateSettings: (settings: Record<string, any>) => void;
  onRemove: () => void;
  onToggleEnabled: () => void;
}

export default function PortfolioWidget({ widget, onUpdateSettings }: PortfolioWidgetProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(widget.settings);

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['/api/trading/portfolio'],
    queryFn: () => apiRequest('GET', '/api/trading/portfolio'),
    retry: false,
  });

  const { data: performance } = useQuery({
    queryKey: ['/api/trading/performance'],
    queryFn: () => apiRequest('GET', '/api/trading/performance'),
    retry: false,
  });

  const saveSettings = () => {
    onUpdateSettings(localSettings);
    setIsSettingsOpen(false);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock portfolio data for demonstration
  const portfolioData = portfolio || {
    totalValue: 125430.50,
    totalPnL: 12543.25,
    totalPnLPercent: 11.12,
    positions: [
      { symbol: 'BTCUSDT', quantity: 1.5, value: 75000, allocation: 59.8, pnl: 8500, pnlPercent: 12.8 },
      { symbol: 'ETHUSDT', quantity: 15.2, value: 32500, allocation: 25.9, pnl: 2800, pnlPercent: 9.4 },
      { symbol: 'SOLUSDT', quantity: 85.7, value: 12430, allocation: 9.9, pnl: 980, pnlPercent: 8.6 },
      { symbol: 'ADAUSDT', quantity: 12500, value: 5500, allocation: 4.4, pnl: 263, pnlPercent: 5.0 },
    ]
  };

  const performanceData = performance || {
    dailyPnL: 1250.30,
    dailyPnLPercent: 1.01,
    weeklyPnL: 5430.80,
    weeklyPnLPercent: 4.52,
    monthlyPnL: 12543.25,
    monthlyPnLPercent: 11.12
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Portfolio Overview
        </CardTitle>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
              <Settings className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Portfolio Widget Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-allocation"
                  checked={localSettings.showAllocation}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, showAllocation: checked})}
                />
                <Label htmlFor="show-allocation">Show allocation breakdown</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-pnl"
                  checked={localSettings.showPnL}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, showPnL: checked})}
                />
                <Label htmlFor="show-pnl">Show P&L details</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveSettings}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Total Portfolio Value */}
        <div>
          <div className="text-xs text-muted-foreground">Total Portfolio Value</div>
          <div className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</div>
          <div className={`flex items-center gap-1 text-sm ${getChangeColor(portfolioData.totalPnL)}`}>
            {portfolioData.totalPnL >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {formatCurrency(Math.abs(portfolioData.totalPnL))} ({formatPercentage(portfolioData.totalPnLPercent)})
          </div>
        </div>

        {/* Performance Overview */}
        {localSettings.showPnL && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Performance</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">24h</div>
                <div className={getChangeColor(performanceData.dailyPnL)}>
                  {formatPercentage(performanceData.dailyPnLPercent)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">7d</div>
                <div className={getChangeColor(performanceData.weeklyPnL)}>
                  {formatPercentage(performanceData.weeklyPnLPercent)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">30d</div>
                <div className={getChangeColor(performanceData.monthlyPnL)}>
                  {formatPercentage(performanceData.monthlyPnLPercent)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Holdings */}
        {localSettings.showAllocation && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Top Holdings</div>
            <div className="space-y-1">
              {portfolioData.positions.slice(0, 3).map((position: any, index: number) => (
                <div key={position.symbol} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" style={{
                      backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`
                    }} />
                    <span className="font-medium">{position.symbol.replace('USDT', '')}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{position.allocation.toFixed(1)}%</div>
                    <div className={`${getChangeColor(position.pnl)} text-xs`}>
                      {formatPercentage(position.pnlPercent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}