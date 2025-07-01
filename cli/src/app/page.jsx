"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

// Snow Component
const Snow = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = [];
    for (let i = 0; i < 60; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: Math.random() * 15 + 25,
        opacity: Math.random() * 0.4 + 0.3,
        size: Math.random() * 1.5 + 1,
        delay: Math.random() * 12,
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
            transform: translateY(100vh) translateX(40px);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .snow-animation {
          animation-name: snowfall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @import url("https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap");
        .font-cursive {
          font-family: "Alex Brush", cursive;
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
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
              className="rounded-full bg-black"
              style={{
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                opacity: flake.opacity,
                boxShadow: "0 0 1px rgba(0,0,0,0.05)",
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
  const { scrollY } = useScroll();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [14, -14]);

  // Testimonials Carousel setup
  const carouselRef = useRef(null);
  const testimonials = [
    {
      quote:
        "With EonLG, everything felt really obvious and on other platforms I used, it was more complicated. I also love the CRM tool.",
      name: "Meredith May",
      company: "Color Wonder Balloon Co.",
      avatar: "/h1.jpg",
    },
    {
      quote:
        "EonLG is the only website builder that allowed me to apply my artistic side to the creation process. I didn't need technical skills to launch my site.",
      name: "Clark McMaster",
      company: "Ebl Jabs",
      avatar: "/h2.jpg",
    },
    {
      quote:
        "You could be someone who has no idea how to turn on a computer and you could easily use EonLG to build your website.",
      name: "Jessica Dennis",
      company: "Little Cooks Club",
      avatar: "/h3.jpg",
    },
    {
      quote:
        "EonLG gave me such a leg up. There are no distractions and nothing is complicated. When I have an idea for my site, I can go in and add it just like that.",
      name: "Adrian Pruett",
      company: "ONEBIGPARTY",
      avatar: "/h4.jpg",
    },
    {
      quote:
        "The fastest way I've ever put a site online. The AI copy alone saved hours of brainstorming.",
      name: "Heather Morin",
      company: "Maple Creative",
      avatar: "/h5.jpg",
    },
    {
      quote:
        "From zero to live site in minutes – I still can't believe how easy EonLG makes it.",
      name: "Liam Wong",
      company: "PixelForge Studio",
      avatar: "/h6.jpg",
    },
  ];

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      const width = carouselRef.current.offsetWidth;
      carouselRef.current.scrollBy({
        left: dir * width * 0.8,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush:ital,wght@0,400;1,400&family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .font-cursive {
            font-family: 'Alex Brush', cursive;
            font-style: italic;
          }
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-heading { font-family: 'Playfair Display', serif; }
        `}</style>
      </Head>

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
                <span className="text-2xl font-bold text-gray-800">EonLG</span>
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
                  <Button className="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-hidden inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap font-medium transition-[background,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 px-6 py-3 has-[>svg:first-child]:pl-3 has-[>svg:last-child]:pr-3 [&_svg:not([class*='size-'])]:size-6 bg-black/80 text-white/75 shadow-button-dark hover:bg-black/80 hover:text-white hover:shadow-button-dark rounded-xl">
                    Go to app
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button className="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-hidden inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap font-medium transition-[background,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 px-6 py-3 has-[>svg:first-child]:pl-3 has-[>svg:last-child]:pr-3 [&_svg:not([class*='size-'])]:size-6 bg-black/80 text-white/75 shadow-button-dark hover:bg-black/80 hover:text-white hover:shadow-button-dark rounded-xl">
                    Go to app
                  </Button>
                </SignUpButton>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center  to-blue-50/20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-transparent bg-[radial-gradient(89.47%_51.04%_at_44.27%_50%,_#E2E3E9_0%,_#D4D6DE_52.73%,_#3D3F4C_100%)] bg-clip-text font-medium tracking-tight leading-[1.1] text-[48px] sm:text-[56px] md:text-[72px] lg:text-[88px] xl:text-[96px] mx-auto text-center mb-6 sm:mb-8">
              AI that builds a <br />
              website for you
            </h1>
            <p
              className="text-xs sm:text-sm md:text-base text-black mb-12 sm:mb-16 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
              style={{
                fontFamily: "'Alex Brush', cursive",
                fontStyle: "italic",
              }}
            >
              Get your business online in 30 seconds with the #1 AI{" "}
              <br className="hidden sm:block" />
              website builder and marketing platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-20"
          >
            <div className="relative w-full max-w-[18rem] sm:max-w-md mx-auto">
              <Input
                type="text"
                placeholder="What type of business are you building?"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full h-9 sm:h-10 pl-3 pr-32 sm:pr-40 text-xs sm:text-sm border-2 border-gray-200 rounded-md focus:ring-4 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
              />
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button className="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-hidden inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap font-medium transition-[background,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 px-2 sm:px-3 text-[10px] sm:text-xs bg-black/80 text-white/75 shadow-button-dark hover:bg-black/80 hover:text-white hover:shadow-button-dark absolute top-1 bottom-1 right-1 rounded-md h-auto">
                    Generate website
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button className="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-hidden inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap font-medium transition-[background,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 px-2 sm:px-3 text-[10px] sm:text-xs bg-black/80 text-white/75 shadow-button-dark hover:bg-black/80 hover:text-white hover:shadow-button-dark absolute top-1 bottom-1 right-1 rounded-md h-auto">
                    Generate website
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </SignUpButton>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery Section with Pyramid Layout */}
      <section className="relative min-h-[80vh] sm:min-h-screen overflow-hidden bg-white py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Enhanced Aesthetic Scattered Pyramid Layout */}
          <div className="relative h-64 sm:h-80 lg:h-96 mb-8 sm:mb-12 lg:mb-16 overflow-hidden">
            {/* Floating background elements for ambiance */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-10 w-2 h-2 bg-blue-200 rounded-full opacity-40 animate-pulse"></div>
              <div
                className="absolute top-20 right-16 w-1 h-1 bg-purple-200 rounded-full opacity-60 animate-bounce"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-pink-200 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/3 right-1/4 w-1 h-1 bg-indigo-200 rounded-full opacity-40 animate-bounce"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>

            {/* Image 1 - Top center, slightly left - Enhanced */}
            <motion.div
              className="absolute top-0 left-1/6 sm:left-1/4 overflow-hidden rounded-lg sm:rounded-xl bg-neutral-50 w-40 h-30 sm:w-52 sm:h-40 lg:w-64 lg:h-48 z-10 shadow-lg hover:shadow-2xl transition-all duration-500 group"
              initial={{ y: 100, opacity: 0, rotate: -2 }}
              whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              whileHover={{
                scale: 1.05,
                rotate: 2,
                y: -5,
                transition: { duration: 0.3 },
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                y: useTransform(scrollY, [0, 1000], [0, -50]),
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
              <img
                src="/1.png"
                alt="Website example"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                width={294}
                height={221}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>

            {/* Image 2 - Top right, overlapping - Enhanced */}
            <motion.div
              className="absolute top-4 sm:top-8 right-1/6 sm:right-1/4 overflow-hidden rounded-lg sm:rounded-xl bg-neutral-50 w-32 h-24 sm:w-44 sm:h-32 lg:w-56 lg:h-42 z-20 shadow-lg hover:shadow-2xl transition-all duration-500 group"
              initial={{ y: 120, opacity: 0, rotate: 3 }}
              whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              whileHover={{
                scale: 1.08,
                rotate: -3,
                y: -8,
                transition: { duration: 0.3 },
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              style={{
                y: useTransform(scrollY, [0, 1000], [0, -40]),
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
              <img
                src="/2.png"
                alt="Website example"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                width={294}
                height={221}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>

            {/* Image 3 - Center, large and prominent - Enhanced with special effects */}
            <motion.div
              className="absolute top-8 sm:top-12 lg:top-16 left-1/2 transform -translate-x-1/2 overflow-hidden rounded-lg sm:rounded-xl bg-neutral-50 w-48 h-36 sm:w-60 sm:h-45 lg:w-72 lg:h-54 z-30 shadow-2xl hover:shadow-3xl transition-all duration-500 group"
              initial={{ y: 120, opacity: 0, scale: 0.9 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              whileHover={{
                scale: 1.1,
                y: -10,
                transition: { duration: 0.4 },
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{
                y: useTransform(scrollY, [0, 1000], [0, -60]),
              }}
            >
              {/* Glow effect for center image */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
              <img
                src="/3.png"
                alt="Website example"
                className="relative w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                width={294}
                height={221}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Sparkle effect */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
            </motion.div>

            {/* Image 4 - Bottom left - Enhanced */}
            <motion.div
              className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-8 lg:left-16 overflow-hidden rounded-lg sm:rounded-xl bg-neutral-50 w-36 h-28 sm:w-44 sm:h-34 lg:w-52 lg:h-40 z-15 shadow-lg hover:shadow-2xl transition-all duration-500 group"
              initial={{ y: 140, opacity: 0, rotate: -3 }}
              whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              whileHover={{
                scale: 1.06,
                rotate: 3,
                y: -6,
                transition: { duration: 0.3 },
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              style={{
                y: useTransform(scrollY, [0, 1000], [0, -30]),
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
              <img
                src="/4.png"
                alt="Website example"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                width={294}
                height={221}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>

            {/* Image 5 - Bottom right, partially behind center - Enhanced */}
            <motion.div
              className="absolute bottom-0 sm:bottom-0 lg:bottom-0 right-4 sm:right-12 lg:right-20 overflow-hidden rounded-lg sm:rounded-xl bg-neutral-50 w-40 h-30 sm:w-50 sm:h-38 lg:w-60 lg:h-44 z-25 shadow-lg hover:shadow-2xl transition-all duration-500 group"
              initial={{ y: 140, opacity: 0, rotate: 2 }}
              whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              whileHover={{
                scale: 1.07,
                rotate: -2,
                y: -7,
                transition: { duration: 0.3 },
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              style={{
                y: useTransform(scrollY, [0, 1000], [0, -70]),
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
              <img
                src="/5.png"
                alt="Website example"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                width={294}
                height={221}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>

            {/* Enhanced bottom fade effect with shimmer */}
            <div
              className="absolute bottom-0 left-0 right-0 h-14 sm:h-16 pointer-events-none z-40"
              style={{
                background:
                  "linear-gradient(to top, white 0%, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 75%, transparent 100%)",
              }}
            />

            {/* Subtle shimmer effect */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 pointer-events-none z-35 opacity-30"
              style={{
                background:
                  "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                animation: "shimmer 3s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </section>

      {/* Rotating Semi-Circle Wheel Section */}
      <section className="relative w-full overflow-hidden py-6 sm:py-12 bg-white">
        <div className="relative mx-auto max-w-6xl flex flex-col items-center justify-center gap-6 sm:gap-8">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl flex flex-col items-center text-center">
            <p className="text-xs sm:text-sm font-medium text-amber-900 mb-3">
              Your AI business partner
            </p>
            <div className="relative flex justify-center w-full mb-3 overflow-visible">
              <h2 className="font-cursive italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center text-gray-800 mb-6 sm:mb-8 md:mb-12">
                Modern rails to move money.
              </h2>
              <img
                src="/lv.png"
                alt="decorative"
                className="absolute right-210 top-1/2 -translate-y-1/2 w-20 sm:w-28 md:w-32 lg:w-40 h-auto pointer-events-none"
              />
            </div>
            <p className="font-cursive text-sm sm:text-base md:text-lg text-gray-800 max-w-xl italic">
              Developer API's to build entirely new money movement flows.
            </p>
          </div>

          {/* Rotating Semi-Circle Container */}
          <div
            ref={containerRef}
            className="relative w-full max-w-5xl h-64 sm:h-80 flex items-center justify-center"
          >
            <motion.div
              className="relative w-full h-full"
              style={{
                transformOrigin: "center bottom",
                rotate,
              }}
            >
              {/* More visible but subtle semi-circle visual guide */}
              <div
                className="absolute left-1/2 bottom-0 w-[600px] h-36 border-2 border-dashed border-gray-300 rounded-t-full transform -translate-x-1/2 opacity-30"
                style={{ borderRadius: "300px 300px 0 0" }}
              ></div>

              {/* Image 1 - Designing website (0s) - Far Left */}
              <motion.div
                className="absolute flex flex-col items-center"
                style={{
                  left: "10%",
                  bottom: "22%",
                  transform: "rotate(-12deg)",
                }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative mb-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center mb-2">
                    <img
                      alt="Designing website"
                      width="48"
                      height="48"
                      className="object-contain"
                      src="/a.png"
                    />
                  </div>
                  <div className="text-xs text-gray-500 absolute -top-6 left-1/2 transform -translate-x-1/2">
                    0s
                  </div>
                </div>
                <p className="text-sm font-thin text-center transform rotate-12deg">
                  Designing
                  <br />
                  website
                </p>
              </motion.div>

              {/* Image 2 - Writing content (10s) - Left */}
              <motion.div
                className="absolute flex flex-col items-center"
                style={{
                  left: "32%",
                  bottom: "30%",
                  transform: "rotate(-6deg)",
                }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative mb-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center mb-2">
                    <img
                      alt="Writing content"
                      width="48"
                      height="48"
                      className="object-contain"
                      src="/b.png"
                    />
                  </div>
                  <div className="text-xs text-gray-500 absolute -top-6 left-1/2 transform -translate-x-1/2">
                    10s
                  </div>
                </div>
                <p className="text-sm font-thin text-center transform rotate-6deg">
                  Writing
                  <br />
                  content
                </p>
              </motion.div>

              {/* Image 3 - Optimizing for SEO (20s) - Right */}
              <motion.div
                className="absolute flex flex-col items-center"
                style={{
                  right: "32%",
                  bottom: "30%",
                  transform: "rotate(6deg)",
                }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative mb-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center mb-2">
                    <img
                      alt="Optimizing for SEO"
                      width="48"
                      height="48"
                      className="object-contain"
                      src="/c.png"
                    />
                  </div>
                  <div className="text-xs text-gray-500 absolute -top-6 left-1/2 transform -translate-x-1/2">
                    20s
                  </div>
                </div>
                <p className="text-sm font-thin text-center transform -rotate-6deg">
                  Optimizing
                  <br />
                  for SEO
                </p>
              </motion.div>

              {/* Image 4 - Ready to go live (30s) - Far Right */}
              <motion.div
                className="absolute flex flex-col items-center"
                style={{
                  right: "10%",
                  bottom: "22%",
                  transform: "rotate(12deg)",
                }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative mb-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center mb-2">
                    <img
                      alt="Ready to go live"
                      width="48"
                      height="48"
                      className="object-contain"
                      src="/d.png"
                    />
                  </div>
                  <div className="text-xs text-gray-500 absolute -top-6 left-1/2 transform -translate-x-1/2">
                    30s
                  </div>
                </div>
                <p className="text-sm font-thin text-center transform -rotate-12deg">
                  Ready to
                  <br />
                  go live
                </p>
              </motion.div>

              {/* More elongated connection lines */}
              <svg
                className="absolute left-1/2 bottom-0 -translate-x-1/2 pointer-events-none opacity-40 w-full"
                height="180"
                viewBox="0 0 1000 220"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 80 230 Q 400 40 720 230"
                  stroke="#d1d5db"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative w-full bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-4xl text-center mb-12 px-4">
          <p className="text-xs font-semibold tracking-widest text-amber-900 mb-2">
            The #1 AI website builder
          </p>
          <h2 className="font-cursive italic text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-3">
            A website that
            <br className="sm:hidden" /> works for you
          </h2>
          <p className="font-cursive italic text-xs sm:text-sm text-gray-800 max-w-md mx-auto">
            Professionally designed, optimised for search, and ready to grow
            your business.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
          {/* Card 1 */}
          <div className="group relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-amber-400 via-gray-200 to-gray-400 rounded-full group-hover:w-20 transition-all duration-300"></span>
            <p className="text-xs font-semibold text-amber-700 mb-1">
              AI websites
            </p>
            <h3 className="font-cursive text-lg sm:text-xl text-gray-900 mb-2">
              Designed for you
            </h3>
            <p className="font-cursive italic text-[11px] sm:text-xs text-gray-800 mb-4">
              Skip hiring a designer, and get a beautiful customisable website
              out of the box.
            </p>
            <a
              href="#"
              className="text-sm font-medium text-amber-500 hover:text-amber-200 inline-flex items-center gap-1 mb-4"
            >
              AI Website Builder <span className="text-lg">→</span>
            </a>
            <img
              src="/l1.png"
              alt="Designed for you"
              className="w-full rounded-lg object-contain"
            />
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-amber-400 via-gray-200 to-gray-400 rounded-full group-hover:w-20 transition-all duration-300"></span>
            <p className="text-xs font-semibold text-amber-700 mb-1">
              AI copywriter
            </p>
            <h3 className="font-cursive text-lg sm:text-xl text-gray-900 mb-2">
              Written for you
            </h3>
            <p className="font-cursive italic text-[11px] sm:text-xs text-gray-800 mb-4">
              Not a wordsmith? No problem. EonLG writes high converting copy.
            </p>
            <a
              href="#"
              className="text-sm font-medium text-amber-500 hover:text-amber-200 inline-flex items-center gap-1 mb-4"
            >
              AI Copywriter <span className="text-lg">→</span>
            </a>
            <img
              src="/l2.png"
              alt="Written for you"
              className="w-full rounded-lg object-contain"
            />
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-amber-400 via-gray-200 to-gray-400 rounded-full group-hover:w-20 transition-all duration-300"></span>
            <p className="text-xs font-semibold text-amber-700 mb-1">SEO</p>
            <h3 className="font-cursive text-lg sm:text-xl text-gray-900 mb-2">
              Optimized for you
            </h3>
            <p className="font-cursive italic text-[11px] sm:text-xs text-gray-800 mb-4">
              Get found on Google faster. Your website is SEO-ready the moment
              it's live.
            </p>
            <a
              href="#"
              className="text-sm font-medium text-amber-500 hover:text-amber-200 inline-flex items-center gap-1 mb-4"
            >
              SEO Tools <span className="text-lg">→</span>
            </a>
            <img
              src="/l3.png"
              alt="Optimized for you"
              className="w-full rounded-lg object-contain"
            />
          </div>

          {/* Card 4 */}
          <div className="group relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-amber-400 via-gray-200 to-gray-400 rounded-full group-hover:w-20 transition-all duration-300"></span>
            <p className="text-xs font-semibold text-amber-700 mb-1">AI blog</p>
            <h3 className="font-cursive text-lg sm:text-xl text-gray-900 mb-2">
              Content created for you
            </h3>
            <p className="font-cursive italic text-[11px] sm:text-xs text-gray-800 mb-4">
              Put your marketing on autopilot. EonLG writes and publishes new
              blog content weekly.
            </p>
            <a
              href="#"
              className="text-sm font-medium text-amber-500 hover:text-amber-200 inline-flex items-center gap-1 mb-4"
            >
              AI Blog Builder <span className="text-lg">→</span>
            </a>
            <img
              src="/l4.png"
              alt="Content created for you"
              className="w-full rounded-lg object-contain"
            />
          </div>
        </div>
      </section>

      {/* New Two-Card Section */}
      <section className="relative w-full bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-4xl text-center mb-12 px-4">
          <h2 className="font-cursive italic text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-6">
            Send invoices and
            <br />
            manage contacts
          </h2>
          <p className="font-cursive italic text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
            Fully integrated lead and customer management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
          {/* Card 1 - Invoicing */}
          <div className="bg-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col w-full mx-auto overflow-visible max-w-[350px] md:max-w-full md:mx-0 relative">
            {/* Decorative overlay icon */}
            <img
              src="/pei.png"
              alt="decorative icon"
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 object-contain pointer-events-none"
            />
            <div className="flex-1 flex items-center justify-center mb-4">
              <img
                src="/manp.png"
                alt="Invoicing interface"
                className="w-full h-48 sm:h-56 md:h-60 object-contain rounded-lg"
              />
            </div>

            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Invoicing
              </p>
              <h3 className="font-cursive text-lg sm:text-xl text-gray-900 mb-2">
                Get paid
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Get paid faster and save time with simple invoicing tools.
              </p>
            </div>
          </div>

          {/* Card 2 - Contacts */}
          <div className="bg-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col w-full mx-auto overflow-visible max-w-[350px] md:max-w-full md:mx-0">
            <div className="mb-4">
              <img
                src="/cd2.png"
                alt="Contacts management interface"
                className="w-full h-auto rounded-lg object-contain transform scale-110 sm:scale-125 md:scale-150"
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 mb-2">Contacts</p>
              <h3 className="font-cursive text-lg sm:text-xl text-gray-900 mb-2">
                Grow your leads
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Everything you need to manage leads and contacts in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="relative w-full bg-white py-12 sm:py-20">
        <h2 className="font-cursive italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center text-gray-800 mb-10 leading-snug">
          Millions of business <br className="hidden sm:block" /> owners love
          EonLG
        </h2>

        <div className="relative max-w-6xl mx-auto px-4">
          {/* Carousel wrapper */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 no-scrollbar"
          >
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-gray-200/40 bg-white/70 backdrop-blur-lg shadow-md p-5 flex-shrink-0 w-64 sm:w-72 md:w-80 snap-start hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* decorative mini person */}
                {idx % 2 === 0 ? (
                  <span className="absolute -top-6 left-4 text-black text-xl select-none">
                    🕴️
                  </span>
                ) : (
                  <span className="absolute -top-6 right-4 text-black text-xl select-none">
                    🕴️
                  </span>
                )}

                {/* Quote Icon */}
                <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Quote className="w-5 h-5" />
                </div>

                <p className="text-sm sm:text-base text-gray-800 mb-6 leading-relaxed text-left">
                  {t.quote}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-xs text-gray-700">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-gray-500">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => scrollCarousel(-1)}
              className="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-hidden relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap font-medium transition-[background,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-black/5 text-black/55 hover:bg-black/10 hover:text-black/80 p-3 [&_svg:not([class*='size-'])]:size-6 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel(1)}
              className="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-hidden relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap font-medium transition-[background,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-black/5 text-black/55 hover:bg-black/10 hover:text-black/80 p-3 [&_svg:not([class*='size-'])]:size-6 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="relative w-full bg-white py-12 sm:py-20">
        <h2 className="font-cursive italic text-3xl sm:text-4xl md:text-5xl text-center text-gray-900 mb-6 sm:mb-8 md:mb-12">
          Resources
        </h2>

        <div className="flex flex-col md:flex-row justify-center gap-2 sm:gap-4 md:gap-6 max-w-6xl mx-auto px-4">
          {/* Card 1: Name Generator */}
          <CardContainer
            className="rounded-2xl"
            containerClassName="flex items-center justify-center py-4 md:py-0"
          >
            <CardBody className="bg-white border border-gray-200/40 p-6 sm:p-8 rounded-2xl shadow-md flex flex-col items-center text-center relative overflow-hidden">
              <CardItem
                as="p"
                className="text-xs font-medium text-green-700 mb-1"
                translateZ={20}
              >
                Name generator
              </CardItem>
              <CardItem
                className="font-cursive italic text-lg sm:text-xl text-gray-900 mb-4 max-w-xs"
                translateZ={20}
              >
                Generate a great business name
              </CardItem>
              <CardItem translateZ={20}>
                <Link
                  href="#"
                  className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 mb-6"
                >
                  Generate a name <ArrowRight className="w-4 h-4" />
                </Link>
              </CardItem>
              <CardItem translateZ={30}>
                <img
                  src="/chat.png"
                  alt="Name generator"
                  className="w-full max-w-sm object-contain"
                />
              </CardItem>
              {/* bottom fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
            </CardBody>
          </CardContainer>

          {/* Card 2: Templates */}
          <CardContainer
            className="rounded-2xl"
            containerClassName="flex items-center justify-center py-4 md:py-0"
          >
            <CardBody className="bg-white border border-gray-200/40 p-6 sm:p-8 rounded-2xl shadow-md flex flex-col items-center text-center relative overflow-hidden">
              <CardItem
                className="text-xs font-medium text-green-700 mb-1"
                translateZ={20}
              >
                Templates
              </CardItem>
              <CardItem
                className="font-cursive italic text-lg sm:text-xl text-gray-900 mb-4 max-w-xs"
                translateZ={20}
              >
                Find the perfect template
              </CardItem>
              <CardItem translateZ={20}>
                <Link
                  href="#"
                  className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 mb-6"
                >
                  Website templates <ArrowRight className="w-4 h-4" />
                </Link>
              </CardItem>
              <CardItem translateZ={30}>
                <img
                  src="/temp.png"
                  alt="Template previews"
                  className="w-full max-w-sm object-contain"
                />
              </CardItem>
              {/* bottom fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
            </CardBody>
          </CardContainer>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative w-full bg-white py-16 sm:py-24 text-center">
        <h2 className="font-cursive italic text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-4">
          Get started for free
        </h2>
        <p className="font-cursive italic text-sm sm:text-base text-gray-700 mb-10 max-w-xl mx-auto">
          Build a website and get your business online in minutes.
        </p>

        <div className="mx-auto w-full max-w-[18rem] sm:max-w-lg flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch">
          <Input
            type="text"
            placeholder="What type of business are you building?"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="flex-1 h-8 sm:h-9 pl-2 sm:pl-3 text-[11px] sm:text-xs border border-gray-300 rounded-md focus:ring-4 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200"
          />
          {isSignedIn ? (
            <Link href="/dashboard" className="shrink-0">
              <Button className="w-full sm:w-auto px-3 sm:px-4 h-8 sm:h-9 text-[11px] sm:text-xs bg-black/90 text-white hover:bg-black whitespace-nowrap">
                Generate website <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <SignUpButton mode="modal" className="shrink-0">
              <Button className="w-full sm:w-auto px-3 sm:px-4 h-8 sm:h-9 text-[11px] sm:text-xs bg-black/90 text-white hover:bg-black whitespace-nowrap">
                Generate website <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </SignUpButton>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative w-full bg-[#2b2b2b] text-gray-200 pt-10 pb-6">
        {/* top fade */}
        <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-b from-transparent to-[#2b2b2b] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-6 gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            {/* Simple diamond logo */}
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l5 5-5 5-5-5 5-5z" />
            </svg>
            <p className="text-xs leading-relaxed max-w-xs">
              EonLG makes owning a business easier than having a job.
            </p>
            <p className="text-[10px] text-gray-400">
              ©2025 EonLG Technologies Inc
            </p>

            {/* Language select */}
            <div className="relative w-28">
              <select className="w-full bg-black/20 border border-black/30 rounded-md py-1.5 pl-3 pr-8 text-xs text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>English</option>
                <option>Español</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>

          {/* Column helper */}
          {[
            {
              title: "Product",
              items: [
                "Pricing",
                "Website Builder",
                "Blog Builder",
                "Brand Builder",
                "Invoicing",
              ],
            },
            {
              title: "Resources",
              items: [
                "Blog",
                "Starter guides",
                "Website templates",
                "Customer stories",
                "AI tools",
              ],
            },
            {
              title: "Compare",
              items: ["Squarespace", "Wix", "Wordpress", "10web"],
            },
            {
              title: "Company",
              items: [
                "About",
                "Affiliate program",
                "Careers",
                "Privacy policy",
                "Help center",
                "Terms of service",
              ],
            },
            {
              title: "Social",
              items: [
                "Facebook",
                "X/Twitter",
                "Instagram",
                "LinkedIn",
                "TikTok",
                "YouTube",
              ],
            },
          ].map((col, i) => (
            <div key={i} className="space-y-3">
              <p className="text-xs font-semibold text-gray-100 mb-1">
                {col.title}
              </p>
              <ul className="space-y-1.5 text-xs">
                {col.items.map((it) => (
                  <li key={it}>
                    <a href="#" className="hover:text-white">
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>

      {/* Hide scrollbar globally for custom class */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none; /* IE & Edge */
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera*/
        }
      `}</style>
    </div>
  );
}
