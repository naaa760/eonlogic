"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lightbulb,
  Briefcase,
  Users,
  MapPin,
  Globe,
  Flag,
  ChevronLeft,
  Languages,
} from "lucide-react";

// Popular cities worldwide for autocomplete
const worldCities = [
  "New York, NY, USA",
  "Los Angeles, CA, USA",
  "Chicago, IL, USA",
  "Houston, TX, USA",
  "Phoenix, AZ, USA",
  "Philadelphia, PA, USA",
  "San Antonio, TX, USA",
  "San Diego, CA, USA",
  "Dallas, TX, USA",
  "San Jose, CA, USA",
  "Austin, TX, USA",
  "Jacksonville, FL, USA",
  "Fort Worth, TX, USA",
  "Columbus, OH, USA",
  "Charlotte, NC, USA",
  "San Francisco, CA, USA",
  "Indianapolis, IN, USA",
  "Seattle, WA, USA",
  "Denver, CO, USA",
  "Boston, MA, USA",
  "London, UK",
  "Manchester, UK",
  "Birmingham, UK",
  "Leeds, UK",
  "Glasgow, UK",
  "Liverpool, UK",
  "Newcastle, UK",
  "Sheffield, UK",
  "Bristol, UK",
  "Edinburgh, UK",
  "Toronto, ON, Canada",
  "Montreal, QC, Canada",
  "Vancouver, BC, Canada",
  "Calgary, AB, Canada",
  "Edmonton, AB, Canada",
  "Ottawa, ON, Canada",
  "Winnipeg, MB, Canada",
  "Quebec City, QC, Canada",
  "Hamilton, ON, Canada",
  "Kitchener, ON, Canada",
  "Sydney, NSW, Australia",
  "Melbourne, VIC, Australia",
  "Brisbane, QLD, Australia",
  "Perth, WA, Australia",
  "Adelaide, SA, Australia",
  "Gold Coast, QLD, Australia",
  "Newcastle, NSW, Australia",
  "Canberra, ACT, Australia",
  "Sunshine Coast, QLD, Australia",
  "Wollongong, NSW, Australia",
  "Berlin, Germany",
  "Hamburg, Germany",
  "Munich, Germany",
  "Cologne, Germany",
  "Frankfurt, Germany",
  "Stuttgart, Germany",
  "Düsseldorf, Germany",
  "Dortmund, Germany",
  "Essen, Germany",
  "Leipzig, Germany",
  "Paris, France",
  "Marseille, France",
  "Lyon, France",
  "Toulouse, France",
  "Nice, France",
  "Nantes, France",
  "Strasbourg, France",
  "Montpellier, France",
  "Bordeaux, France",
  "Lille, France",
  "Madrid, Spain",
  "Barcelona, Spain",
  "Valencia, Spain",
  "Seville, Spain",
  "Zaragoza, Spain",
  "Málaga, Spain",
  "Murcia, Spain",
  "Palma, Spain",
  "Las Palmas, Spain",
  "Bilbao, Spain",
  "Rome, Italy",
  "Milan, Italy",
  "Naples, Italy",
  "Turin, Italy",
  "Palermo, Italy",
  "Genoa, Italy",
  "Bologna, Italy",
  "Florence, Italy",
  "Bari, Italy",
  "Catania, Italy",
  "Amsterdam, Netherlands",
  "Rotterdam, Netherlands",
  "The Hague, Netherlands",
  "Utrecht, Netherlands",
  "Eindhoven, Netherlands",
  "Tilburg, Netherlands",
  "Groningen, Netherlands",
  "Almere, Netherlands",
  "Breda, Netherlands",
  "Nijmegen, Netherlands",
  "Tokyo, Japan",
  "Yokohama, Japan",
  "Osaka, Japan",
  "Nagoya, Japan",
  "Sapporo, Japan",
  "Fukuoka, Japan",
  "Kobe, Japan",
  "Kyoto, Japan",
  "Kawasaki, Japan",
  "Saitama, Japan",
  "Beijing, China",
  "Shanghai, China",
  "Guangzhou, China",
  "Shenzhen, China",
  "Tianjin, China",
  "Wuhan, China",
  "Dongguan, China",
  "Chengdu, China",
  "Nanjing, China",
  "Xi'an, China",
  "Mumbai, Maharashtra, India",
  "Delhi, India",
  "Bangalore, Karnataka, India",
  "Hyderabad, Telangana, India",
  "Ahmedabad, Gujarat, India",
  "Chennai, Tamil Nadu, India",
  "Kolkata, West Bengal, India",
  "Pune, Maharashtra, India",
  "Jaipur, Rajasthan, India",
  "Surat, Gujarat, India",
  "São Paulo, Brazil",
  "Rio de Janeiro, Brazil",
  "Brasília, Brazil",
  "Salvador, Brazil",
  "Fortaleza, Brazil",
  "Belo Horizonte, Brazil",
  "Manaus, Brazil",
  "Curitiba, Brazil",
  "Recife, Brazil",
  "Porto Alegre, Brazil",
  "Mexico City, Mexico",
  "Guadalajara, Mexico",
  "Monterrey, Mexico",
  "Puebla, Mexico",
  "Tijuana, Mexico",
  "León, Mexico",
  "Juárez, Mexico",
  "Zapopan, Mexico",
  "Nezahualcóyotl, Mexico",
  "Chihuahua, Mexico",
  "Dubai, UAE",
  "Abu Dhabi, UAE",
  "Sharjah, UAE",
  "Al Ain, UAE",
  "Ajman, UAE",
  "Ras Al Khaimah, UAE",
  "Fujairah, UAE",
  "Umm Al Quwain, UAE",
  "Singapore",
  "Hong Kong",
  "Seoul, South Korea",
  "Busan, South Korea",
  "Incheon, South Korea",
  "Daegu, South Korea",
  "Daejeon, South Korea",
  "Gwangju, South Korea",
  "Suwon, South Korea",
  "Ulsan, South Korea",
  "Changwon, South Korea",
  "Goyang, South Korea",
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [language] = useState("English");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNext = () => {
    if (step === 1 && businessType.trim()) {
      setStep(2);
    } else if (step === 2 && location.trim()) {
      // Save onboarding data to localStorage
      localStorage.setItem(
        "onboardingData",
        JSON.stringify({
          businessType: businessType.trim(),
          location: location.trim(),
          language,
        })
      );
      // Redirect to dashboard
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);

    if (value.length >= 2) {
      const filtered = worldCities
        .filter((city) => city.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Show top 5 matches

      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicators */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-2">
            {[1, 2].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  stepNum <= step ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {step === 1 && (
            <div className="text-center">
              {/* Icons */}
              <div className="flex justify-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-red-500" />
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-orange-500" />
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                What type of business are you building?
              </h1>

              {/* Input */}
              <div className="mb-8">
                <Input
                  type="text"
                  placeholder="Eg. personal training and nutrition planning"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full text-center text-lg px-6 py-4 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNext}
                disabled={!businessType.trim()}
                className="px-8 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all duration-200 font-medium"
              >
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              {/* Back Button */}
              <div className="flex justify-start mb-6">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </Button>
              </div>

              {/* Icons */}
              <div className="flex justify-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-500" />
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Flag className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
                Where is your business located?
              </h1>

              {/* Location Input with Autocomplete */}
              <div className="mb-6 relative">
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() =>
                    location.length >= 2 && setShowSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  className="w-full text-left text-lg px-6 py-4 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm"
                />

                {/* Location Suggestions Dropdown */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectLocation(suggestion)}
                        className="w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors text-gray-700 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Button */}
              <div className="mb-6">
                <Button
                  onClick={handleNext}
                  disabled={!location.trim()}
                  className="w-full px-8 py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all duration-200 font-medium text-lg"
                >
                  Next
                </Button>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Languages className="w-4 h-4" />
                <span>Website Language</span>
                <div className="flex items-center space-x-1">
                  <Flag className="w-4 h-4" />
                  <span className="font-medium text-gray-700">{language}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Durable Logo */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="text-gray-600 font-medium">Durable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
