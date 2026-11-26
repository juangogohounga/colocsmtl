import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Plus,
  Search,
  Bed,
  Bath,
  Wifi,
  PawPrint,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function BrowseListings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState(3000);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchTerm, neighborhoodFilter, maxPrice]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);

      const allListings = await api.entities.RoomListing.filter(
        { status: "available" },
        "-created_date"
      );
      setListings(allListings);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Neighborhood filter
    if (neighborhoodFilter !== "all") {
      filtered = filtered.filter(listing => listing.neighborhood === neighborhoodFilter);
    }

    // Price filter
    filtered = filtered.filter(listing => listing.rent_amount <= maxPrice);

    setFilteredListings(filtered);
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: <Wifi className="w-4 h-4" />,
      pets_allowed: <PawPrint className="w-4 h-4" />,
    };
    return icons[amenity] || <Sparkles className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brick-500 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-stone-900">Browse Rooms</h1>
                <p className="text-stone-600">{filteredListings.length} available listings</p>
              </div>
            </div>

            <Button
              onClick={() => navigate(createPageUrl("CreateListing"))}
              className="bg-brick-500 hover:bg-brick-600 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post a Room
            </Button>
          </div>

          {/* Filters */}
          <Card className="shadow-lg border-none">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={neighborhoodFilter} onValueChange={setNeighborhoodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Neighborhoods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Neighborhoods</SelectItem>
                    <SelectItem value="le_plateau">Le Plateau</SelectItem>
                    <SelectItem value="rosemont">Rosemont</SelectItem>
                    <SelectItem value="ndg">NDG</SelectItem>
                    <SelectItem value="mile_end">Mile End</SelectItem>
                    <SelectItem value="verdun">Verdun</SelectItem>
                    <SelectItem value="downtown">Downtown</SelectItem>
                    <SelectItem value="griffintown">Griffintown</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-stone-600">Max Price</span>
                    <span className="text-sm font-semibold text-brick-600">${maxPrice}</span>
                  </div>
                  <Input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <Card className="shadow-xl border-none">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">No listings found</h3>
              <p className="text-stone-600 mb-6">Try adjusting your filters or be the first to post a room!</p>
              <Button
                onClick={() => navigate(createPageUrl("CreateListing"))}
                className="bg-brick-500 hover:bg-brick-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post a Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-none bg-white group cursor-pointer">
                  <div 
                    onClick={() => navigate(createPageUrl("ListingDetails") + `?id=${listing.id}`)}
                    className="relative h-48 bg-brick-200"
                  >
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-brick-300" />
                      </div>
                    )}

                    {listing.is_featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-amber-600 text-white border-0 shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}

                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/95 backdrop-blur-sm text-stone-800 border-0 shadow-lg">
                        {listing.listing_type?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5" onClick={() => navigate(createPageUrl("ListingDetails") + `?id=${listing.id}`)}>
                    <h3 className="text-lg font-bold text-stone-900 mb-2 line-clamp-1">
                      {listing.title}
                    </h3>

                    <div className="flex items-center gap-2 text-stone-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm capitalize">
                        {listing.neighborhood?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-1">
                        <DollarSign className="w-5 h-5 text-brick-600" />
                        <span className="text-2xl font-bold text-brick-600">
                          {listing.rent_amount}
                        </span>
                        <span className="text-sm text-stone-500">/month</span>
                      </div>
                      
                      {listing.utilities_included && (
                        <Badge variant="outline" className="text-xs">
                          Utils incl.
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-stone-600 mb-4">
                      {listing.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{listing.bedrooms} bed</span>
                        </div>
                      )}
                      {listing.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{listing.bathrooms} bath</span>
                        </div>
                      )}
                    </div>

                    {listing.amenities && listing.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.slice(0, 3).map((amenity) => (
                          <Badge 
                            key={amenity} 
                            variant="outline" 
                            className="text-xs bg-brick-50 text-brick-700 border-brick-200"
                          >
                            {amenity.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {listing.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{listing.amenities.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}