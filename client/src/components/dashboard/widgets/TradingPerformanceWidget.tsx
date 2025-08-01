import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Settings, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TradingPerformanceWidgetProps {
  widget: any;
  onUpdateSettings: (settings: Record<string, any>) => void;
  onRemove: () => void;
  onToggleEnabled: () => void;
}

export default function TradingPerformanceWidget({ widget, onUpdateSettings }: TradingPerformanceWidgetProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(widget.settings);

  const { data: performance, isLoading } = useQuery({
    queryKey: ['/api/trading/performance', localSettings.timeframe],
    queryFn: () => apiRequest('GET', `/api/trading/performance?timeframe=${localSettings.timeframe}`),
  });

  const saveSettings = () => {
    onUpdateSettings(localSettings);
    setIsSettingsOpen(false);
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

  // Mock performance data
  const mockPerformance = {
    totalTrades: 47,
    winRate: 68.09,
    totalPnL: 12543.75,
    totalPnLPercent: 15.68,
    avgWin: 856.23,
    avgLoss: -432.18,
    maxDrawdown: -2456.78,
    sharpeRatio: 1.85,
    profitFactor: 2.34,
    bestTrade: 1850.45,
    worstTrade: -850.22,
    consecutiveWins: 5,
    consecutiveLosses: 2,
    dailyReturns: [
      { date: '2025-01-01', return: 2.3 },
      { date: '2025-01-02', return: -0.8 },
      { date: '2025-01-03', return: 1.5 },
      { date: '2025-01-04', return: 3.2 },
      { date: '2025-01-05', return: -1.1 },
      { date: '2025-01-06', return: 2.8 },
      { date: '2025-01-07', return: 0.9 }
    ]
  };

  const performanceData = performance || mockPerformance;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Trading Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <LineChart className="h-4 w-4" />
          Trading Performance ({localSettings.timeframe})
        </CardTitle>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
              <Settings className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Performance Widget Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Time Frame</Label>
                <Select 
                  value={localSettings.timeframe} 
                  onValueChange={(value) => setLocalSettings({...localSettings, timeframe: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-chart"
                  checked={localSettings.showChart}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, showChart: checked})}
                />
                <Label htmlFor="show-chart">Show performance chart</Label>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Total P&L</div>
            <div className={`text-lg font-bold ${getChangeColor(performanceData.totalPnL)}`}>
              {formatCurrency(performanceData.totalPnL)}
            </div>
            <div className={`text-xs ${getChangeColor(performanceData.totalPnLPercent)}`}>
              {formatPercentage(performanceData.totalPnLPercent)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Win Rate</div>
            <div className="text-lg font-bold flex items-center gap-1">
              <Target className="h-4 w-4" />
              {performanceData.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {performanceData.totalTrades} trades
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Avg Win</div>
            <div className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(performanceData.avgWin)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg Loss</div>
            <div className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(Math.abs(performanceData.avgLoss))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
            <div className="font-medium">{performanceData.sharpeRatio.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Profit Factor</div>
            <div className="font-medium">{performanceData.profitFactor.toFixed(2)}</div>
          </div>
        </div>

        {/* Performance Chart */}
        {localSettings.showChart && performanceData.dailyReturns && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Daily Returns (%)</div>
            <div className="h-16 flex items-end space-x-1">
              {performanceData.dailyReturns.slice(-14).map((day: any, index: number) => {
                const height = Math.max(2, Math.abs(day.return) * 5);
                const isPositive = day.return >= 0;
                return (
                  <div
                    key={index}
                    className={`flex-1 ${
                      isPositive ? 'bg-green-500' : 'bg-red-500'
                    } rounded-sm opacity-80`}
                    style={{ height: `${height}px` }}
                    title={`${day.date}: ${formatPercentage(day.return)}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Performance */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Recent Activity</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Best Trade
            </div>
            <div className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(performanceData.bestTrade)}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Max Drawdown
            </div>
            <div className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(Math.abs(performanceData.maxDrawdown))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}