import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Check, ArrowRight, Video, BookOpen, Search, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const features = [
    {
      icon: Video,
      title: "Micro-Learning Reels",
      description: "20-30 second video reels for quick, focused training on machine setup and maintenance.",
    },
    {
      icon: Search,
      title: "Searchable Transcripts",
      description: "Time-synced transcripts make it easy to find exactly what you need in any video.",
    },
    {
      icon: BookOpen,
      title: "Course Builder",
      description: "Assemble reels into comprehensive courses with quizzes and certificates.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Tenant-scoped libraries ensure your content stays within your organization.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small teams",
      features: [
        "Up to 50 users",
        "100 video reels",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "For growing organizations",
      features: [
        "Up to 200 users",
        "Unlimited reels",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited users",
        "Unlimited reels",
        "Full analytics suite",
        "Dedicated support",
        "SSO integration",
        "Custom integrations",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Navigation */}
      <nav className="border-b border-border bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Winbro Training</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/help" className="text-sm text-foreground-secondary hover:text-foreground-primary">
              Help
            </Link>
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground-primary mb-6">
            Micro-Learning for Manufacturing
          </h1>
          <p className="text-xl text-foreground-secondary mb-8">
            Short 20-30 second video reels capture machine setup, tooling, maintenance and troubleshooting. 
            Searchable transcripts and course builder included.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setShowVideoModal(true)}>
              <Play className="mr-2 h-5 w-5" />
              Watch Sample Reel
            </Button>
            <Link to="/signup">
              <Button size="lg" variant="outline">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground-primary mb-4">
            Everything you need for effective training
          </h2>
          <p className="text-lg text-foreground-secondary">
            Built specifically for manufacturing teams
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground-primary mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-foreground-secondary">
              Choose the plan that's right for your organization
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={plan.popular ? "border-2 border-primary shadow-lg" : ""}
              >
                {plan.popular && (
                  <div className="bg-primary text-white text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-foreground-secondary">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/checkout">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Card className="max-w-2xl mx-auto bg-primary text-white border-0">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to get started?</CardTitle>
            <CardDescription className="text-white/80">
              Start your free trial today. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Winbro Training</span>
              </div>
              <p className="text-sm text-foreground-secondary">
                Micro-learning platform for manufacturing teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link to="/help" className="hover:text-foreground-primary">Features</Link></li>
                <li><Link to="/help" className="hover:text-foreground-primary">Pricing</Link></li>
                <li><Link to="/help" className="hover:text-foreground-primary">Help</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link to="/help" className="hover:text-foreground-primary">About</Link></li>
                <li><Link to="/help" className="hover:text-foreground-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link to="/privacy" className="hover:text-foreground-primary">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-foreground-secondary pt-8 border-t border-border">
            <p>&copy; 2024 Winbro Training. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sample Reel Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sample Training Reel</DialogTitle>
            <DialogDescription>
              Watch a 20-30 second example of our micro-learning format
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-foreground-secondary">Video player would be embedded here</p>
              <p className="text-sm text-foreground-secondary mt-2">
                HLS player with quality selector and captions
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
