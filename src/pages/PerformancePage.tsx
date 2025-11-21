import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  usePerformanceDashboard,
  useCDNAnalytics,
  useAlerts
} from "@/hooks/use-performance";
import { CacheManagementDialog } from "@/components/performance/CacheManagementDialog";
import { BackgroundJobDashboard } from "@/components/performance/BackgroundJobDashboard";
import { AlertConfigurationForm } from "@/components/performance/AlertConfigurationForm";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Server,
  Zap,
  Settings,
  RefreshCw
} from "lucide-react";
import { format, subDays } from "date-fns";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PerformancePage() {
  const [dateRange, setDateRange] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [isCacheDialogOpen, setIsCacheDialogOpen] = useState(false);
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);

  const { data: dashboard, isLoading: dashboardLoading } = usePerformanceDashboard({
    date_range: dateRange,
  });

  const { data: cdnAnalytics, isLoading: cdnLoading } = useCDNAnalytics({
    date_range: dateRange,
  });

  const { data: alerts, isLoading: alertsLoading } = useAlerts({
    status: 'active',
    limit: 5,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">Performance & CDN</h1>
          <p className="text-foreground-secondary mt-1">
            Monitor system performance, caching, and content delivery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsCacheDialogOpen(true)}>
            <Database className="h-4 w-4 mr-2" />
            Manage Cache
          </Button>
          <Button variant="outline" onClick={() => setIsAlertConfigOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Alert Settings
          </Button>
        </div>
      </div>

      {/* System Health Status */}
      {dashboardLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : dashboard?.system_health && (
        <Card className="card-base">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${getHealthStatusColor(dashboard.system_health.status)}`} />
                <div>
                  <h3 className="font-semibold text-foreground-primary">
                    System Status: {dashboard.system_health.status.toUpperCase()}
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    Uptime: {dashboard.system_health.uptime_percentage.toFixed(2)}% | 
                    SLA Compliance: {dashboard.system_health.sla_compliance.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground-primary">
                    {dashboard.active_alerts}
                  </div>
                  <div className="text-xs text-foreground-secondary">Active Alerts</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="card-base">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : dashboard ? (
          <>
            <Card className="card-base hover:shadow-card-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary">
                  CDN Cache Hit Rate
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground-primary">
                  {dashboard.cdn_analytics.cache_hit_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-foreground-secondary mt-1">
                  {dashboard.cdn_analytics.total_requests.toLocaleString()} requests
                </p>
              </CardContent>
            </Card>

            <Card className="card-base hover:shadow-card-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary">
                  Avg Response Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground-primary">
                  {formatDuration(dashboard.cdn_analytics.avg_response_time)}
                </div>
                <p className="text-xs text-foreground-secondary mt-1">
                  {formatBytes(dashboard.cdn_analytics.total_bandwidth)} bandwidth
                </p>
              </CardContent>
            </Card>

            <Card className="card-base hover:shadow-card-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary">
                  Cache Hit Rate
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground-primary">
                  {dashboard.cache_metrics.overall_hit_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-foreground-secondary mt-1">
                  {dashboard.cache_metrics.total_hits.toLocaleString()} hits
                </p>
              </CardContent>
            </Card>

            <Card className="card-base hover:shadow-card-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary">
                  Background Jobs
                </CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground-primary">
                  {dashboard.background_jobs.processing}
                </div>
                <p className="text-xs text-foreground-secondary mt-1">
                  {dashboard.background_jobs.pending} pending
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Filters */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle className="text-lg">Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cdn">CDN Analytics</TabsTrigger>
          <TabsTrigger value="cache">Cache Metrics</TabsTrigger>
          <TabsTrigger value="jobs">Background Jobs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CDN Performance Chart */}
            <Card className="card-base">
              <CardHeader>
                <CardTitle className="text-lg">CDN Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {cdnLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : cdnAnalytics && cdnAnalytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={cdnAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                      />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="cache_hit_rate" 
                        stroke="#2563EB" 
                        fill="#2563EB" 
                        fillOpacity={0.2}
                        name="Cache Hit Rate %"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avg_response_time" 
                        stroke="#22C55E" 
                        fill="#22C55E" 
                        fillOpacity={0.2}
                        name="Avg Response Time (ms)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-foreground-secondary">
                    No CDN data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Regional Distribution */}
            <Card className="card-base">
              <CardHeader>
                <CardTitle className="text-lg">Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : dashboard?.cdn_analytics.regional_distribution && dashboard.cdn_analytics.regional_distribution.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.cdn_analytics.regional_distribution.map((region, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground-primary">{region.region}</span>
                          <span className="text-sm text-foreground-secondary">
                            {region.requests.toLocaleString()} requests
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full transition-all"
                            style={{ width: `${region.cache_hit_rate}%` }}
                          />
                        </div>
                        <div className="text-xs text-foreground-secondary">
                          Cache hit rate: {region.cache_hit_rate.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-foreground-secondary">
                    No regional data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <div>
                          <div className="font-medium text-foreground-primary">{alert.title}</div>
                          <div className="text-sm text-foreground-secondary">{alert.message}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{alert.severity}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground-secondary">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cdn" className="space-y-4">
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg">CDN Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {cdnLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : cdnAnalytics && cdnAnalytics.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={cdnAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total_requests" 
                      stroke="#2563EB" 
                      strokeWidth={2}
                      name="Total Requests"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cache_hits" 
                      stroke="#22C55E" 
                      strokeWidth={2}
                      name="Cache Hits"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cache_misses" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Cache Misses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-foreground-secondary">
                  No CDN analytics data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          {dashboardLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : dashboard ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="text-lg">Cache Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Total Records</span>
                    <span className="font-semibold text-foreground-primary">
                      {dashboard.cache_metrics.total_records.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Active Records</span>
                    <span className="font-semibold text-foreground-primary">
                      {dashboard.cache_metrics.active_records.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Total Hits</span>
                    <span className="font-semibold text-foreground-primary">
                      {dashboard.cache_metrics.total_hits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Total Misses</span>
                    <span className="font-semibold text-foreground-primary">
                      {dashboard.cache_metrics.total_misses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Overall Hit Rate</span>
                    <span className="font-semibold text-foreground-primary">
                      {dashboard.cache_metrics.overall_hit_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Avg Cache Size</span>
                    <span className="font-semibold text-foreground-primary">
                      {formatBytes(dashboard.cache_metrics.avg_cache_size)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="text-lg">Cache Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsCacheDialogOpen(true)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Manage Cache Entries
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    View Cache Records
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <BackgroundJobDashboard />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Alert Management</span>
                <Button variant="outline" size="sm" onClick={() => setIsAlertConfigOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Alerts
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <div className="flex-1">
                          <div className="font-medium text-foreground-primary">{alert.title}</div>
                          <div className="text-sm text-foreground-secondary mt-1">{alert.message}</div>
                          <div className="text-xs text-foreground-secondary mt-1">
                            Triggered: {format(new Date(alert.triggered_at), 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{alert.severity}</Badge>
                        <Badge variant="outline">{alert.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-foreground-secondary">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CacheManagementDialog
        open={isCacheDialogOpen}
        onOpenChange={setIsCacheDialogOpen}
      />

      <AlertConfigurationForm
        open={isAlertConfigOpen}
        onOpenChange={setIsAlertConfigOpen}
      />
    </div>
  );
}
