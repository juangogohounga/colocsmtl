import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { api } from "@/api/client";
import { 
  Home, 
  Users, 
  Building2, 
  MessageCircle, 
  Heart, 
  MapPin, 
  User,
  LogOut,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Find Roommates",
    url: createPageUrl("BrowseRoommates"),
    icon: Users,
  },
  {
    title: "Browse Rooms",
    url: createPageUrl("BrowseListings"),
    icon: Building2,
  },
  {
    title: "My Matches",
    url: createPageUrl("Matches"),
    icon: Heart,
  },
  {
    title: "Messages",
    url: createPageUrl("Chat"),
    icon: MessageCircle,
  },
  {
    title: "Neighborhoods",
    url: createPageUrl("Neighborhoods"),
    icon: MapPin,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      const profiles = await api.entities.UserProfile.filter({ user_email: currentUser.email }, "-created_date", 1);
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary-indigo: #4F46E5;
          --primary-coral: #FF6B6B;
          --primary-purple: #9333EA;
          --neutral-50: #F9FAFB;
          --neutral-100: #F3F4F6;
          --neutral-800: #1F2937;
          --neutral-900: #111827;
        }
      `}</style>
      
      <div className="min-h-screen flex w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar className="border-r border-white/60 bg-white/90 backdrop-blur-xl shadow-xl">
          <SidebarHeader className="border-b border-indigo-100/50 p-6">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ColocsMTL
                </h2>
                <p className="text-xs text-gray-500">Find Your Perfect Match</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-xl mb-2 ${
                            isActive 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl' 
                              : 'hover:bg-indigo-50 text-gray-700'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {!profile && user && (
              <div className="mt-6 mx-3 p-4 bg-gradient-to-br from-coral-50 to-pink-50 border border-coral-200 rounded-2xl">
                <p className="text-sm font-medium text-gray-800 mb-2">✨ Complete Your Profile</p>
                <p className="text-xs text-gray-600 mb-3">Get matched with compatible roommates!</p>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md"
                  onClick={() => navigate(createPageUrl("ProfileSetup"))}
                >
                  Set Up Profile
                </Button>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-indigo-100/50 p-4">
            {user ? (
              <div className="space-y-3">
                <Link 
                  to={createPageUrl("MyProfile")}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 group"
                >
                  <Avatar className="w-10 h-10 border-2 border-indigo-200 group-hover:border-indigo-400 transition-all">
                    <AvatarImage src={profile?.profile_image_url} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-semibold">
                      {user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => api.auth.redirectToLogin(createPageUrl("Home"))}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md"
              >
                Sign In
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="bg-white/90 backdrop-blur-xl border-b border-indigo-100/50 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-indigo-50 p-2 rounded-xl transition-all" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ColocsMTL
                </h1>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}