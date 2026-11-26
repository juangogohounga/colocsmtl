import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User,
  Edit,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Moon,
  Sun,
  Sparkles,
  Home,
  MessageCircle,
  Heart,
  Eye,
  Settings,
  Shield,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";

export default function MyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ matches: 0, messages: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);

      const profiles = await api.entities.UserProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }

      // Load stats
      const allMatches = await api.entities.Match.list();
      const myMatches = allMatches.filter(
        m => (m.user1_email === currentUser.email || m.user2_email === currentUser.email) && m.match_status === "mutual"
      );

      const allMessages = await api.entities.Message.list();
      const myMessages = allMessages.filter(m => m.sender_email === currentUser.email);

      setStats({
        matches: myMatches.length,
        messages: myMessages.length,
        views: 0 // Can be implemented later
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getSleepIcon = () => {
    if (profile?.sleep_schedule === "early_bird") return <Sun className="w-4 h-4" />;
    if (profile?.sleep_schedule === "night_owl") return <Moon className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <Skeleton className="h-96 w-full" />
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <Skeleton className="h-96 w-full" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-sand-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-xl border-none">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-brick-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-brick-500" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-3">
                Complete Your Profile
              </h2>
              <p className="text-stone-600 mb-6">
                Create your profile to start matching with compatible roommates
              </p>
              <Button
                onClick={() => navigate(createPageUrl("ProfileSetup"))}
                className="bg-brick-500 hover:bg-brick-600 text-white"
              >
                Create Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brick-500 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-stone-900">My Profile</h1>
                <p className="text-stone-600">Manage your ColocsMTL profile</p>
              </div>
            </div>

            <Button
              onClick={() => navigate(createPageUrl("ProfileSetup"))}
              className="bg-brick-500 hover:bg-brick-600 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white shadow-lg rounded-xl p-1">
                <TabsTrigger 
                  value="preview" 
                  className="data-[state=active]: data-[state=active]:bg-brick-500 data-[state=active]: data-[state=active]:text-white rounded-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]: data-[state=active]:bg-brick-500 data-[state=active]: data-[state=active]:text-white rounded-lg"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
              </TabsList>

              {/* Preview Tab */}
              <TabsContent value="preview">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="overflow-hidden shadow-2xl border-none bg-white">
                    {/* Profile Image */}
                    <div className="relative h-80 bg-brick-200">
                      {profile.profile_image_url ? (
                        <img 
                          src={profile.profile_image_url} 
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Avatar className="w-40 h-40">
                            <AvatarFallback className="bg-brick-500 text-white text-5xl font-bold">
                              {profile.full_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      
                      {/* Status Badges */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/95 backdrop-blur-sm text-stone-800 border-0 shadow-lg">
                          <Home className="w-3 h-3 mr-1" />
                          Looking for {profile.looking_for === "both" ? "Room & Roommate" : profile.looking_for}
                        </Badge>
                      </div>

                      {profile.is_premium && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-amber-600 text-white border-0 shadow-lg">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}

                      {profile.is_verified && (
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-green-500 text-white border-0 shadow-lg">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      {/* Name & Basic Info */}
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-stone-900">{profile.full_name}</h3>
                        <p className="text-stone-600">{profile.age} • {profile.occupation?.replace(/_/g, " ")}</p>
                      </div>

                      {profile.bio && (
                        <p className="text-stone-700 leading-relaxed mb-4">{profile.bio}</p>
                      )}

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          {getSleepIcon()}
                          <span className="capitalize">{profile.sleep_schedule?.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{profile.work_from_home ? "Works from home" : "Works outside"}</span>
                        </div>
                      </div>

                      {/* Budget */}
                      {profile.budget_min && profile.budget_max && (
                        <div className="mb-4 p-3 bg-brick-50 rounded-xl">
                          <p className="text-sm text-stone-600 mb-1">Budget Range</p>
                          <p className="font-bold text-brick-600">
                            ${profile.budget_min} - ${profile.budget_max} CAD/month
                          </p>
                        </div>
                      )}

                      {/* Neighborhoods */}
                      {profile.preferred_neighborhoods && profile.preferred_neighborhoods.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-stone-500" />
                            <span className="text-sm font-medium text-stone-700">Preferred Areas</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profile.preferred_neighborhoods.map((hood) => (
                              <Badge key={hood} variant="outline" className="text-xs">
                                {hood.replace(/_/g, " ").toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vibe Tags */}
                      {profile.vibe_tags && profile.vibe_tags.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-stone-700 mb-2">Vibe</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.vibe_tags.map((vibe) => (
                              <Badge 
                                key={vibe} 
                                className="bg-brick-100 text-brick-700 border-0"
                              >
                                {vibe.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lifestyle Meters */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-stone-600 mb-1">
                            <span>Cleanliness</span>
                            <span>{profile.cleanliness_level}/5</span>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brick-400 rounded-full transition-all"
                              style={{ width: `${(profile.cleanliness_level / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-stone-600 mb-1">
                            <span>Noise Tolerance</span>
                            <span>{profile.noise_tolerance}/5</span>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brick-400 rounded-full transition-all"
                              style={{ width: `${(profile.noise_tolerance / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details">
                <Card className="shadow-xl border-none">
                  <CardContent className="p-6 space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-brick-500" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Full Name</span>
                          <span className="font-medium text-stone-900">{profile.full_name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Email</span>
                          <span className="font-medium text-stone-900">{user.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Age</span>
                          <span className="font-medium text-stone-900">{profile.age}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Gender</span>
                          <span className="font-medium text-stone-900 capitalize">{profile.gender?.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Phone</span>
                          <span className="font-medium text-stone-900">{profile.phone || "Not provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lifestyle Preferences */}
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brick-500" />
                        Lifestyle Preferences
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Sleep Schedule</span>
                          <span className="font-medium text-stone-900 capitalize">{profile.sleep_schedule?.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Social Level</span>
                          <span className="font-medium text-stone-900 capitalize">{profile.social_level}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Guests Frequency</span>
                          <span className="font-medium text-stone-900 capitalize">{profile.guests_frequency?.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Smoking</span>
                          <Badge variant={profile.smoking ? "destructive" : "outline"}>
                            {profile.smoking ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Pets</span>
                          <Badge variant={profile.pets ? "default" : "outline"}>
                            {profile.pets ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b border-stone-100">
                          <span className="text-stone-600">Work From Home</span>
                          <Badge variant={profile.work_from_home ? "default" : "outline"}>
                            {profile.work_from_home ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Housing Preferences */}
                    {profile.move_in_date && (
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-brick-500" />
                          Housing Preferences
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-stone-100">
                            <span className="text-stone-600">Move-in Date</span>
                            <span className="font-medium text-stone-900">{new Date(profile.move_in_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Stats & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <Card className="shadow-xl border-none">
              <CardContent className="p-6">
                <h3 className="font-bold text-stone-900 mb-4">Profile Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-sand-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-brick-600" />
                      <span className="text-sm text-stone-700">Matches</span>
                    </div>
                    <span className="text-xl font-bold text-brick-600">{stats.matches}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-brick-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-brick-600" />
                      <span className="text-sm text-stone-700">Messages Sent</span>
                    </div>
                    <span className="text-xl font-bold text-brick-600">{stats.messages}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-stone-700">Profile Views</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{stats.views}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-xl border-none">
              <CardContent className="p-6">
                <h3 className="font-bold text-stone-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate(createPageUrl("BrowseRoommates"))}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Roommates
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl("Matches"))}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    View Matches
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl("Chat"))}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl("BrowseListings"))}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Browse Rooms
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium CTA */}
            {!profile.is_premium && (
              <Card className="shadow-xl border-none bg-stone-900 text-sand-50">
                <CardContent className="p-6">
                  <Crown className="w-10 h-10 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
                  <p className="text-sm text-white/90 mb-4">
                    Get verified, top listing visibility, and unlimited matches
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-sand-50 text-stone-900 hover:bg-sand-100"
                  >
                    Upgrade Now - $14.99/mo
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}