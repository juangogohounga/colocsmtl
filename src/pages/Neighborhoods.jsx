import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Coffee,
  Music,
  GraduationCap,
  Building2,
  Trees,
  ShoppingBag,
  UtensilsCrossed,
  Train,
  Search,
  ArrowRight,
  Home
} from "lucide-react";
import { motion } from "framer-motion";

export default function Neighborhoods() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allListings = await api.entities.RoomListing.list();
      setListings(allListings);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const neighborhoods = [
    {
      id: "le_plateau",
      name: "Le Plateau-Mont-Royal",
      shortName: "Le Plateau",
      description: "Trendy artistic hub with colorful streets, vintage shops, and a vibrant cultural scene. Perfect for young professionals and artists.",
      avgRent: "$1,200 - $1,800",
      vibe: ["Artistic", "Hipster", "Bike-Friendly", "Diverse"],
      image: "https://images.unsplash.com/photo-1582735689115-3cc75c9f7b7b?w=800",
      highlights: [
        { icon: Coffee, text: "Best cafés in Montreal" },
        { icon: Music, text: "Live music & nightlife" },
        { icon: ShoppingBag, text: "Vintage & boutique shops" },
        { icon: Trees, text: "Beautiful parks" }
      ],
      transit: "Excellent (Metro: Mont-Royal, Laurier)",
      color: "from-orange-400 to-red-400"
    },
    {
      id: "rosemont",
      name: "Rosemont-La Petite-Patrie",
      shortName: "Rosemont",
      description: "Family-friendly neighborhood with affordable rents, local markets, and a strong community feel. Great for students and families.",
      avgRent: "$900 - $1,400",
      vibe: ["Family-Friendly", "Affordable", "Quiet", "Local"],
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
      highlights: [
        { icon: Home, text: "Residential & peaceful" },
        { icon: ShoppingBag, text: "Jean-Talon Market nearby" },
        { icon: DollarSign, text: "Affordable living" },
        { icon: Train, text: "Good metro access" }
      ],
      transit: "Good (Metro: Rosemont, Beaubien)",
      color: "from-green-400 to-emerald-400"
    },
    {
      id: "mile_end",
      name: "Mile End",
      shortName: "Mile End",
      description: "Creative epicenter with indie cafés, art studios, and a bohemian atmosphere. Home to tech startups and creative professionals.",
      avgRent: "$1,300 - $2,000",
      vibe: ["Creative", "Tech Hub", "Foodie", "Cool"],
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      highlights: [
        { icon: Coffee, text: "Specialty coffee culture" },
        { icon: UtensilsCrossed, text: "Famous bagels & food" },
        { icon: Building2, text: "Tech & creative scene" },
        { icon: Music, text: "Indie music venues" }
      ],
      transit: "Excellent (Near Metro: Laurier)",
      color: "from-purple-400 to-pink-400"
    },
    {
      id: "downtown",
      name: "Downtown / Ville-Marie",
      shortName: "Downtown",
      description: "Urban core with everything at your doorstep. Perfect for professionals wanting to be in the center of it all.",
      avgRent: "$1,400 - $2,500",
      vibe: ["Urban", "Convenient", "Professional", "Fast-Paced"],
      image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
      highlights: [
        { icon: Building2, text: "Business district" },
        { icon: Train, text: "All metro lines" },
        { icon: ShoppingBag, text: "Shopping & dining" },
        { icon: UtensilsCrossed, text: "International cuisine" }
      ],
      transit: "Excellent (Multiple Metro lines)",
      color: "from-blue-400 to-cyan-400"
    },
    {
      id: "ndg",
      name: "Notre-Dame-de-Grâce (NDG)",
      shortName: "NDG",
      description: "Diverse, multicultural neighborhood with affordable housing and great parks. Popular with students and young families.",
      avgRent: "$950 - $1,500",
      vibe: ["Multicultural", "Student-Friendly", "Green", "Affordable"],
      image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
      highlights: [
        { icon: GraduationCap, text: "Near universities" },
        { icon: Trees, text: "NDG Park & green spaces" },
        { icon: DollarSign, text: "Budget-friendly" },
        { icon: ShoppingBag, text: "Monkland Village shops" }
      ],
      transit: "Good (Metro: Vendôme, Villa-Maria)",
      color: "from-teal-400 to-green-400"
    },
    {
      id: "griffintown",
      name: "Griffintown",
      shortName: "Griffintown",
      description: "Modern, newly developed area with luxury condos, trendy restaurants, and a young professional crowd.",
      avgRent: "$1,500 - $2,200",
      vibe: ["Modern", "Upscale", "New", "Professional"],
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      highlights: [
        { icon: Building2, text: "New developments" },
        { icon: UtensilsCrossed, text: "Trendy restaurants" },
        { icon: Coffee, text: "Modern cafés" },
        { icon: Train, text: "Near metro & downtown" }
      ],
      transit: "Good (Metro: Bonaventure, Lucien-L'Allier)",
      color: "from-indigo-400 to-purple-400"
    },
    {
      id: "verdun",
      name: "Verdun",
      shortName: "Verdun",
      description: "Up-and-coming neighborhood with waterfront views, affordable rents, and a growing food scene. Great value for money.",
      avgRent: "$850 - $1,300",
      vibe: ["Emerging", "Waterfront", "Value", "Calm"],
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
      highlights: [
        { icon: Trees, text: "St. Lawrence waterfront" },
        { icon: DollarSign, text: "Best value" },
        { icon: UtensilsCrossed, text: "Growing food scene" },
        { icon: Train, text: "Metro access" }
      ],
      transit: "Good (Metro: De l'Église, Verdun)",
      color: "from-cyan-400 to-blue-400"
    },
    {
      id: "villeray",
      name: "Villeray",
      shortName: "Villeray",
      description: "Authentic Montreal neighborhood with Italian heritage, local shops, and a strong sense of community. Family-oriented and affordable.",
      avgRent: "$900 - $1,350",
      vibe: ["Traditional", "Community", "Italian", "Authentic"],
      image: "https://images.unsplash.com/photo-1449247666642-264389f5f5b1?w=800",
      highlights: [
        { icon: UtensilsCrossed, text: "Italian bakeries & cafés" },
        { icon: Trees, text: "Jarry Park" },
        { icon: Home, text: "Residential charm" },
        { icon: DollarSign, text: "Good value" }
      ],
      transit: "Good (Metro: Jarry, Jean-Talon)",
      color: "from-yellow-400 to-orange-400"
    },
    {
      id: "outremont",
      name: "Outremont",
      shortName: "Outremont",
      description: "Upscale, quiet neighborhood with beautiful architecture, boutique shops, and tree-lined streets. Perfect for those seeking elegance.",
      avgRent: "$1,400 - $2,300",
      vibe: ["Upscale", "Quiet", "Elegant", "Safe"],
      image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800",
      highlights: [
        { icon: Trees, text: "Beautiful tree-lined streets" },
        { icon: Coffee, text: "Boutique cafés" },
        { icon: ShoppingBag, text: "High-end shopping" },
        { icon: Home, text: "Historic architecture" }
      ],
      transit: "Good (Metro: Outremont, Édouard-Montpetit)",
      color: "from-rose-400 to-pink-400"
    },
    {
      id: "hochelaga",
      name: "Hochelaga-Maisonneuve",
      shortName: "Hochelaga",
      description: "East-end neighborhood experiencing revitalization, with affordable rents, sports facilities, and a growing arts scene.",
      avgRent: "$800 - $1,200",
      vibe: ["Revitalizing", "Affordable", "Sports", "Arts"],
      image: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800",
      highlights: [
        { icon: DollarSign, text: "Most affordable" },
        { icon: Trees, text: "Olympic Park & Botanical Garden" },
        { icon: Music, text: "Emerging arts scene" },
        { icon: Train, text: "Metro access" }
      ],
      transit: "Good (Metro: Pie-IX, Viau)",
      color: "from-emerald-400 to-teal-400"
    }
  ];

  const getListingCount = (neighborhoodId) => {
    return listings.filter(l => l.neighborhood === neighborhoodId && l.status === "available").length;
  };

  const filteredNeighborhoods = neighborhoods.filter(n => 
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.vibe.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExplore = (neighborhoodId) => {
    navigate(createPageUrl("BrowseListings") + `?neighborhood=${neighborhoodId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore Neighborhoods</h1>
              <p className="text-gray-600">Discover the perfect Montreal neighborhood for your lifestyle</p>
            </div>
          </div>

          {/* Search */}
          <Card className="shadow-lg border-none">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search neighborhoods by name, vibe, or characteristics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 text-lg py-6"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Neighborhoods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNeighborhoods.map((neighborhood, index) => (
            <motion.div
              key={neighborhood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-none bg-white group">
                {/* Neighborhood Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={neighborhood.image}
                    alt={neighborhood.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Neighborhood Name Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {neighborhood.shortName}
                    </h2>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{neighborhood.name}</span>
                    </div>
                  </div>

                  {/* Listing Count Badge */}
                  {getListingCount(neighborhood.id) > 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/95 backdrop-blur-sm text-gray-800 border-0 shadow-lg">
                        <Home className="w-3 h-3 mr-1" />
                        {getListingCount(neighborhood.id)} available
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {neighborhood.description}
                  </p>

                  {/* Vibe Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {neighborhood.vibe.map((vibe) => (
                      <Badge
                        key={vibe}
                        className={`bg-gradient-to-r ${neighborhood.color} text-white border-0`}
                      >
                        {vibe}
                      </Badge>
                    ))}
                  </div>

                  {/* Average Rent */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-600">Average Rent</p>
                      <p className="font-bold text-indigo-600">{neighborhood.avgRent} CAD/month</p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {neighborhood.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <highlight.icon className="w-4 h-4 text-indigo-500" />
                        <span>{highlight.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Transit */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <Train className="w-4 h-4 text-indigo-500" />
                    <span>{neighborhood.transit}</span>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleExplore(neighborhood.id)}
                    className={`w-full bg-gradient-to-r ${neighborhood.color} hover:opacity-90 text-white shadow-lg`}
                  >
                    Explore {neighborhood.shortName}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNeighborhoods.length === 0 && (
          <Card className="shadow-xl border-none">
            <CardContent className="p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No neighborhoods found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms
              </p>
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-12">
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white overflow-hidden">
            <CardContent className="p-8 md:p-12 relative">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">
                  Still unsure where to live?
                </h2>
                <p className="text-indigo-100 text-lg mb-6 max-w-2xl">
                  Let our AI match you with roommates first, then find the perfect neighborhood together based on your combined preferences!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate(createPageUrl("BrowseRoommates"))}
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl"
                  >
                    Find Roommates First
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl("BrowseListings"))}
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/20"
                  >
                    Browse All Listings
                  </Button>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}