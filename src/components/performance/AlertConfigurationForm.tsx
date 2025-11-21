import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  useAlertConfigurations,
  useCreateAlertConfiguration,
  useUpdateAlertConfiguration,
  useDeleteAlertConfiguration,
  useToggleAlertConfiguration,
} from "@/hooks/use-performance";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings, Plus, Trash2, Edit } from "lucide-react";

interface AlertConfigurationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertConfigurationForm({ open, onOpenChange }: AlertConfigurationFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: configurations, isLoading } = useAlertConfigurations();
  const createConfig = useCreateAlertConfiguration();
  const updateConfig = useUpdateAlertConfiguration();
  const deleteConfig = useDeleteAlertConfiguration();
  const toggleConfig = useToggleAlertConfiguration();

  const [formData, setFormData] = useState({
    alert_type: 'cache_hit_rate_low' as const,
    metric_name: '',
    threshold_value: 0,
    comparison: 'less_than' as const,
    severity: 'medium' as const,
    enabled: true,
    notification_channels: [] as ('email' | 'sms' | 'webhook' | 'slack')[],
    notification_recipients: '',
    cooldown_minutes: 60,
  });

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      alert_type: 'cache_hit_rate_low',
      metric_name: '',
      threshold_value: 0,
      comparison: 'less_than',
      severity: 'medium',
      enabled: true,
      notification_channels: [],
      notification_recipients: '',
      cooldown_minutes: 60,
    });
  };

  const handleEdit = (config: any) => {
    setEditingId(config.id);
    setFormData({
      alert_type: config.alert_type,
      metric_name: config.metric_name,
      threshold_value: config.threshold_value,
      comparison: config.comparison,
      severity: config.severity,
      enabled: config.enabled,
      notification_channels: config.notification_channels,
      notification_recipients: config.notification_recipients.join('\n'),
      cooldown_minutes: config.cooldown_minutes,
    });
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      notification_recipients: formData.notification_recipients
        .split('\n')
        .filter(r => r.trim()),
    };

    if (editingId) {
      updateConfig.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            setEditingId(null);
            setIsCreating(false);
            setFormData({
              alert_type: 'cache_hit_rate_low',
              metric_name: '',
              threshold_value: 0,
              comparison: 'less_than',
              severity: 'medium',
              enabled: true,
              notification_channels: [],
              notification_recipients: '',
              cooldown_minutes: 60,
            });
          },
        }
      );
    } else {
      createConfig.mutate(data, {
        onSuccess: () => {
          setIsCreating(false);
          setFormData({
            alert_type: 'cache_hit_rate_low',
            metric_name: '',
            threshold_value: 0,
            comparison: 'less_than',
            severity: 'medium',
            enabled: true,
            notification_channels: [],
            notification_recipients: '',
            cooldown_minutes: 60,
          });
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteConfig.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
          setShowDeleteConfirm(false);
        },
      });
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    toggleConfig.mutate({ id, enabled });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Alert Configurations
            </DialogTitle>
            <DialogDescription>
              Configure alert thresholds and notification settings for performance monitoring
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Existing Configurations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Alert Configurations</Label>
                <Button variant="outline" size="sm" onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Configuration
                </Button>
              </div>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : configurations && configurations.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Metric</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configurations.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">
                            {config.alert_type.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>{config.metric_name}</TableCell>
                          <TableCell>
                            {config.comparison === 'less_than' ? '<' : config.comparison === 'greater_than' ? '>' : '='}{' '}
                            {config.threshold_value}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              config.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              config.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              config.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {config.severity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={config.enabled}
                              onCheckedChange={(checked) => handleToggle(config.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(config)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteId(config.id);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-foreground-secondary">
                  No alert configurations found. Create one to get started.
                </div>
              )}
            </div>

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-foreground-primary">
                  {editingId ? 'Edit Configuration' : 'New Configuration'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-type">Alert Type</Label>
                    <Select
                      value={formData.alert_type}
                      onValueChange={(value: any) => setFormData({ ...formData, alert_type: value })}
                    >
                      <SelectTrigger id="alert-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sla_breach">SLA Breach</SelectItem>
                        <SelectItem value="cache_hit_rate_low">Cache Hit Rate Low</SelectItem>
                        <SelectItem value="high_error_rate">High Error Rate</SelectItem>
                        <SelectItem value="slow_response">Slow Response</SelectItem>
                        <SelectItem value="job_failure">Job Failure</SelectItem>
                        <SelectItem value="system_health">System Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metric-name">Metric Name</Label>
                    <Input
                      id="metric-name"
                      value={formData.metric_name}
                      onChange={(e) => setFormData({ ...formData, metric_name: e.target.value })}
                      placeholder="cache_hit_rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold Value</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={formData.threshold_value}
                      onChange={(e) => setFormData({ ...formData, threshold_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparison">Comparison</Label>
                    <Select
                      value={formData.comparison}
                      onValueChange={(value: any) => setFormData({ ...formData, comparison: value })}
                    >
                      <SelectTrigger id="comparison">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                    >
                      <SelectTrigger id="severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cooldown">Cooldown (minutes)</Label>
                    <Input
                      id="cooldown"
                      type="number"
                      value={formData.cooldown_minutes}
                      onChange={(e) => setFormData({ ...formData, cooldown_minutes: parseInt(e.target.value) || 60 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notification Channels</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="email"
                        checked={formData.notification_channels.includes('email')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              notification_channels: [...formData.notification_channels, 'email'],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              notification_channels: formData.notification_channels.filter(c => c !== 'email'),
                            });
                          }
                        }}
                      />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sms"
                        checked={formData.notification_channels.includes('sms')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              notification_channels: [...formData.notification_channels, 'sms'],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              notification_channels: formData.notification_channels.filter(c => c !== 'sms'),
                            });
                          }
                        }}
                      />
                      <Label htmlFor="sms">SMS</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="webhook"
                        checked={formData.notification_channels.includes('webhook')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              notification_channels: [...formData.notification_channels, 'webhook'],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              notification_channels: formData.notification_channels.filter(c => c !== 'webhook'),
                            });
                          }
                        }}
                      />
                      <Label htmlFor="webhook">Webhook</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="slack"
                        checked={formData.notification_channels.includes('slack')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              notification_channels: [...formData.notification_channels, 'slack'],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              notification_channels: formData.notification_channels.filter(c => c !== 'slack'),
                            });
                          }
                        }}
                      />
                      <Label htmlFor="slack">Slack</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipients">Notification Recipients (one per line)</Label>
                  <Textarea
                    id="recipients"
                    className="min-h-[100px]"
                    value={formData.notification_recipients}
                    onChange={(e) => setFormData({ ...formData, notification_recipients: e.target.value })}
                    placeholder="admin@example.com&#10;team@example.com"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label htmlFor="enabled">Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSubmit}>
                    {editingId ? 'Update' : 'Create'} Configuration
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Alert Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this alert configuration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
