import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Briefcase, 
  Heart, 
  X, 
  MessageCircle,
  Moon,
  Sun,
  Sparkles,
  Home
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileCard({ profile, onLike, onPass, showActions = true, onMessage }) {
  const getCompatibilityColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-600";
    return "text-stone-500";
  };

  const getSleepIcon = () => {
    if (profile.sleep_schedule === "early_bird") return <Sun className="w-4 h-4" />;
    if (profile.sleep_schedule === "night_owl") return <Moon className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden shadow-2xl border-none bg-white hover:shadow-3xl transition-all duration-300">
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
          
          {/* Compatibility Score Badge */}
          {profile.compatibility_score && (
            <div className="absolute top-4 right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-5 h-5 ${getCompatibilityColor(profile.compatibility_score)}`} />
                  <span className={`text-lg font-bold ${getCompatibilityColor(profile.compatibility_score)}`}>
                    {profile.compatibility_score}%
                  </span>
                </div>
                <p className="text-xs text-stone-600 text-center">Match</p>
              </div>
            </div>
          )}

          {/* Looking For Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/95 backdrop-blur-sm text-stone-800 border-0 shadow-lg">
              <Home className="w-3 h-3 mr-1" />
              Looking for {profile.looking_for === "both" ? "Room & Roommate" : profile.looking_for}
            </Badge>
          </div>

          {profile.is_premium && (
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-amber-600 text-white border-0 shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Name & Basic Info */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold text-stone-900">{profile.full_name}</h3>
                <p className="text-stone-600">{profile.age} • {profile.occupation?.replace(/_/g, " ")}</p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-stone-700 leading-relaxed mb-4">{profile.bio}</p>
            )}
          </div>

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
                {profile.preferred_neighborhoods.slice(0, 3).map((hood) => (
                  <Badge key={hood} variant="outline" className="text-xs">
                    {hood.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                ))}
                {profile.preferred_neighborhoods.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.preferred_neighborhoods.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Vibe Tags */}
          {profile.vibe_tags && profile.vibe_tags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-stone-700 mb-2">Vibe</p>
              <div className="flex flex-wrap gap-2">
                {profile.vibe_tags.slice(0, 5).map((vibe) => (
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
          <div className="space-y-3 mb-6">
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

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-3">
              {onPass && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onPass(profile)}
                  className="flex-1 border-2 border-stone-300 hover:border-red-400 hover:bg-red-50 transition-all"
                >
                  <X className="w-5 h-5 text-stone-600" />
                </Button>
              )}
              
              {onMessage && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onMessage(profile)}
                  className="flex-1 border-2 border-brick-300 hover:border-brick-500 hover:bg-brick-50 transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-brick-600" />
                </Button>
              )}
              
              {onLike && (
                <Button
                  size="lg"
                  onClick={() => onLike(profile)}
                  className="flex-1 bg-brick-500 hover:bg-brick-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Like
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}