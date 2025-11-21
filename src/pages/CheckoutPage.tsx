import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Checkout</h1>
        <p className="text-foreground-secondary mt-1">
          Complete your subscription purchase
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-center py-12">
            Plan selector, billing form, Stripe payment, and invoice preview would be here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
