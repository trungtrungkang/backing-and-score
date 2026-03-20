"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { 
  listPublished, 
  listPublishedPlaylists, 
  checkIsFollowing,
  followUser,
  unfollowUser,
  getReactionsCount,
  ProjectDocument,
  PlaylistDocument
} from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music4, ListMusic, Globe, LayoutGrid, Check, Plus, ArrowLeft } from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectDocument[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDocument[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // Example stats. Real apps would query the Follows & Reactions collection for accurate counts.
  const followerCount = 0; 
  const totalLikes = 0; 

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      try {
        const [projRes, plRes] = await Promise.all([
           listPublished(undefined, userId),
           listPublishedPlaylists(userId)
        ]);
        
        if (!cancelled) {
          setProjects(projRes);
          setPlaylists(plRes);
        }

        // Only check follow logic if authenticated as a different user
        if (user && user.$id !== userId) {
           const following = await checkIsFollowing(userId);
           if (!cancelled) setIsFollowing(following);
        }

      } catch (e) {
        console.error("Failed to load user profile", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!authLoading) {
      loadProfile();
    }

    return () => { cancelled = true; };
  }, [userId, user, authLoading]);

  const handleToggleFollow = async () => {
    if (!user || isTogglingFollow) return;
    setIsTogglingFollow(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const isSelf = user && user.$id === userId;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fdfdfc] dark:bg-[#0E0E11] text-zinc-900 dark:text-white flex flex-col">
      
      {/* Profile Header Banner */}
      <div className="h-48 w-full bg-gradient-to-r from-[#1A1A1E] to-[#2a2a32] relative">
         <div className="absolute top-6 left-6 z-10">
            <Link href="/feed" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/90 transition-colors text-sm font-semibold">
               <ArrowLeft className="w-4 h-4" /> Feed
            </Link>
         </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        
        {/* Avatar & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
           <div className="flex gap-6 items-end">
              <div className="w-32 h-32 rounded-2xl bg-[#fdfdfc] dark:bg-[#0E0E11] p-1.5 shadow-xl">
                 <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-inner">
                    {userId.substring(0,2).toUpperCase()}
                 </div>
              </div>
              <div className="pb-2">
                 <h1 className="text-3xl font-black tracking-tight mb-1">User {userId.substring(0,8)}</h1>
                 <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">@{userId}</p>
                 <div className="flex items-center gap-4 mt-3 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    <div><strong className="text-zinc-900 dark:text-white">{followerCount}</strong> Followers</div>
                    <div><strong className="text-zinc-900 dark:text-white">{projects.length}</strong> Works</div>
                 </div>
              </div>
           </div>
           
           <div className="pb-2 flex gap-3">
              {isSelf ? (
                 <Button variant="outline" className="rounded-full font-bold px-6 bg-transparent border-zinc-200 dark:border-zinc-800" disabled>
                   This is you
                 </Button>
              ) : (
                 <Button 
                   onClick={handleToggleFollow}
                   disabled={isTogglingFollow || !user}
                   className={`rounded-full font-bold px-8 transition-colors ${
                     isFollowing 
                       ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700" 
                       : "bg-[#C8A856] text-black hover:bg-[#d4b566]"
                   }`}
                 >
                   {isFollowing ? (
                     <><Check className="w-4 h-4 mr-2" /> Following</>
                   ) : (
                     <><Plus className="w-4 h-4 mr-2" /> Follow</>
                   )}
                 </Button>
              )}
           </div>
        </div>

        {loading ? (
           <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#C8A856] rounded-full animate-spin"></div>
           </div>
        ) : (
           <Tabs defaultValue="projects" className="w-full">
              <TabsList className="bg-transparent border-b border-zinc-200 dark:border-white/5 w-full justify-start rounded-none h-auto p-0 gap-6">
                 <TabsTrigger 
                   value="projects" 
                   className="rounded-none bg-transparent hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#C8A856] pb-3 pt-2 px-1 font-bold text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-colors"
                 >
                   Published Projects
                   <span className="ml-2 bg-zinc-100 dark:bg-white/10 text-xs px-2 py-0.5 rounded-full">{projects.length}</span>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="collections"
                   className="rounded-none bg-transparent hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#C8A856] pb-3 pt-2 px-1 font-bold text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-colors"
                 >
                   Collections
                   <span className="ml-2 bg-zinc-100 dark:bg-white/10 text-xs px-2 py-0.5 rounded-full">{playlists.length}</span>
                 </TabsTrigger>
              </TabsList>
              
              <TabsContent value="projects" className="pt-8 outline-none">
                 {projects.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                       <Music4 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                       <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No Published Work</h3>
                       <p className="text-zinc-500 max-w-sm mx-auto">
                         This user hasn't published any interactive scores yet.
                       </p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {projects.map(proj => (
                          <Link href={`/p/${proj.$id}`} key={proj.$id} className="block group">
                             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-xl hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                                <div className="aspect-video bg-zinc-100 dark:bg-black/50 relative overflow-hidden flex items-center justify-center">
                                   {proj.coverUrl ? (
                                      <img src={proj.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="cover" />
                                   ) : (
                                      <Music4 className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                                   )}
                                   <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-white flex items-center gap-1.5 border border-white/10">
                                      <Globe className="w-3 h-3 text-[#C8A856]" /> PUBLIC
                                   </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                   <div className="text-[10px] uppercase tracking-widest text-[#C8A856] font-bold mb-1.5">{proj.mode}</div>
                                   <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 leading-tight group-hover:text-[#C8A856] transition-colors line-clamp-2">{proj.name}</h3>
                                   <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 flex-1 mb-4">
                                      {proj.description || "A beautiful interactive sheet music arrangement."}
                                   </p>
                                </div>
                             </div>
                          </Link>
                       ))}
                    </div>
                 )}
              </TabsContent>

              <TabsContent value="collections" className="pt-8 outline-none">
                 {playlists.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                       <ListMusic className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                       <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No Public Collections</h3>
                       <p className="text-zinc-500 max-w-sm mx-auto">
                         User has not aggregated any public collections.
                       </p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {playlists.map(playlist => (
                          <Link href={`/collection/${playlist.$id}`} key={playlist.$id} className="block group">
                             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-xl hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300">
                                <div className="h-32 bg-zinc-100 dark:bg-black/50 relative overflow-hidden flex items-center justify-center p-6 border-b border-zinc-200 dark:border-white/5">
                                   <LayoutGrid className="w-12 h-12 text-zinc-300 dark:text-zinc-700 opacity-50" />
                                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 pointer-events-none mix-blend-overlay"></div>
                                </div>
                                <div className="p-5">
                                   <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
                                     <ListMusic className="w-3.5 h-3.5" /> Playlist
                                   </div>
                                   <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 leading-tight group-hover:text-blue-500 transition-colors truncate">
                                      {playlist.name}
                                   </h3>
                                   <p className="text-xs text-zinc-500 font-medium">
                                      {playlist.projectIds?.length || 0} Tracks included
                                   </p>
                                </div>
                             </div>
                          </Link>
                       ))}
                    </div>
                 )}
              </TabsContent>
           </Tabs>
        )}
      </div>
    </div>
  );
}
