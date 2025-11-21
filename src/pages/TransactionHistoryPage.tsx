import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionHistoryPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Transaction History</h1>
        <p className="text-foreground-secondary mt-1">
          View and manage your invoices and payment history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-center py-12">
            Transactions table with filters, invoice links, and download PDF would be here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
