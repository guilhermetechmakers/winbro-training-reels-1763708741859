import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  Check, 
  ArrowRight, 
  Video, 
  BookOpen, 
  Search, 
  Shield, 
  Zap,
  Star,
  Quote,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    message: "",
  });

  // Scroll animation observer
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-fade-in-up");
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, []);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Demo request submitted!", {
        description: "We'll contact you shortly to schedule your demo.",
      });
      
      setFormData({ name: "", email: "", company: "", role: "", message: "" });
      setShowDemoForm(false);
    } catch (error) {
      toast.error("Failed to submit demo request", {
        description: "Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Video,
      title: "Micro-Learning Reels",
      description: "20-30 second video reels for quick, focused training on machine setup and maintenance.",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Search,
      title: "Searchable Transcripts",
      description: "Time-synced transcripts make it easy to find exactly what you need in any video.",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: BookOpen,
      title: "Course Builder",
      description: "Assemble reels into comprehensive courses with quizzes and certificates.",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Tenant-scoped libraries ensure your content stays within your organization.",
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Training Manager",
      company: "Manufacturing Corp",
      content: "Winbro Training Reels has transformed how we onboard new operators. The micro-learning format is perfect for our fast-paced environment.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Operations Director",
      company: "Industrial Solutions",
      content: "The searchable transcripts are a game-changer. Our team can find specific procedures in seconds instead of watching entire videos.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Safety Coordinator",
      company: "Advanced Manufacturing",
      content: "The course builder makes it easy to create structured training programs. Our completion rates have increased by 40%.",
      rating: 5,
    },
  ];

  const customerLogos = [
    "Manufacturing Corp",
    "Industrial Solutions",
    "Advanced Manufacturing",
    "Precision Tools Inc",
    "Global Manufacturing",
    "Tech Industries",
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
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Winbro Training</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/help" className="text-sm text-foreground-secondary hover:text-foreground-primary transition-colors">
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

      {/* Hero Section with Animated Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background-primary to-primary/10">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 md:py-32 text-center relative z-10">
          <div 
            ref={(el) => (sectionRefs.current[0] = el)}
            className="max-w-4xl mx-auto opacity-0"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in-down">
              <Sparkles className="h-4 w-4" />
              Micro-learning platform for manufacturing
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground-primary mb-6 leading-tight">
              Micro-Learning for{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Manufacturing
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Short 20-30 second video reels capture machine setup, tooling, maintenance and troubleshooting. 
              Searchable transcripts and course builder included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowVideoModal(true)}
                className="group hover:scale-105 transition-transform duration-200"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Sample Reel
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowDemoForm(true)}
                className="group hover:scale-105 transition-transform duration-200"
              >
                Request Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to="/signup">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="group hover:scale-105 transition-transform duration-200"
                >
                  Start Free Trial
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div 
          ref={(el) => (sectionRefs.current[1] = el)}
          className="text-center mb-16 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground-primary mb-4">
            Everything you need for effective training
          </h2>
          <p className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto">
            Built specifically for manufacturing teams
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border-0 shadow-card"
                ref={(el) => (sectionRefs.current[2 + index] = el)}
                style={{ opacity: 0 }}
              >
                <CardHeader>
                  <div className={`h-14 w-14 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Customer Logos Section */}
      <section className="bg-white py-12 border-y border-border">
        <div className="container mx-auto px-6">
          <div 
            ref={(el) => (sectionRefs.current[6] = el)}
            className="text-center mb-8 opacity-0"
          >
            <p className="text-sm text-foreground-secondary uppercase tracking-wide">
              Trusted by leading manufacturers
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {customerLogos.map((logo, index) => (
              <div
                key={index}
                className="text-foreground-secondary hover:text-foreground-primary transition-colors font-semibold text-lg opacity-60 hover:opacity-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-20">
        <div 
          ref={(el) => (sectionRefs.current[7] = el)}
          className="text-center mb-16 opacity-0"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground-primary mb-4">
            What our customers say
          </h2>
          <p className="text-lg text-foreground-secondary">
            Real feedback from manufacturing teams
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              ref={(el) => (sectionRefs.current[8 + index] = el)}
              style={{ opacity: 0 }}
            >
              <CardHeader>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 mb-2" />
                <CardDescription className="text-base leading-relaxed">
                  "{testimonial.content}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground-primary">{testimonial.name}</p>
                    <p className="text-sm text-foreground-secondary">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div 
            ref={(el) => (sectionRefs.current[11] = el)}
            className="text-center mb-16 opacity-0"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground-primary mb-4">
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
                className={`group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular ? "border-2 border-primary shadow-lg scale-105" : ""
                }`}
                ref={(el) => (sectionRefs.current[12 + index] = el)}
                style={{ opacity: 0 }}
              >
                {plan.popular && (
                  <div className="bg-primary text-white text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-foreground-secondary text-lg">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-base">{plan.description}</CardDescription>
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
                    <Button 
                      className="w-full group" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-primary/5 to-blue-500/5 py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, value: "10K+", label: "Active Users" },
              { icon: Video, value: "50K+", label: "Training Reels" },
              { icon: TrendingUp, value: "95%", label: "Completion Rate" },
              { icon: Clock, value: "20-30s", label: "Avg. Reel Duration" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center"
                  ref={(el) => (sectionRefs.current[15 + index] = el)}
                  style={{ opacity: 0 }}
                >
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-4xl font-bold text-foreground-primary mb-2">{stat.value}</div>
                  <div className="text-foreground-secondary">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Card 
          className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-blue-600 text-white border-0 shadow-lg"
          ref={(el) => (sectionRefs.current[19] = el)}
          style={{ opacity: 0 }}
        >
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl">Ready to get started?</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Start your free trial today. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 group"
              onClick={() => setShowDemoForm(true)}
            >
              Request Demo
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
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
                <li>
                  <Link to="/help" className="hover:text-foreground-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/subscriptions" className="hover:text-foreground-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-foreground-primary transition-colors">
                    Help
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li>
                  <Link to="/help" className="hover:text-foreground-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-foreground-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li>
                  <Link to="/privacy" className="hover:text-foreground-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-foreground-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-foreground-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
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
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Sample Training Reel</DialogTitle>
            <DialogDescription>
              Watch a 20-30 second example of our micro-learning format
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
            <button
              onClick={() => {
                // In a real app, this would play the video
                toast.info("Video playback would start here", {
                  description: "HLS player with quality selector and captions",
                });
              }}
              className="relative z-10 text-center group/play"
            >
              <div className="h-20 w-20 rounded-full bg-white/90 flex items-center justify-center mb-4 group-hover/play:scale-110 transition-transform shadow-lg">
                <Play className="h-10 w-10 text-primary ml-1" />
              </div>
              <p className="text-white font-medium">Click to play sample reel</p>
              <p className="text-sm text-white/80 mt-2">
                HLS player with quality selector and captions
              </p>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demo Signup Form Modal */}
      <Dialog open={showDemoForm} onOpenChange={setShowDemoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request a Demo</DialogTitle>
            <DialogDescription>
              Fill out the form below and we'll contact you to schedule a personalized demo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your Company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Training Manager"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your training needs..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDemoForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
