"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  Lightbulb,
  MapPin,
  Building,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BusinessInfo {
  name: string;
  type: string;
  location: string;
  description: string;
}

interface LocationSuggestion {
  place_name: string;
  place_name_en?: string;
  context?: Array<{ text: string; id: string }>;
}

export default function Onboarding() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    type: "",
    location: "",
    description: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
      return;
    }

    // Check if user has already completed onboarding
    if (isLoaded && isSignedIn && user) {
      const hasCompletedOnboarding = localStorage.getItem(
        `onboarding_completed_${user.id}`
      );
      if (hasCompletedOnboarding) {
        router.push("/dashboard");
        return;
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const generateWebsiteFromBusiness = async (info: BusinessInfo) => {
    setIsGenerating(true);

    // Mark onboarding as completed
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, "true");
    }

    // Store business info for later use
    localStorage.setItem(`business_info_${user?.id}`, JSON.stringify(info));

    // Clear any existing website data to force fresh generation
    if (user?.id) {
      localStorage.removeItem(`generated_website_${user.id}`);
    }

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Redirect to website builder
    router.push("/website");
  };

  const handleNext = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Auto-generate website after final step
      generateWebsiteFromBusiness(businessInfo);
    }
  };

  const handleBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingLocations(true);
    try {
      // Using Mapbox Geocoding API (free tier available)
      // You can also use other services like Google Places, OpenStreetMap Nominatim, etc.
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw&types=place,locality,neighborhood,address&limit=8`
      );

      if (response.ok) {
        const data = await response.json();
        setLocationSuggestions(data.features || []);
        setShowSuggestions(true);
      } else {
        // Fallback to a simple search if Mapbox fails
        const suggestions = await fallbackLocationSearch(query);
        setLocationSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      }
    } catch (error) {
      console.error("Location search error:", error);
      // Fallback to a simple search
      const suggestions = await fallbackLocationSearch(query);
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Fallback function using a free geocoding service
  const fallbackLocationSearch = async (
    query: string
  ): Promise<LocationSuggestion[]> => {
    try {
      // Using OpenStreetMap Nominatim (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=8&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        return data.map((item: { display_name: string }) => ({
          place_name: item.display_name,
          place_name_en: item.display_name,
        }));
      }
    } catch (error) {
      console.error("Fallback location search error:", error);
    }
    return [];
  };

  const handleLocationChange = (value: string) => {
    setBusinessInfo((prev) => ({ ...prev, location: value }));

    // Debounce the search to avoid too many API calls
    setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const selectLocation = (selectedLocation: LocationSuggestion) => {
    setBusinessInfo((prev) => ({
      ...prev,
      location: selectedLocation.place_name,
    }));
    setShowSuggestions(false);
  };

  const canProceed = () => {
    switch (onboardingStep) {
      case 1:
        return businessInfo.type.trim() !== "";
      case 2:
        return businessInfo.location.trim() !== "";
      case 3:
        return businessInfo.name.trim() !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicators */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  stepNum <= onboardingStep ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Step 1: Business Type */}
          {onboardingStep === 1 && (
            <div className="text-center">
              {/* Icons */}
              <div className="flex justify-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-red-500" />
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-orange-500" />
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
                What type of business are you building?
              </h1>

              {/* Input */}
              <div className="mb-8">
                <input
                  type="text"
                  placeholder="Eg. personal training and nutrition planning"
                  value={businessInfo.type}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full text-center text-lg px-6 py-4 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm outline-none"
                  autoFocus
                />
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-xl transition-all duration-200 font-medium ${
                  canProceed()
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {onboardingStep === 2 && (
            <div className="text-center">
              {/* Back Button */}
              <div className="flex justify-start mb-6">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Icons */}
              <div className="flex justify-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-500" />
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-500" />
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
                Where is your business located?
              </h1>

              {/* Location Input with Real Autocomplete */}
              <div className="mb-6 relative">
                <input
                  type="text"
                  placeholder="Type any city, state, or address..."
                  value={businessInfo.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() =>
                    businessInfo.location.length >= 2 &&
                    setShowSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  className="w-full text-left text-lg px-6 py-4 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm outline-none"
                  autoFocus
                />

                {/* Real Location Suggestions Dropdown */}
                {showSuggestions &&
                  (locationSuggestions.length > 0 || isLoadingLocations) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10">
                      {isLoadingLocations ? (
                        <div className="px-6 py-4 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          Searching locations...
                        </div>
                      ) : (
                        locationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => selectLocation(suggestion)}
                            className="w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors text-gray-700 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                          >
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {suggestion.place_name}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
              </div>

              {/* Next Button */}
              <div className="mb-6">
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`w-full px-8 py-4 rounded-xl transition-all duration-200 font-medium text-lg ${
                    canProceed()
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>Website Language</span>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-700">🇺🇸 English</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Business Name */}
          {onboardingStep === 3 && (
            <div className="text-center">
              {/* Back Button */}
              <div className="flex justify-start mb-6">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Icons */}
              <div className="flex justify-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-500" />
                </div>
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-pink-500" />
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-blue-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
                What is the name of your business?
              </h1>

              {/* Business Name Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter your business name"
                  value={businessInfo.name}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full text-left text-lg px-6 py-4 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm outline-none"
                  autoFocus
                />
              </div>

              {/* Next Button */}
              <div className="mb-6">
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`w-full px-8 py-4 rounded-xl transition-all duration-200 font-medium text-lg ${
                    canProceed()
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>

              {/* Suggestion */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>No name yet?</span>
                <button className="text-blue-500 hover:text-blue-600">
                  ✨ See some suggestions
                </button>
              </div>
            </div>
          )}

          {/* Generation Loading State */}
          {isGenerating && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Creating your website...
              </h3>
              <p className="text-gray-600">
                We&apos;re using AI to build a professional website for{" "}
                {businessInfo.name}
              </p>
            </div>
          )}
        </div>

        {/* Durable Logo */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="text-gray-600 font-medium">EonLogic</span>
          </div>
        </div>
      </div>
    </div>
  );
}
