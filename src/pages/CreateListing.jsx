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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Home, Upload, X, Plus, Minus } from "lucide-react";

export default function CreateListing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    listing_type: "",
    rent_amount: "",
    utilities_included: false,
    deposit_required: "",
    neighborhood: "",
    address: "",
    available_from: "",
    lease_duration: "",
    bedrooms: "",
    bathrooms: "",
    square_feet: "",
    furnished: false,
    amenities: [],
    images: [],
    rules: [],
    current_roommates: []
  });

  const [newRule, setNewRule] = useState("");
  const [newRoommate, setNewRoommate] = useState({ name: "", age: "", occupation: "" });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
      api.auth.redirectToLogin(createPageUrl("CreateListing"));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        api.uploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(r => r.file_url);
      setFormData({ ...formData, images: [...formData.images, ...imageUrls] });
    } catch (error) {
      console.error("Error uploading images:", error);
    }
    setUploading(false);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const toggleAmenity = (amenity) => {
    const current = formData.amenities || [];
    if (current.includes(amenity)) {
      setFormData({ ...formData, amenities: current.filter(a => a !== amenity) });
    } else {
      setFormData({ ...formData, amenities: [...current, amenity] });
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({ ...formData, rules: [...formData.rules, newRule.trim()] });
      setNewRule("");
    }
  };

  const removeRule = (index) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData({ ...formData, rules: newRules });
  };

  const addRoommate = () => {
    if (newRoommate.name && newRoommate.age && newRoommate.occupation) {
      setFormData({ 
        ...formData, 
        current_roommates: [...formData.current_roommates, { 
          ...newRoommate, 
          age: parseInt(newRoommate.age) 
        }] 
      });
      setNewRoommate({ name: "", age: "", occupation: "" });
    }
  };

  const removeRoommate = (index) => {
    const newRoommates = formData.current_roommates.filter((_, i) => i !== index);
    setFormData({ ...formData, current_roommates: newRoommates });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const listingData = {
        ...formData,
        owner_email: user.email,
        rent_amount: parseFloat(formData.rent_amount),
        deposit_required: formData.deposit_required ? parseFloat(formData.deposit_required) : 0,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
        status: "available"
      };

      await api.entities.RoomListing.create(listingData);
      navigate(createPageUrl("BrowseListings"));
    } catch (error) {
      console.error("Error creating listing:", error);
    }
    setSaving(false);
  };

  const amenityOptions = [
    "wifi", "laundry", "parking", "gym", "balcony", 
    "air_conditioning", "dishwasher", "pets_allowed", "smoking_allowed", "storage"
  ];

  const neighborhoodOptions = [
    { value: "le_plateau", label: "Le Plateau-Mont-Royal" },
    { value: "rosemont", label: "Rosemont" },
    { value: "ndg", label: "NDG" },
    { value: "mile_end", label: "Mile End" },
    { value: "verdun", label: "Verdun" },
    { value: "hochelaga", label: "Hochelaga" },
    { value: "villeray", label: "Villeray" },
    { value: "downtown", label: "Downtown" },
    { value: "outremont", label: "Outremont" },
    { value: "griffintown", label: "Griffintown" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : navigate(createPageUrl("BrowseListings"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post a Room Listing</h1>
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
              <div className="space-y-2">
                <Label>Listing Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., Bright Studio in Le Plateau"
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your space, neighborhood, and what makes it special..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Listing Type *</Label>
                  <Select value={formData.listing_type} onValueChange={(value) => setFormData({ ...formData, listing_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private_room">Private Room</SelectItem>
                      <SelectItem value="shared_room">Shared Room</SelectItem>
                      <SelectItem value="entire_apartment">Entire Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Neighborhood *</Label>
                  <Select value={formData.neighborhood} onValueChange={(value) => setFormData({ ...formData, neighborhood: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select neighborhood" />
                    </SelectTrigger>
                    <SelectContent>
                      {neighborhoodOptions.map(n => (
                        <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Rent (CAD) *</Label>
                  <Input
                    type="number"
                    value={formData.rent_amount}
                    onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                    placeholder="1200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Security Deposit (CAD)</Label>
                  <Input
                    type="number"
                    value={formData.deposit_required}
                    onChange={(e) => setFormData({ ...formData, deposit_required: e.target.value })}
                    placeholder="1200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Available From *</Label>
                  <Input
                    type="date"
                    value={formData.available_from}
                    onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lease Duration *</Label>
                  <Select value={formData.lease_duration} onValueChange={(value) => setFormData({ ...formData, lease_duration: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_month">1 Month</SelectItem>
                      <SelectItem value="3_months">3 Months</SelectItem>
                      <SelectItem value="6_months">6 Months</SelectItem>
                      <SelectItem value="12_months">12 Months</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address (optional for privacy)"
                />
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                size="lg"
                disabled={!formData.title || !formData.description || !formData.listing_type || !formData.rent_amount || !formData.neighborhood || !formData.available_from || !formData.lease_duration}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details & Amenities */}
        {step === 2 && (
          <Card className="shadow-xl border-none">
            <CardHeader>
              <CardTitle className="text-2xl">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Square Feet</Label>
                  <Input
                    type="number"
                    value={formData.square_feet}
                    onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                    placeholder="600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Utilities Included</Label>
                    <p className="text-xs text-gray-500">Heat, water, electricity</p>
                  </div>
                  <Switch
                    checked={formData.utilities_included}
                    onCheckedChange={(checked) => setFormData({ ...formData, utilities_included: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Furnished</Label>
                    <p className="text-xs text-gray-500">Includes furniture</p>
                  </div>
                  <Switch
                    checked={formData.furnished}
                    onCheckedChange={(checked) => setFormData({ ...formData, furnished: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map(amenity => (
                    <Badge
                      key={amenity}
                      variant={formData.amenities?.includes(amenity) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        formData.amenities?.includes(amenity) 
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" 
                          : "hover:bg-indigo-50"
                      }`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Current Roommates */}
              <div className="space-y-3">
                <Label>Current Roommates (Optional)</Label>
                <div className="space-y-2">
                  {formData.current_roommates.map((roommate, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{roommate.name}</p>
                        <p className="text-sm text-gray-600">{roommate.age} years • {roommate.occupation}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRoommate(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-12 gap-3">
                  <Input
                    placeholder="Name"
                    value={newRoommate.name}
                    onChange={(e) => setNewRoommate({ ...newRoommate, name: e.target.value })}
                    className="col-span-4"
                  />
                  <Input
                    type="number"
                    placeholder="Age"
                    value={newRoommate.age}
                    onChange={(e) => setNewRoommate({ ...newRoommate, age: e.target.value })}
                    className="col-span-3"
                  />
                  <Input
                    placeholder="Occupation"
                    value={newRoommate.occupation}
                    onChange={(e) => setNewRoommate({ ...newRoommate, occupation: e.target.value })}
                    className="col-span-4"
                  />
                  <Button
                    variant="outline"
                    onClick={addRoommate}
                    className="col-span-1"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
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

        {/* Step 3: Photos & Rules */}
        {step === 3 && (
          <Card className="shadow-xl border-none">
            <CardHeader>
              <CardTitle className="text-2xl">Photos & House Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <Label>Photos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="h-32 border-4 border-dashed border-indigo-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all bg-indigo-50">
                    <Upload className="w-8 h-8 text-indigo-400 mb-1" />
                    <span className="text-xs text-indigo-600">Upload Photos</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                {uploading && <p className="text-sm text-gray-500">Uploading images...</p>}
              </div>

              {/* House Rules */}
              <div className="space-y-3">
                <Label>House Rules (Optional)</Label>
                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-gray-700">{rule}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Input
                    placeholder="E.g., No smoking indoors"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                  />
                  <Button
                    variant="outline"
                    onClick={addRule}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
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
                  {saving ? "Creating Listing..." : "Publish Listing"}
                  <Home className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}