"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

// Snow Component
const Snow = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = [];
    for (let i = 0; i < 100; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: Math.random() * 8 + 6, // 6-14 seconds
        opacity: Math.random() * 0.6 + 0.4, // 0.4-1.0 for better visibility
        size: Math.random() * 4 + 2, // 2-6px
        delay: Math.random() * 6,
      });
    }
    setSnowflakes(flakes);
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-100vh) translateX(0px);
          }
          100% {
            transform: translateY(100vh) translateX(80px);
          }
        }
        .snow-animation {
          animation: snowfall linear infinite;
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute snow-animation"
            style={{
              left: `${flake.left}%`,
              animationDuration: `${flake.animationDuration}s`,
              animationDelay: `${flake.delay}s`,
              top: "-10px",
            }}
          >
            <div
              className="rounded-full bg-gray-600"
              style={{
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                opacity: flake.opacity,
                boxShadow: "0 0 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const [businessType, setBusinessType] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* Snow Effect */}
      <Snow />

      {/* Header */}
      <header className="bg-transparent backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 mr-3">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-full h-full text-gray-800"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  Durable
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-10">
              <div className="flex items-center space-x-1 group cursor-pointer">
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 px-4 py-2 font-medium"
                >
                  Products
                </a>
                <svg
                  className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-800 transition-all duration-200 px-4 py-2 font-medium"
              >
                Pricing
              </a>
              <div className="flex items-center space-x-1 group cursor-pointer">
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 px-4 py-2 font-medium"
                >
                  Resources
                </a>
                <svg
                  className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </nav>

            <div className="flex items-center">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button className="bg-gray-700 hover:bg-gray-800 text-gray-200 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    Go to app
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button className="bg-gray-700 hover:bg-gray-800 text-gray-200 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    Go to app
                  </Button>
                </SignUpButton>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-gray-800 text-7xl leading-5xl md:text-6xl md:leading-6xl z-10 max-w-sm text-center md:max-w-2xl mb-8">
              AI that builds a <br />
              website for you
            </h1>
            <p className="text-base text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
              Get your business online in 30 seconds with the #1 AI <br />
              website builder and marketing platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-20"
          >
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto relative">
              <Input
                type="text"
                placeholder="What type of business are you building?"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="flex-1 h-14 px-6 pr-32 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button className="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-hidden inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap font-medium transition-[background,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 px-4 py-3 has-[>svg:first-child]:pl-3 has-[>svg:last-child]:pr-3 [&_svg:not([class*='size-'])]:size-6 bg-black/80 text-white/75 shadow-button-dark hover:text-blue-400 hover:shadow-button-dark absolute right-1 top-1/2 -translate-y-1/2 rounded-xl max-md:hidden">
                    Generate website
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button className="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-hidden inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap font-medium transition-[background,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 px-4 py-3 has-[>svg:first-child]:pl-3 has-[>svg:last-child]:pr-3 [&_svg:not([class*='size-'])]:size-6 bg-black/80 text-white/75 shadow-button-dark hover:text-blue-400 hover:shadow-button-dark absolute right-1 top-1/2 -translate-y-1/2 rounded-xl max-md:hidden">
                    Generate website
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </SignUpButton>
              )}
            </div>
          </motion.div>

          {/* Trustpilot Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-base text-gray-600"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-green-500 text-green-500"
                  />
                ))}
              </div>
              <span className="font-semibold">4.8 Stars on Trustpilot</span>
            </div>
            <div className="hidden sm:block w-2 h-2 bg-gray-300 rounded-full"></div>
            <div>
              <span className="font-semibold">
                10,000,000+ Websites generated
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
