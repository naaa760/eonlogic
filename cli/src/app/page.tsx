"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Shield,
  BarChart3,
  Users,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn } = useUser();

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: "AI-Powered Generation",
      description:
        "Create professional websites in seconds with our advanced AI technology.",
    },
    {
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      title: "Custom Domains & Hosting",
      description:
        "Get free hosting and custom domains for all your generated websites.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: "Built-in SEO Tools",
      description:
        "Automatic SEO optimization to help your website rank higher on search engines.",
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Enterprise Security",
      description:
        "Bank-level security with SSL certificates and regular backups.",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Team Collaboration",
      description: "Work together with your team to build and manage websites.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-blue-600" />,
      title: "Smart Templates",
      description:
        "Choose from hundreds of AI-generated templates for any business type.",
    },
  ];

  const templates = [
    {
      name: "Modern Restaurant",
      category: "Restaurant",
      image: "/templates/restaurant.jpg",
      color: "from-orange-400 to-red-500",
    },
    {
      name: "Tech Startup",
      category: "Technology",
      image: "/templates/startup.jpg",
      color: "from-blue-400 to-purple-500",
    },
    {
      name: "Creative Agency",
      category: "Design",
      image: "/templates/agency.jpg",
      color: "from-pink-400 to-purple-500",
    },
    {
      name: "E-commerce Store",
      category: "Retail",
      image: "/templates/ecommerce.jpg",
      color: "from-green-400 to-blue-500",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  EonLogic
                </span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#templates"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Templates
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Get Started
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Build Professional Websites{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  in Seconds
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Our AI-powered website builder creates beautiful, professional
                websites for your business without any coding required. Just
                describe your business and watch the magic happen.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                    >
                      Start Building for Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </SignUpButton>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6"
                  >
                    Watch Demo
                  </Button>
                </>
              )}
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      AI Website Preview
                    </h3>
                    <p className="text-gray-600">
                      Your generated website will appear here
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed online
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI generation to hosting and SEO, we provide all the tools
              you need to build and grow your online presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Beautiful templates for every business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from hundreds of professionally designed templates, all
              optimized for your industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/4] mb-4">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-80`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <Globe className="h-6 w-6" />
                      </div>
                      <p className="font-medium">{template.name}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600">{template.category}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Templates
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to build your dream website?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust EonLogic to power their
              online presence.
            </p>

            {isSignedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-6"
                >
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-6"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">EonLogic</span>
              </div>
              <p className="text-gray-400">
                AI-powered website builder for modern businesses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EonLogic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
