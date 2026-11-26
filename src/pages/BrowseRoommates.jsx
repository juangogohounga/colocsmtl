import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Sparkles, Filter, ArrowRight } from "lucide-react";
import ProfileCard from "../components/roommates/ProfileCard";
import { motion, AnimatePresence } from "framer-motion";

export default function BrowseRoommates() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);

      const myProfiles = await api.entities.UserProfile.filter({ user_email: currentUser.email });
      if (myProfiles.length === 0) {
        navigate(createPageUrl("ProfileSetup"));
        return;
      }
      setMyProfile(myProfiles[0]);

      // Get all profiles except mine
      const allProfiles = await api.entities.UserProfile.list("-created_date");
      const otherProfiles = allProfiles.filter(p => p.user_email !== currentUser.email);

      // Check existing matches
      const matches = await api.entities.Match.filter({
        user1_email: currentUser.email
      });

      const matchedEmails = matches.map(m => m.user2_email);
      const availableProfiles = otherProfiles.filter(p => !matchedEmails.includes(p.user_email));

      // Score compatibility with Claude, a few profiles at a time.
      // Scores are cached on the server, so repeat visits are fast and free.
      setCalculating(true);
      const profilesWithScore = [];
      const BATCH_SIZE = 4;
      for (let i = 0; i < availableProfiles.length; i += BATCH_SIZE) {
        const batch = availableProfiles.slice(i, i + BATCH_SIZE);
        const scored = await Promise.all(
          batch.map(async (profile) => {
            const { score, breakdown } = await calculateCompatibility(profile);
            return { ...profile, compatibility_score: score, compatibility_breakdown: breakdown };
          })
        );
        profilesWithScore.push(...scored);
      }
      setCalculating(false);

      // Sort by compatibility
      profilesWithScore.sort((a, b) => b.compatibility_score - a.compatibility_score);

      setProfiles(profilesWithScore);
    } catch (error) {
      console.error("Error loading data:", error);
      setCalculating(false);
    }
    setLoading(false);
  };

  const calculateCompatibility = async (otherProfile) => {
    try {
      const result = await api.compatibility(otherProfile.user_email);
      return {
        score: Math.round(result?.compatibility_score ?? 50),
        breakdown: result?.breakdown ?? null,
      };
    } catch (error) {
      console.error("Error calculating compatibility:", error);
      return { score: 50, breakdown: null }; // Neutral default if scoring is unavailable
    }
  };

  const handleLike = async (profile) => {
    try {
      const compatibility = profile.compatibility_score || 50;

      // Record our like
      await api.entities.Match.create({
        user1_email: user.email,
        user2_email: profile.user_email,
        compatibility_score: compatibility,
        match_status: "liked_by_user1",
        compatibility_breakdown: profile.compatibility_breakdown || {
          lifestyle: 0,
          schedule: 0,
          cleanliness: 0,
          social: 0,
          interests: 0
        }
      });

      // Check if they also liked us (mutual match)
      const reverseMatches = await api.entities.Match.filter({
        user1_email: profile.user_email,
        user2_email: user.email
      });

      if (reverseMatches.length > 0) {
        // It's a mutual match! Their like becomes the shared match used for chat.
        await api.entities.Match.update(reverseMatches[0].id, {
          match_status: "mutual"
        });
      }

      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error("Error liking profile:", error);
    }
  };

  const handlePass = () => {
    setCurrentIndex(currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <Card className="shadow-2xl">
            <Skeleton className="h-80 w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brick-500 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-stone-900">Find Roommates</h1>
                <p className="text-stone-600">
                  {profiles.length - currentIndex} {profiles.length - currentIndex === 1 ? "profile" : "profiles"} to explore
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Matches"))}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {calculating && (
            <div className="bg-brick-100 border border-brick-300 rounded-xl p-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brick-600 animate-pulse" />
              <p className="text-sm text-brick-800">AI is calculating compatibility...</p>
            </div>
          )}
        </div>

        {/* Profile Cards */}
        <AnimatePresence mode="wait">
          {currentProfile ? (
            <ProfileCard
              key={currentProfile.id}
              profile={currentProfile}
              onLike={handleLike}
              onPass={handlePass}
              showActions={true}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="shadow-2xl border-none">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-brick-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-brick-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-3">
                    You've Seen Everyone!
                  </h2>
                  <p className="text-stone-600 mb-6">
                    Check your matches or browse room listings
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => navigate(createPageUrl("Matches"))}
                      className="bg-brick-500 hover:bg-brick-600 text-white"
                    >
                      View Matches
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(createPageUrl("BrowseListings"))}
                    >
                      Browse Rooms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        {profiles.length > 0 && currentIndex < profiles.length && (
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-stone-600 mb-2">
              <span>{currentIndex + 1} of {profiles.length}</span>
            </div>
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brick-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}