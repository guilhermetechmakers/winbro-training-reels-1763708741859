import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingState } from "@/components/states";
import { EmptyState } from "@/components/states";
import { useSessions, useRevokeSession, useRevokeAllSessions } from "@/hooks/use-auth";
import { Monitor, Trash2, Shield, AlertTriangle } from "lucide-react";

export default function SessionManagementPage() {
  const { data: sessions, isLoading, error } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();

  const handleRevokeSession = (sessionId: string) => {
    revokeSession.mutate(sessionId);
  };

  const handleRevokeAll = () => {
    revokeAllSessions.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingState variant="list" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-foreground-secondary">Failed to load sessions. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Monitor}
          title="No active sessions"
          description="You don't have any active sessions at the moment."
        />
      </div>
    );
  }

  const currentSession = sessions.find(s => s.is_current);
  const otherSessions = sessions.filter(s => !s.is_current);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Session Management</h1>
        <p className="text-foreground-secondary">
          Manage your active sessions and devices. You can revoke access from any device at any time.
        </p>
      </div>

      {/* Current Session */}
      {currentSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Current Session
                </CardTitle>
                <CardDescription className="mt-1">
                  This is your current active session
                </CardDescription>
              </div>
              <div className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                Active
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Device</p>
                <p className="font-medium">{currentSession.device_info}</p>
              </div>
              {currentSession.ip_address && (
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">IP Address</p>
                  <p className="font-medium">{currentSession.ip_address}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Login Time</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(currentSession.login_time), { addSuffix: true })}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Last Access</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(currentSession.last_access_time), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Other Active Sessions
                </CardTitle>
                <CardDescription className="mt-1">
                  {otherSessions.length} other active session{otherSessions.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Revoke All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out from all other devices. Your current session will remain active.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevokeAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Revoke All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otherSessions.map((session) => (
                <div
                  key={session.session_id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Device</p>
                      <p className="font-medium">{session.device_info}</p>
                    </div>
                    {session.ip_address && (
                      <div>
                        <p className="text-sm text-foreground-secondary mb-1">IP Address</p>
                        <p className="font-medium">{session.ip_address}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Last Access</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(session.last_access_time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign you out from this device. Are you sure you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRevokeSession(session.session_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
