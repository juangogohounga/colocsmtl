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
  House
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
      <div className="min-h-screen flex w-full bg-sand-50">
        <Sidebar className="border-r border-white/60 bg-white/90 backdrop-blur-xl shadow-xl">
          <SidebarHeader className="border-b border-brick-100/50 p-6">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-brick-500 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:-rotate-3">
                <House className="w-5 h-5 text-sand-50" strokeWidth={2.25} />
              </div>
              <div>
                <h2 className="font-display font-semibold text-2xl text-stone-900">
                  ColocsMTL
                </h2>
                <p className="text-xs text-stone-500">Find Your Perfect Match</p>
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
                              ? 'bg-brick-500 text-white shadow-lg hover:shadow-xl' 
                              : 'hover:bg-brick-50 text-stone-700'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brick-500'}`} />
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
              <div className="mt-6 mx-3 p-4 bg-brick-50 border border-brick-200 rounded-2xl">
                <p className="text-sm font-medium text-stone-800 mb-2">✨ Complete Your Profile</p>
                <p className="text-xs text-stone-600 mb-3">Get matched with compatible roommates!</p>
                <Button 
                  size="sm" 
                  className="w-full bg-brick-500 hover:bg-brick-600 text-white shadow-md"
                  onClick={() => navigate(createPageUrl("ProfileSetup"))}
                >
                  Set Up Profile
                </Button>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-brick-100/50 p-4">
            {user ? (
              <div className="space-y-3">
                <Link 
                  to={createPageUrl("MyProfile")}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-brick-50 transition-all duration-200 group"
                >
                  <Avatar className="w-10 h-10 border-2 border-brick-200 group-hover:border-brick-400 transition-all">
                    <AvatarImage src={profile?.profile_image_url} />
                    <AvatarFallback className="bg-brick-400 text-white font-semibold">
                      {user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-stone-500 truncate">{user.email}</p>
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
                className="w-full bg-brick-500 hover:bg-brick-600 text-white shadow-md"
              >
                Sign In
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="bg-white/90 backdrop-blur-xl border-b border-brick-100/50 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-brick-50 p-2 rounded-xl transition-all" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brick-500 rounded-xl flex items-center justify-center">
                  <House className="w-4 h-4 text-sand-50" strokeWidth={2.25} />
                </div>
                <h1 className="font-display text-lg font-semibold text-stone-900">
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