import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Help & Support</h1>
        <p className="text-foreground-secondary mt-1">
          Find answers and get help
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
        <Input
          type="search"
          placeholder="Search FAQ, guides, tutorials..."
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-center py-12">
            Searchable FAQ, guides, contact form, and video tutorials would be here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
