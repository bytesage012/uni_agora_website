"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    LayoutDashboard,
    ShoppingBag,
    Plus,
    ExternalLink,
    Loader2,
    Briefcase,
    MessageSquare,
    Users,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Search
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ serviceCount: 0 });
    const [recentConversations, setRecentConversations] = useState<any[]>([]);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfileAndStats = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            // Fetch profile
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            setProfile(profileData);

            // Fetch service count if freelancer
            if (profileData?.is_freelancer) {
                const { count } = await supabase
                    .from("services")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", session.user.id);

                setStats({ serviceCount: count || 0 });
            }

            // Fetch recent conversations
            const { data: participants } = await supabase
                .from("conversation_participants")
                .select("conversation_id")
                .eq("user_id", session.user.id);

            if (participants && participants.length > 0) {
                const convIds = participants.map(p => p.conversation_id);

                // Fetch other participants for these conversations
                const { data: others } = await supabase
                    .from("conversation_participants")
                    .select(`
                        conversation_id,
                        profiles (
                            full_name
                        )
                    `)
                    .in("conversation_id", convIds)
                    .neq("user_id", session.user.id);

                const { data: convos } = await supabase
                    .from("conversations")
                    .select("*")
                    .in("id", convIds)
                    .order("updated_at", { ascending: false })
                    .limit(3);

                const enriched = (convos || []).map(c => {
                    const other = others?.find(o => o.conversation_id === c.id);
                    const profileRec = other?.profiles as any;
                    const name = Array.isArray(profileRec)
                        ? profileRec[0]?.full_name
                        : profileRec?.full_name;

                    return {
                        ...c,
                        other_participant_name: name || 'Conversation'
                    };
                });

                setRecentConversations(enriched);
            }

            // Fetch user's recent posts
            const { data: posts } = await supabase
                .from("community_posts")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false })
                .limit(2);

            setRecentPosts(posts || []);

            setLoading(false);
        };
        fetchProfileAndStats();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-zinc-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Navbar />
            <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-12">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary overflow-hidden border-2 border-white shadow-md">
                            {profile?.image_url ? (
                                <img src={profile.image_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <LayoutDashboard size={40} />
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-primary mb-2">My Dashboard</h1>
                            <p className="text-zinc-600">Welcome back, <span className="text-primary font-bold">{profile?.full_name}</span>.</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Link href="/profile" className="text-sm font-bold text-zinc-400 hover:text-primary transition-colors flex items-center gap-1">
                            Go to Profile <ExternalLink size={14} />
                        </Link>
                        <Link href="/edit-profile" className="text-xs font-bold text-primary hover:underline transition-colors flex items-center gap-1">
                            Edit Account Info
                        </Link>
                    </div>
                </header>

                {/* Verification Alert */}
                {profile?.verification_status !== 'verified' && (
                    <div className="mb-12 bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-center gap-4 text-amber-700">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black tracking-tight">{profile?.verification_status === 'pending' ? 'Verification Pending' : 'Account Unverified'}</h4>
                                <p className="text-sm font-medium opacity-80">{profile?.verification_status === 'pending' ? 'Our team is currently reviewing your documents. We will notify you once approved.' : 'Verify your student status to gain trust and unlock all features.'}</p>
                            </div>
                        </div>
                        {profile?.verification_status !== 'pending' && (
                            <Link href="/profile" className="px-6 py-3 bg-amber-600 text-white font-black rounded-xl hover:bg-amber-700 transition-colors whitespace-nowrap">
                                Get Verified Now
                            </Link>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Primary Stats */}
                    <div className="p-8 bg-white rounded-3xl shadow-sm border border-border-soft space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-black rounded-full uppercase tracking-wider">
                                +12% <span className="text-green-500">↗</span>
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LayoutDashboard size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-primary">Overview</h3>
                        <p className="text-zinc-500 text-sm font-medium">
                            {profile?.is_freelancer
                                ? `You have ${stats.serviceCount} active service${stats.serviceCount === 1 ? '' : 's'} listed.`
                                : "You are currently browsing as a student. Become a freelancer to see more stats."}
                        </p>
                    </div>

                    {/* Conditional Freelancer Sections */}
                    {profile?.is_freelancer ? (
                        <>
                            <Link
                                href="/my-services"
                                className="group p-8 bg-white rounded-3xl shadow-sm border border-border-soft space-y-4 hover:border-primary/20 transition-all hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 relative"
                            >
                                <div className="absolute top-6 right-6">
                                    <span className="w-2 h-2 bg-accent rounded-full animate-ping absolute"></span>
                                    <span className="w-2 h-2 bg-accent rounded-full relative block"></span>
                                </div>
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <ShoppingBag size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-primary">My Services</h3>
                                <p className="text-zinc-500 text-sm font-medium">Manage your active listings and update prices.</p>
                            </Link>

                            <Link
                                href="/create-service"
                                className="group p-8 bg-primary text-white rounded-3xl shadow-xl space-y-4 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden"
                            >
                                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <Plus size={24} />
                                </div>
                                <h3 className="text-xl font-bold relative z-10">Add Service</h3>
                                <p className="text-white/80 text-sm font-medium relative z-10">List a new skill and start earning on campus.</p>
                            </Link>
                        </>
                    ) : (
                        <div className="md:col-span-2 p-8 bg-gradient-to-br from-bg-soft/50 to-white rounded-[2.5rem] border border-dashed border-primary/20 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group hover:border-primary/40 transition-colors">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                            {/* Custom Illustration */}
                            <div className="relative w-48 h-32 mx-auto">
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary rotate-3 group-hover:rotate-6 transition-transform duration-500 border border-zinc-50">
                                        <Briefcase size={32} />
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-accent rounded-full opacity-20 blur-xl animate-pulse"></div>
                                <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-primary rounded-full opacity-10 blur-xl"></div>
                                <svg className="absolute inset-0 w-full h-full text-primary/5" viewBox="0 0 100 100" fill="currentColor">
                                    <circle cx="10" cy="20" r="2" />
                                    <circle cx="90" cy="80" r="4" />
                                    <circle cx="50" cy="10" r="3" />
                                </svg>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <h3 className="text-2xl font-black text-primary">Unlock Selling Tools</h3>
                                <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
                                    You are currently a student buyer. Become a freelancer to list your services, access analytics, and start earning today.
                                </p>
                            </div>
                            <Link
                                href="/profile"
                                className="relative z-10 px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all hover:bg-primary-hover flex items-center gap-2"
                            >
                                Become a Freelancer
                            </Link>
                        </div>
                    )}

                    {/* Recent Conversations */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                                <MessageSquare className="text-accent" /> Recent Messages
                            </h2>
                            <Link href="/messages" className="text-xs font-black text-primary hover:underline uppercase tracking-widest px-4 py-2 bg-zinc-100 rounded-lg">View Inbox</Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {recentConversations.length === 0 ? (
                                <div className="p-12 bg-white rounded-[2rem] border border-dashed border-zinc-200 text-center">
                                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-4">No active conversations yet</p>
                                    <Link href="/marketplace" className="px-6 py-3 bg-primary/10 text-primary font-black rounded-xl text-sm">Browse Marketplace</Link>
                                </div>
                            ) : (
                                recentConversations.map((conv) => (
                                    <Link
                                        key={conv.id}
                                        href={`/messages/${conv.id}`}
                                        className="p-6 bg-white rounded-[2rem] border border-border-soft flex items-center justify-between hover:border-primary/20 transition-all hover:shadow-md group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-100">
                                                {conv.other_participant_name ? conv.other_participant_name.charAt(0) : <MessageSquare size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-primary">{conv.other_participant_name || 'Conversation'}</h4>
                                                <p className="text-xs text-zinc-500 font-medium">Updated {new Date(conv.updated_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-primary transition-colors" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Community Stats/Recent Posts */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                                <Users className="text-accent" /> Community
                            </h2>
                            <Link href="/community" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Forum</Link>
                        </div>
                        <div className="space-y-4">
                            {recentPosts.length === 0 ? (
                                <div className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                                    <p className="text-sm text-zinc-500 font-medium mb-4">You haven't posted anything in the community yet.</p>
                                    <Link href="/community/create" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1">Start a discussion <ChevronRight size={14} /></Link>
                                </div>
                            ) : (
                                recentPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/community/post/${post.id}`}
                                        className="block p-6 bg-white rounded-[2rem] border border-border-soft hover:shadow-md transition-all"
                                    >
                                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest block mb-2">{post.category}</span>
                                        <h4 className="font-black text-primary text-sm line-clamp-1 mb-2">{post.title}</h4>
                                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><MessageSquare size={10} /> View</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
