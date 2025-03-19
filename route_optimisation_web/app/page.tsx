import Link from "next/link"
import { ArrowRight, BarChart3, Clock, MapPin, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Truck className="h-6 w-6" />
            <span>RouteOptimizer</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Optimize Your Fleet Routes with Precision
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Maximize efficiency, reduce costs, and improve delivery times with our advanced route optimization
                    platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button className="w-full min-[400px]:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outline" className="w-full min-[400px]:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                    <img
                      src="/placeholder.svg?height=350&width=550"
                      alt="Route Optimization Map"
                      className="object-cover"
                      width={550}
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Powerful Route Optimization</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers comprehensive tools to optimize your fleet operations and reduce logistics costs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Multi-Destination Planning</h3>
                    <p className="text-muted-foreground">
                      Efficiently plan routes with multiple stops while considering vehicle capacity and demand
                      constraints.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Truck className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Vehicle Management</h3>
                    <p className="text-muted-foreground">
                      Manage your entire fleet with detailed vehicle specifications and capacity planning.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Performance Analytics</h3>
                    <p className="text-muted-foreground">
                      Track and analyze route performance with comprehensive metrics and visualizations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Time-Based Optimization</h3>
                    <p className="text-muted-foreground">
                      Consider time windows and delivery schedules in your route planning for maximum efficiency.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10 text-primary"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold">Clarke-Wright Algorithm</h3>
                    <p className="text-muted-foreground">
                      Leverage advanced algorithms to find the most efficient routes for your delivery operations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10 text-primary"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 7h10" />
                    <path d="M7 12h10" />
                    <path d="M7 17h10" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold">Export & Reporting</h3>
                    <p className="text-muted-foreground">
                      Export optimized routes and generate detailed reports for your logistics operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">About Us</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Transforming Logistics with Smart Route Planning
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  RouteOptimizer was built to solve the complex challenges faced by logistics companies. Our platform
                  combines advanced algorithms with an intuitive interface to make route optimization accessible to
                  businesses of all sizes.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button>Get Started</Button>
                  </Link>
                  <Link href="#contact">
                    <Button variant="outline">Contact Us</Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="grid gap-6">
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Our Mission</h3>
                    <p className="text-muted-foreground">
                      To empower logistics companies with technology that reduces costs, improves efficiency, and
                      minimizes environmental impact through optimized routing.
                    </p>
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Why Choose Us</h3>
                    <p className="text-muted-foreground">
                      Our platform is built by logistics experts who understand the real-world challenges of fleet
                      management and route planning.
                    </p>
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Results</h3>
                    <p className="text-muted-foreground">
                      Clients using our platform report an average of 20% reduction in fuel costs and 30% improvement in
                      delivery times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to optimize your fleet operations?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of logistics companies already saving time and money with RouteOptimizer.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <form className="flex gap-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                  type="email"
                />
                <Button type="submit">Subscribe</Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Sign up to get notified about new features.{" "}
                <Link href="/terms" className="underline underline-offset-2">
                  Terms & Conditions
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="w-full border-t bg-background py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-8">
          <div className="flex items-center gap-2 font-bold">
            <Truck className="h-6 w-6" />
            <span>RouteOptimizer</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2023 RouteOptimizer. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

