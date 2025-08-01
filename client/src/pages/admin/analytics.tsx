import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  Target,
  Download,
  Filter,
  Calendar,
  PieChart,
  LineChart,
  BarChart2
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell } from "recharts";

export default function AdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics', selectedPeriod, selectedMetric],
    refetchInterval: 30000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['/api/admin/analytics/revenue', selectedPeriod],
  });

  const { data: userMetrics } = useQuery({
    queryKey: ['/api/admin/analytics/users', selectedPeriod],
  });

  const { data: tradingMetrics } = useQuery({
    queryKey: ['/api/admin/analytics/trading', selectedPeriod],
  });

  const { data: signalPerformance } = useQuery({
    queryKey: ['/api/admin/analytics/signals', selectedPeriod],
  });

  // Mock data for demonstration
  const mockOverviewData = {
    totalUsers: 12847,
    activeUsers: 8934,
    totalRevenue: 284567.89,
    monthlyRevenue: 45892.34,
    totalTrades: 156789,
    signalAccuracy: 78.4,
    userGrowth: 12.5,
    revenueGrowth: 8.3,
    tradesGrowth: 23.7,
    accuracyChange: 2.1
  };

  const mockChartData = [
    { name: 'Jan', users: 4000, revenue: 24000, trades: 2400 },
    { name: 'Feb', users: 3000, revenue: 13980, trades: 2210 },
    { name: 'Mar', users: 2000, revenue: 29800, trades: 2290 },
    { name: 'Apr', users: 2780, revenue: 39080, trades: 2000 },
    { name: 'May', users: 1890, revenue: 48000, trades: 2181 },
    { name: 'Jun', users: 2390, revenue: 38000, trades: 2500 },
    { name: 'Jul', users: 3490, revenue: 43000, trades: 2100 },
  ];

  const mockUserData = [
    { name: 'Week 1', newUsers: 120, activeUsers: 890 },
    { name: 'Week 2', newUsers: 150, activeUsers: 920 },
    { name: 'Week 3', newUsers: 180, activeUsers: 1050 },
    { name: 'Week 4', newUsers: 220, activeUsers: 1180 },
  ];

  const mockRevenueData = [
    { name: 'Basic', value: 35000, color: '#0088FE' },
    { name: 'Premium', value: 45000, color: '#00C49F' },
    { name: 'Pro', value: 30000, color: '#FFBB28' },
  ];

  const mockSignalAccuracy = [
    { date: '2025-01-01', accuracy: 78.5 },
    { date: '2025-01-07', accuracy: 82.1 },
    { date: '2025-01-14', accuracy: 75.3 },
    { date: '2025-01-21', accuracy: 84.7 },
    { date: '2025-01-28', accuracy: 79.2 },
    { date: '2025-02-04', accuracy: 86.1 },
    { date: '2025-02-11', accuracy: 83.4 },
  ];

  const periods = [
    { value: '1d', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const exportReport = () => {
    // Generate and download comprehensive report
    const reportData = {
      period: selectedPeriod,
      generated: new Date().toISOString(),
      metrics: mockOverviewData,
      chartData: mockChartData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
          {/* Header */}
          <Header 
            title="Analytics & Reporting" 
            subtitle="Comprehensive platform analytics and performance metrics"
          >
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value || "default"}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{mockOverviewData.totalUsers.toLocaleString()}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{mockOverviewData.userGrowth}% from last month
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">${mockOverviewData.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{mockOverviewData.revenueGrowth}% from last month
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Trades</p>
                        <p className="text-2xl font-bold">{mockOverviewData.totalTrades.toLocaleString()}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{mockOverviewData.tradesGrowth}% from last month
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Signal Accuracy</p>
                        <p className="text-2xl font-bold">{mockOverviewData.signalAccuracy}%</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{mockOverviewData.accuracyChange}% from last month
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-5 max-w-4xl">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="trading">Trading</TabsTrigger>
                  <TabsTrigger value="signals">Signals</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Growth Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="users" fill="#3b82f6" name="Users" />
                              <Bar dataKey="trades" fill="#10b981" name="Trades" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <PieChart 
                                data={mockRevenueData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {mockRevenueData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </PieChart>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={mockUserData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="newUsers" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                name="New Users"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="activeUsers" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="Active Users"
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>User Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Total Registered</span>
                            <Badge variant="outline">{mockOverviewData.totalUsers}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Active Users</span>
                            <Badge variant="outline" className="text-green-600">{mockOverviewData.activeUsers}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Monthly Growth</span>
                            <Badge variant="outline">{mockOverviewData.userGrowth}%</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Retention Rate</span>
                            <Badge variant="outline">87.2%</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Revenue Tab */}
                <TabsContent value="revenue" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={mockChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                name="Revenue ($)"
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Total Revenue</span>
                            <Badge variant="outline">${mockOverviewData.totalRevenue.toLocaleString()}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Monthly Revenue</span>
                            <Badge variant="outline" className="text-green-600">${mockOverviewData.monthlyRevenue.toLocaleString()}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Growth Rate</span>
                            <Badge variant="outline">{mockOverviewData.revenueGrowth}%</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Average per User</span>
                            <Badge variant="outline">${(mockOverviewData.totalRevenue / mockOverviewData.totalUsers).toFixed(2)}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Trading Tab */}
                <TabsContent value="trading" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Trading Volume</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="trades" fill="#8b5cf6" name="Trades" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Trading Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Total Trades</span>
                            <Badge variant="outline">{mockOverviewData.totalTrades.toLocaleString()}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Successful Trades</span>
                            <Badge variant="outline" className="text-green-600">{Math.floor(mockOverviewData.totalTrades * 0.73).toLocaleString()}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Success Rate</span>
                            <Badge variant="outline">73.2%</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Average Trade Size</span>
                            <Badge variant="outline">$1,247</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Signals Tab */}
                <TabsContent value="signals" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Signal Accuracy Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={mockSignalAccuracy}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="accuracy" 
                                stroke="#f59e0b" 
                                strokeWidth={3}
                                name="Accuracy (%)"
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signal Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Signals</span>
                    <Badge variant="outline">{(signalPerformance as any)?.totalSignals || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Successful Signals</span>
                    <Badge variant="outline" className="text-green-600">{(signalPerformance as any)?.successfulSignals || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Failed Signals</span>
                    <Badge variant="outline" className="text-red-600">{(signalPerformance as any)?.failedSignals || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Accuracy Rate</span>
                    <Badge variant="outline">{(signalPerformance as any)?.accuracy || 0}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}