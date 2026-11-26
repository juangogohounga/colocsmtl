import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileCard from "../components/roommates/ProfileCard";
import { motion } from "framer-motion";

export default function Matches() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mutual");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);

      // Get all matches involving this user
      const myMatches = await api.entities.Match.list("-created_date");
      const relevantMatches = myMatches.filter(
        m => m.user1_email === currentUser.email || m.user2_email === currentUser.email
      );

      setMatches(relevantMatches);

      // Load all related profiles
      const profileEmails = new Set();
      relevantMatches.forEach(match => {
        profileEmails.add(match.user1_email);
        profileEmails.add(match.user2_email);
      });

      const allProfiles = await api.entities.UserProfile.list();
      const profileMap = {};
      allProfiles.forEach(profile => {
        if (profileEmails.has(profile.user_email)) {
          profileMap[profile.user_email] = profile;
        }
      });

      setProfiles(profileMap);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getMutualMatches = () => {
    return matches.filter(m => m.match_status === "mutual");
  };

  const getMyLikes = () => {
    return matches.filter(
      m => m.user1_email === user?.email && m.match_status === "liked_by_user1"
    );
  };

  const getLikesReceived = () => {
    return matches.filter(
      m => m.user2_email === user?.email && m.match_status === "liked_by_user1"
    );
  };

  const getOtherUserEmail = (match) => {
    return match.user1_email === user?.email ? match.user2_email : match.user1_email;
  };

  const handleMessage = (profile) => {
    navigate(createPageUrl("Chat") + `?email=${profile.user_email}`);
  };

  const renderMatches = (matchList, emptyMessage) => {
    if (matchList.length === 0) {
      return (
        <Card className="shadow-xl border-none">
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-900 mb-2">{emptyMessage}</h3>
            <p className="text-stone-600 mb-6">Keep swiping to find your perfect match!</p>
            <Button
              onClick={() => navigate(createPageUrl("BrowseRoommates"))}
              className="bg-brick-500 hover:bg-brick-600 text-white"
            >
              Browse Roommates
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matchList.map((match, index) => {
          const otherEmail = getOtherUserEmail(match);
          const profile = profiles[otherEmail];
          if (!profile) return null;

          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProfileCard
                profile={{ ...profile, compatibility_score: match.compatibility_score }}
                showActions={match.match_status === "mutual"}
                onMessage={match.match_status === "mutual" ? handleMessage : null}
              />
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <Skeleton className="h-80 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const mutualMatches = getMutualMatches();
  const myLikes = getMyLikes();
  const likesReceived = getLikesReceived();

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-brick-500 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-900">My Matches</h1>
              <p className="text-stone-600">
                {mutualMatches.length} mutual {mutualMatches.length === 1 ? "match" : "matches"}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-stone-900 mb-1">{mutualMatches.length}</div>
                <div className="text-sm text-stone-600">Mutual Matches</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-brick-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-brick-600" />
                </div>
                <div className="text-3xl font-bold text-stone-900 mb-1">{myLikes.length}</div>
                <div className="text-sm text-stone-600">People You Liked</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-sand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-brick-600" />
                </div>
                <div className="text-3xl font-bold text-stone-900 mb-1">{likesReceived.length}</div>
                <div className="text-sm text-stone-600">People Who Liked You</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="mutual" 
              className="data-[state=active]: data-[state=active]:bg-brick-500 data-[state=active]: data-[state=active]:text-white rounded-lg"
            >
              <Heart className="w-4 h-4 mr-2" />
              Mutual ({mutualMatches.length})
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="data-[state=active]: data-[state=active]:bg-brick-500 data-[state=active]: data-[state=active]:text-white rounded-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              My Likes ({myLikes.length})
            </TabsTrigger>
            <TabsTrigger 
              value="received" 
              className="data-[state=active]: data-[state=active]:bg-brick-500 data-[state=active]: data-[state=active]:text-white rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Received ({likesReceived.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mutual">
            {renderMatches(mutualMatches, "No mutual matches yet")}
          </TabsContent>

          <TabsContent value="likes">
            {renderMatches(myLikes, "You haven't liked anyone yet")}
          </TabsContent>

          <TabsContent value="received">
            {renderMatches(likesReceived, "No one has liked you yet")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}