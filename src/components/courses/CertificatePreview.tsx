import { Award, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Certificate, Course, User } from "@/types";
import { format } from "date-fns";

interface CertificatePreviewProps {
  certificate: Certificate;
  course?: Course;
  user?: User;
  onDownload?: () => void | Promise<void>;
  isLoading?: boolean;
}

export function CertificatePreview({
  certificate,
  course,
  user,
  onDownload,
  isLoading,
}: CertificatePreviewProps) {
  return (
    <Card className="card-base">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Certificate of Completion
          </CardTitle>
          {onDownload && (
            <Button size="sm" onClick={onDownload} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Certificate Preview */}
          <div className="border-2 border-primary/20 rounded-lg p-8 bg-gradient-to-br from-background to-muted/20">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground-primary mb-2">
                  Certificate of Completion
                </h2>
                <p className="text-muted-foreground">This certifies that</p>
              </div>
              <div className="py-4">
                <h3 className="text-3xl font-bold text-foreground-primary">
                  {user?.full_name || user?.email || "Student Name"}
                </h3>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">has successfully completed</p>
                <h4 className="text-xl font-semibold text-foreground-primary">
                  {course?.title || "Course Title"}
                </h4>
              </div>
              <div className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Issued on {format(new Date(certificate.issued_at), "MMMM d, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verification ID: {certificate.verification_id}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Course</p>
              <p className="text-foreground-primary">{course?.title || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Issued Date</p>
              <p className="text-foreground-primary">
                {format(new Date(certificate.issued_at), "MMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Recipient</p>
              <p className="text-foreground-primary">
                {user?.full_name || user?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Verification ID</p>
              <p className="text-sm font-mono text-foreground-primary">
                {certificate.verification_id}
              </p>
            </div>
          </div>

          {certificate.pdf_url && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Certificate PDF is available for download</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
