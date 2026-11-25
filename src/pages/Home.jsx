import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Users, 
  Home as HomeIcon, 
  Heart, 
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ users: 0, listings: 0, matches: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuth = await api.auth.isAuthenticated();
      if (isAuth) {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        
        const profiles = await api.entities.UserProfile.filter({ user_email: currentUser.email }, "-created_date", 1);
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      }

      const counts = await api.publicStats();

      setStats({
        users: counts.users,
        listings: counts.listings,
        matches: counts.matches
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Matching",
      description: "Our smart algorithm finds roommates who truly match your lifestyle and personality"
    },
    {
      icon: Shield,
      title: "Safe & Verified",
      description: "ID verification and background checks ensure you connect with trustworthy people"
    },
    {
      icon: Heart,
      title: "Lifestyle Compatibility",
      description: "Match based on sleep schedule, cleanliness, social habits, and more"
    },
    {
      icon: HomeIcon,
      title: "Find Your Space",
      description: "Browse verified room listings across Montreal's best neighborhoods"
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      if (profile) {
        navigate(createPageUrl("BrowseRoommates"));
      } else {
        navigate(createPageUrl("ProfileSetup"));
      }
    } else {
      api.auth.redirectToLogin(createPageUrl("ProfileSetup"));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4" />
              Montreal's #1 Roommate Matching Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Roommate Match
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              AI-powered compatibility matching for shared housing in Montreal. 
              Connect with people who share your lifestyle, not just your address.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-8 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                {user && profile ? "Browse Matches" : "Get Started Free"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl("BrowseListings"))}
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-2xl"
              >
                Explore Listings
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Active Users", value: stats.users, icon: Users },
              { label: "Room Listings", value: stats.listings, icon: HomeIcon },
              { label: "Successful Matches", value: stats.matches, icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  <CardContent className="p-8 text-center">
                    <stat.icon className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                    <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.value}+
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose ColocsMTL?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              More than just a listing platform — we match you with compatible people
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-white h-full group hover:scale-105">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join hundreds of Montrealers finding compatible roommates every day
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-10 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            Start Matching Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}