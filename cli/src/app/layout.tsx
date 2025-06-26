import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EonLogic - AI Website Builder",
  description:
    "Create professional websites in seconds with AI-powered technology. Built-in SEO, marketing tools, CRM, and invoicing.",
  keywords: [
    "AI website builder",
    "website generator",
    "no-code",
    "SEO",
    "marketing tools",
  ],
  authors: [{ name: "EonLogic" }],
  creator: "EonLogic",
  publisher: "EonLogic",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eonlogic.com",
    title: "EonLogic - AI Website Builder",
    description:
      "Create professional websites in seconds with AI-powered technology.",
    siteName: "EonLogic",
  },
  twitter: {
    card: "summary_large_image",
    title: "EonLogic - AI Website Builder",
    description:
      "Create professional websites in seconds with AI-powered technology.",
    creator: "@eonlogic",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#1f2937",
        },
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          card: "shadow-xl border-0",
          headerTitle: "text-2xl font-bold text-gray-900",
          headerSubtitle: "text-gray-600",
        },
      }}
    >
      <html lang="en" className={inter.variable}>
        <head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#3B82F6" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover"
          />
        </head>
        <body className={`${inter.className} antialiased bg-gray-50`}>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#ffffff",
                  color: "#1f2937",
                  border: "1px solid #e5e7eb",
                },
              }}
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
