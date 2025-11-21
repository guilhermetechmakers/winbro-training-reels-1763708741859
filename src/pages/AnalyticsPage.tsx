import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/analytics/MetricCard";
import { ChartWidget } from "@/components/analytics/ChartWidget";
import { ReportCustomizationModal } from "@/components/analytics/ReportCustomizationModal";
import { ExportDialog } from "@/components/analytics/ExportDialog";
import { DetailViewModal } from "@/components/analytics/DetailViewModal";
import { useAnalyticsDashboard, useMetrics, useReports, useCreateReport } from "@/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  FileText, 
  Plus, 
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  BookOpen
} from "lucide-react";
import { format, subDays } from "date-fns";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const { data: dashboard, isLoading: dashboardLoading } = useAnalyticsDashboard({
    date_range: dateRange,
  });

  const { data: metrics, isLoading: metricsLoading } = useMetrics({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    date_range: dateRange,
  });

  const { data: reports } = useReports();
  const createReport = useCreateReport();

  const filteredMetrics = metrics?.filter(m => 
    selectedCategory === 'all' || m.category === selectedCategory
  ) || [];

  const handleMetricClick = (metricId: string) => {
    setSelectedMetricId(metricId);
    setIsDetailModalOpen(true);
  };

  const handleCreateReport = (data: any) => {
    createReport.mutate(data);
  };

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">Analytics & Reports</h1>
          <p className="text-foreground-secondary mt-1">
            Usage metrics and custom reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsReportModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="content_usage">Content Usage</SelectItem>
                  <SelectItem value="course_outcomes">Course Outcomes</SelectItem>
                  <SelectItem value="roi">ROI</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground-primary mb-4">Key Metrics</h2>
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="card-base">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMetrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                onClick={() => handleMetricClick(metric.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="courses">Top Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboardLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : dashboard?.trends && dashboard.trends.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dashboard.trends.slice(0, 4).map((trend) => (
                <ChartWidget
                  key={trend.metric_id}
                  title={trend.metric_name}
                  data={trend.data_points.map(dp => ({
                    ...dp,
                    date: format(new Date(dp.date), 'MMM d'),
                  }))}
                  chartType="line"
                  height={250}
                />
              ))}
            </div>
          ) : (
            <Card className="card-base">
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground-secondary">No trend data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {dashboardLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : dashboard?.trends && dashboard.trends.length > 0 ? (
            <div className="space-y-6">
              {dashboard.trends.map((trend) => (
                <ChartWidget
                  key={trend.metric_id}
                  title={trend.metric_name}
                  data={trend.data_points.map(dp => ({
                    ...dp,
                    date: format(new Date(dp.date), 'MMM d, yyyy'),
                  }))}
                  chartType="area"
                  height={300}
                />
              ))}
            </div>
          ) : (
            <Card className="card-base">
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground-secondary">No trend data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {dashboardLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : dashboard?.top_content && dashboard.top_content.length > 0 ? (
            <div className="space-y-2">
              {dashboard.top_content.map((item) => (
                <Card key={item.reel_id} className="card-base">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground-primary">{item.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-foreground-secondary">
                          <span>{item.views.toLocaleString()} views</span>
                          <span>{item.completion_rate.toFixed(1)}% completion</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-base">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground-secondary">No content data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {dashboardLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : dashboard?.top_courses && dashboard.top_courses.length > 0 ? (
            <div className="space-y-2">
              {dashboard.top_courses.map((item) => (
                <Card key={item.course_id} className="card-base">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground-primary">{item.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-foreground-secondary">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {item.enrollments.toLocaleString()} enrollments
                          </span>
                          <span>{item.completion_rate.toFixed(1)}% completion</span>
                          <span>Avg score: {item.avg_score.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-base">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground-secondary">No course data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Saved Reports */}
      {reports && reports.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground-primary mb-4">Saved Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="card-base hover:shadow-card-hover cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  {report.description && (
                    <p className="text-sm text-foreground-secondary mt-1">{report.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-foreground-secondary">
                    <span>{report.report_type.replace('_', ' ')}</span>
                    {report.is_scheduled && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Scheduled
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportCustomizationModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        onSubmit={handleCreateReport}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        filters={{ date_range: dateRange }}
      />

      <DetailViewModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        metricId={selectedMetricId}
        dateRange={dateRange}
      />
    </div>
  );
}
