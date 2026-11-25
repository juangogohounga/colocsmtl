import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Search,
  Heart,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function Chat() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get("email");

  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (matches.length > 0 && emailParam) {
      const match = matches.find(m => {
        const otherEmail = getOtherUserEmail(m);
        return otherEmail === emailParam;
      });
      if (match) {
        handleSelectMatch(match);
      }
    }
  }, [matches, emailParam]);

  useEffect(() => {
    if (selectedMatch) {
      const interval = setInterval(() => {
        loadMessages(selectedMatch.id);
      }, 3000); // Refresh messages every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedMatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);

      // Get all mutual matches
      const allMatches = await api.entities.Match.list("-updated_date");
      const mutualMatches = allMatches.filter(
        m => m.match_status === "mutual" && 
        (m.user1_email === currentUser.email || m.user2_email === currentUser.email)
      );

      setMatches(mutualMatches);

      // Load all related profiles
      const profileEmails = new Set();
      mutualMatches.forEach(match => {
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

  const loadMessages = async (matchId) => {
    try {
      const matchMessages = await api.entities.Message.filter(
        { match_id: matchId },
        "created_date"
      );
      setMessages(matchMessages);

      // Mark messages as read
      const unreadMessages = matchMessages.filter(
        m => m.receiver_email === user.email && !m.is_read
      );
      for (const msg of unreadMessages) {
        await api.entities.Message.update(msg.id, { is_read: true });
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSelectMatch = async (match) => {
    setSelectedMatch(match);
    await loadMessages(match.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;

    setSending(true);
    try {
      const otherEmail = getOtherUserEmail(selectedMatch);
      
      await api.entities.Message.create({
        match_id: selectedMatch.id,
        sender_email: user.email,
        receiver_email: otherEmail,
        message_text: newMessage.trim(),
        sent_at: new Date().toISOString()
      });

      // Update match's last message date
      await api.entities.Match.update(selectedMatch.id, {
        last_message_date: new Date().toISOString()
      });

      setNewMessage("");
      await loadMessages(selectedMatch.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setSending(false);
  };

  const getOtherUserEmail = (match) => {
    return match.user1_email === user?.email ? match.user2_email : match.user1_email;
  };

  const getOtherProfile = (match) => {
    const otherEmail = getOtherUserEmail(match);
    return profiles[otherEmail];
  };

  const getLastMessage = (matchId) => {
    const matchMessages = messages.filter(m => m.match_id === matchId);
    return matchMessages[matchMessages.length - 1];
  };

  const filteredMatches = matches.filter(match => {
    if (!searchTerm) return true;
    const profile = getOtherProfile(match);
    return profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <Card>
                <Skeleton className="h-96 w-full" />
              </Card>
            </div>
            <div className="col-span-8">
              <Card>
                <Skeleton className="h-96 w-full" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">{matches.length} conversations</p>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <Card className="shadow-xl border-none">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                No Conversations Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start matching with people to begin chatting!
              </p>
              <Button
                onClick={() => navigate(createPageUrl("BrowseRoommates"))}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Find Roommates
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <div className={`lg:col-span-4 ${selectedMatch ? 'hidden lg:block' : ''}`}>
              <Card className="shadow-xl border-none h-full flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Conversations */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredMatches.map((match) => {
                      const profile = getOtherProfile(match);
                      if (!profile) return null;

                      return (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSelectMatch(match)}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            selectedMatch?.id === match.id
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                              : 'bg-white hover:bg-indigo-50 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 border-2 border-white">
                              <AvatarImage src={profile.profile_image_url} />
                              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-semibold">
                                {profile.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-semibold truncate ${
                                  selectedMatch?.id === match.id ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {profile.full_name}
                                </h3>
                                {match.compatibility_score && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      selectedMatch?.id === match.id 
                                        ? 'bg-white/20 border-white/30 text-white' 
                                        : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                    }`}
                                  >
                                    {match.compatibility_score}%
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-sm truncate ${
                                selectedMatch?.id === match.id ? 'text-indigo-100' : 'text-gray-500'
                              }`}>
                                {profile.bio || 'Start a conversation...'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className={`lg:col-span-8 ${!selectedMatch ? 'hidden lg:block' : ''}`}>
              <Card className="shadow-xl border-none h-full flex flex-col">
                {selectedMatch ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-6 border-b border-gray-100 bg-white rounded-t-xl">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedMatch(null)}
                          className="lg:hidden"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                        
                        <Avatar 
                          className="w-12 h-12 border-2 border-indigo-200 cursor-pointer"
                          onClick={() => navigate(createPageUrl("ProfileView") + `?email=${getOtherUserEmail(selectedMatch)}`)}
                        >
                          <AvatarImage src={getOtherProfile(selectedMatch)?.profile_image_url} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-semibold">
                            {getOtherProfile(selectedMatch)?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">
                            {getOtherProfile(selectedMatch)?.full_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">
                              {getOtherProfile(selectedMatch)?.occupation?.replace(/_/g, ' ')}
                            </p>
                            {selectedMatch.compatibility_score && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-green-500" />
                                  <span className="text-sm font-semibold text-green-600">
                                    {selectedMatch.compatibility_score}% match
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(createPageUrl("ProfileView") + `?email=${getOtherUserEmail(selectedMatch)}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-indigo-50/30">
                      <AnimatePresence>
                        {messages.map((message, index) => {
                          const isMe = message.sender_email === user.email;
                          const showDate = index === 0 || 
                            format(new Date(messages[index - 1].sent_at || messages[index - 1].created_date), 'PP') !== 
                            format(new Date(message.sent_at || message.created_date), 'PP');

                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="flex justify-center my-4">
                                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                                    {format(new Date(message.sent_at || message.created_date), 'MMMM d, yyyy')}
                                  </Badge>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                                  <div
                                    className={`rounded-2xl px-4 py-3 ${
                                      isMe
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                        : 'bg-white text-gray-900 shadow-md border border-gray-100'
                                    }`}
                                  >
                                    <p className="text-sm leading-relaxed">{message.message_text}</p>
                                  </div>
                                  <p className={`text-xs mt-1 ${
                                    isMe ? 'text-right text-gray-500' : 'text-left text-gray-500'
                                  }`}>
                                    {format(new Date(message.sent_at || message.created_date), 'h:mm a')}
                                  </p>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </AnimatePresence>

                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-indigo-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Start the conversation!
                          </h3>
                          <p className="text-sm text-gray-600">
                            Say hello to your new potential roommate
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-6 border-t border-gray-100 bg-white rounded-b-xl">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                          disabled={sending}
                        />
                        <Button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                        >
                          {sending ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="w-10 h-10 text-indigo-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-gray-600">
                        Choose from your matches to start chatting
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}