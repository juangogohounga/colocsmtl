import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Sparkles, Upload, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    phone: "",
    bio: "",
    profile_image_url: "",
    occupation: "",
    budget_min: 500,
    budget_max: 1500,
    preferred_neighborhoods: [],
    move_in_date: "",
    sleep_schedule: "",
    cleanliness_level: 3,
    noise_tolerance: 3,
    social_level: "",
    guests_frequency: "",
    smoking: false,
    pets: false,
    pet_types: [],
    diet_preferences: [],
    languages: [],
    interests: [],
    vibe_tags: [],
    work_from_home: false,
    looking_for: "both"
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      const profiles = await api.entities.UserProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setExistingProfile(profiles[0]);
        setFormData({ ...formData, ...profiles[0], full_name: currentUser.full_name });
      } else {
        setFormData({ ...formData, full_name: currentUser.full_name });
      }
    } catch (error) {
      console.error("Error loading user:", error);
      api.auth.redirectToLogin(createPageUrl("ProfileSetup"));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await api.uploadFile({ file });
      setFormData({ ...formData, profile_image_url: file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setUploading(false);
  };

  const toggleArrayItem = (field, value) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(item => item !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const profileData = {
        ...formData,
        user_email: user.email,
        age: parseInt(formData.age),
        budget_min: parseInt(formData.budget_min),
        budget_max: parseInt(formData.budget_max)
      };

      if (existingProfile) {
        await api.entities.UserProfile.update(existingProfile.id, profileData);
      } else {
        await api.entities.UserProfile.create(profileData);
      }

      navigate(createPageUrl("BrowseRoommates"));
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  const vibeOptions = ["student", "gamer", "foodie", "fitness_enthusiast", "artist", "musician", "tech_savvy", "eco_conscious", "party_friendly", "homebody", "adventurer", "bookworm"];
  const neighborhoodOptions = ["le_plateau", "rosemont", "ndg", "mile_end", "verdun", "hochelaga", "villeray", "downtown", "outremont", "griffintown"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : navigate(createPageUrl("Home"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {existingProfile ? "Edit Your Profile" : "Create Your Profile"}
              </h1>
              <p className="text-gray-600">Step {step} of 3</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="shadow-xl border-none">
            <CardHeader>
              <CardTitle className="text-2xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {formData.profile_image_url ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200">
                      <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFormData({ ...formData, profile_image_url: "" })}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 rounded-full border-4 border-dashed border-indigo-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all bg-indigo-50">
                      <Upload className="w-8 h-8 text-indigo-400 mb-1" />
                      <span className="text-xs text-indigo-600">Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
                {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Your age"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non_binary">Non-Binary</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Select value={formData.occupation} onValueChange={(value) => setFormData({ ...formData, occupation: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Looking For</Label>
                  <Select value={formData.looking_for} onValueChange={(value) => setFormData({ ...formData, looking_for: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="What are you looking for?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room">A Room</SelectItem>
                      <SelectItem value="roommate">A Roommate</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Lifestyle & Preferences */}
        {step === 2 && (
          <Card className="shadow-xl border-none">
            <CardHeader>
              <CardTitle className="text-2xl">Lifestyle & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Sleep Schedule</Label>
                  <Select value={formData.sleep_schedule} onValueChange={(value) => setFormData({ ...formData, sleep_schedule: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="When do you sleep?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early_bird">Early Bird (before 11 PM)</SelectItem>
                      <SelectItem value="night_owl">Night Owl (after midnight)</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Social Level</Label>
                  <Select value={formData.social_level} onValueChange={(value) => setFormData({ ...formData, social_level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="How social are you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="introvert">Introvert</SelectItem>
                      <SelectItem value="ambivert">Ambivert</SelectItem>
                      <SelectItem value="extrovert">Extrovert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Guests Frequency</Label>
                  <Select value={formData.guests_frequency} onValueChange={(value) => setFormData({ ...formData, guests_frequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="How often do you have guests?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                      <SelectItem value="often">Often</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Move-in Date</Label>
                  <Input
                    type="date"
                    value={formData.move_in_date}
                    onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Cleanliness Level: {formData.cleanliness_level}/5</Label>
                  <Slider
                    value={[formData.cleanliness_level]}
                    onValueChange={(value) => setFormData({ ...formData, cleanliness_level: value[0] })}
                    max={5}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">1 = Very Messy, 5 = Very Clean</p>
                </div>

                <div>
                  <Label>Noise Tolerance: {formData.noise_tolerance}/5</Label>
                  <Slider
                    value={[formData.noise_tolerance]}
                    onValueChange={(value) => setFormData({ ...formData, noise_tolerance: value[0] })}
                    max={5}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">1 = Need Silence, 5 = Love Noise</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Smoking</Label>
                    <p className="text-xs text-gray-500">Do you smoke?</p>
                  </div>
                  <Switch
                    checked={formData.smoking}
                    onCheckedChange={(checked) => setFormData({ ...formData, smoking: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Pets</Label>
                    <p className="text-xs text-gray-500">Do you have pets?</p>
                  </div>
                  <Switch
                    checked={formData.pets}
                    onCheckedChange={(checked) => setFormData({ ...formData, pets: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Work From Home</Label>
                    <p className="text-xs text-gray-500">Do you WFH?</p>
                  </div>
                  <Switch
                    checked={formData.work_from_home}
                    onCheckedChange={(checked) => setFormData({ ...formData, work_from_home: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Vibe (Select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {vibeOptions.map(vibe => (
                    <Badge
                      key={vibe}
                      variant={formData.vibe_tags?.includes(vibe) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        formData.vibe_tags?.includes(vibe) 
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" 
                          : "hover:bg-indigo-50"
                      }`}
                      onClick={() => toggleArrayItem("vibe_tags", vibe)}
                    >
                      {vibe.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(1)} 
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Budget & Location */}
        {step === 3 && (
          <Card className="shadow-xl border-none">
            <CardHeader>
              <CardTitle className="text-2xl">Budget & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Budget Range (CAD/month)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                      placeholder="Min budget"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                      placeholder="Max budget"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  ${formData.budget_min} - ${formData.budget_max} per month
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preferred Neighborhoods</Label>
                <div className="flex flex-wrap gap-2">
                  {neighborhoodOptions.map(hood => (
                    <Badge
                      key={hood}
                      variant={formData.preferred_neighborhoods?.includes(hood) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        formData.preferred_neighborhoods?.includes(hood) 
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" 
                          : "hover:bg-indigo-50"
                      }`}
                      onClick={() => toggleArrayItem("preferred_neighborhoods", hood)}
                    >
                      {hood.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(2)} 
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  size="lg"
                >
                  {saving ? "Saving..." : existingProfile ? "Update Profile" : "Complete Profile"}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}