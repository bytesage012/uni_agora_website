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
    ChevronRight,
    ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<unknown>(null);
    const [stats, setStats] = useState({ serviceCount: 0 });
    const [recentConversations, setRecentConversations] = useState<unknown[]>([]);
    const [recentPosts, setRecentPosts] = useState<unknown[]>([]);

    useEffect(() => {
        const fetchProfileAndStats = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            setProfile(profileData);

            if (profileData?.is_freelancer) {
                const { count } = await supabase
                    .from("services")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", session.user.id);

                setStats({ serviceCount: count || 0 });
            }

            const { data: participants } = await supabase
                .from("conversation_participants")
                .select("conversation_id")
                .eq("user_id", session.user.id);

            if (participants && participants.length > 0) {
                const convIds = participants.map(p => p.conversation_id);

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
                    const profileRec = other?.profiles as Record<string, unknown> | Array<Record<string, unknown>>;
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

        return (
            <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
                <Navbar />
                <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-12 space-y-12">
                    <div className="flex items-center gap-6 animate-pulse">
                        <Skeleton className="w-20 h-20 rounded-3xl" />
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Skeleton className="h-64 rounded-[2rem]" />
                        <Skeleton className="h-64 rounded-[2rem]" />
                    </div>
                </main>
                <Footer />
            </div>
        );

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
            <Navbar />
            <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-12">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="w-20 h-20 rounded-3xl border-2 border-white shadow-md">
                            <AvatarImage src={profile?.image_url} />
                            <AvatarFallback className="bg-primary/5 text-primary">
                                <LayoutDashboard size={40} />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-4xl font-black text-primary mb-2">My Dashboard</h1>
                            <p className="text-zinc-600">Welcome back, <span className="text-primary font-bold">{profile?.full_name}</span>.</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Button variant="ghost" asChild className="text-sm font-bold text-zinc-400 hover:text-primary gap-1 p-0 h-auto">
                            <Link href="/profile">
                                Go to Profile <ExternalLink size={14} />
                            </Link>
                        </Button>
                        <Button variant="link" asChild className="text-xs font-bold text-primary p-0 h-auto">
                            <Link href="/edit-profile">
                                Edit Account Info
                            </Link>
                        </Button>
                    </div>
                </header>

                {profile?.verification_status !== 'verified' && (
                    <Alert className="mb-12 bg-amber-50 border-amber-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                            <div className="flex items-center gap-6 text-amber-900">
                                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                                    <AlertCircle size={28} className="text-amber-600" />
                                </div>
                                <div>
                                    <AlertTitle className="text-xl font-black tracking-tight mb-1">
                                        {profile?.verification_status === 'pending' ? 'Verification Pending' : 'Account Unverified'}
                                    </AlertTitle>
                                    <AlertDescription className="text-sm font-medium text-amber-700/80 leading-relaxed">
                                        {profile?.verification_status === 'pending'
                                            ? 'Our team is reviewing your documents. We will notify you once approved.'
                                            : 'Verify your student status to gain trust and unlock all features.'}
                                    </AlertDescription>
                                </div>
                            </div>
                            {profile?.verification_status !== 'pending' && (
                                <Button asChild className="h-14 px-8 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl shadow-lg shadow-amber-600/20">
                                    <Link href="/verify">Get Verified Now</Link>
                                </Button>
                            )}
                        </div>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Primary Stats Card */}
                    <Card className="p-8 rounded-[2.5rem] shadow-sm border-border-soft overflow-hidden group">
                        <CardHeader className="p-0 space-y-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <LayoutDashboard size={24} />
                            </div>
                            <CardTitle className="text-xl font-black text-primary">Overview</CardTitle>
                            <CardDescription className="text-zinc-500 font-medium leading-relaxed">
                                {profile?.is_freelancer
                                    ? `You have ${stats.serviceCount} active service${stats.serviceCount === 1 ? '' : 's'} listed.`
                                    : "You are currently browsing as a student. Become a freelancer to see more stats."}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Conditional Freelancer Sections */}
                    {profile?.is_freelancer ? (
                        <>
                            <Card className="rounded-[2.5rem] shadow-sm border-border-soft overflow-hidden group hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1 relative cursor-pointer" onClick={() => router.push("/my-services")}>
                                <div className="absolute top-6 right-6">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-ping absolute"></span>
                                    <span className="w-2 h-2 bg-primary rounded-full relative block"></span>
                                </div>
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <CardTitle className="text-xl font-black text-primary">My Services</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">Manage your active listings and update prices.</CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] bg-primary text-white shadow-xl shadow-primary/20 overflow-hidden group hover:scale-[1.02] active:scale-[0.98] transition-all relative cursor-pointer border-none" onClick={() => router.push("/create-service")}>
                                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                <CardContent className="p-8 space-y-4 relative z-10">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <Plus size={24} />
                                    </div>
                                    <CardTitle className="text-xl font-black">Add Service</CardTitle>
                                    <CardDescription className="text-white/80 font-medium">List a new skill and start earning on campus.</CardDescription>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="md:col-span-2 rounded-[2.5rem] border-dashed border-2 border-primary/20 bg-primary/[0.02] flex flex-col items-center justify-center text-center p-12 space-y-8 relative overflow-hidden group hover:border-primary/40 transition-colors">
                            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary group-hover:rotate-6 transition-transform duration-500 border border-zinc-100">
                                <Briefcase size={40} />
                            </div>

                            <div className="space-y-4">
                                <CardTitle className="text-3xl font-black text-primary">Unlock Selling Tools</CardTitle>
                                <CardDescription className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
                                    Become a freelancer to list your services, access analytics, and start earning today.
                                </CardDescription>
                            </div>
                            <Button asChild className="h-14 px-10 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105">
                                <Link href="/profile">Become a Freelancer</Link>
                            </Button>
                        </Card>
                    )}

                    {/* Recent Conversations */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                                <MessageSquare className="text-primary" /> Recent Messages
                            </h2>
                            <Button variant="outline" asChild className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6">
                                <Link href="/messages">View Inbox</Link>
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {recentConversations.length === 0 ? (
                                <Card className="p-12 rounded-[2.5rem] border-dashed border-2 border-zinc-100 bg-white text-center">
                                    <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px] mb-6">No active messages yet</p>
                                    <Button asChild variant="secondary" className="rounded-xl font-black">
                                        <Link href="/marketplace">Browse Marketplace</Link>
                                    </Button>
                                </Card>
                            ) : (
                                recentConversations.map((conv) => (
                                    <Card key={conv.id} className="rounded-[2rem] border-zinc-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                        <Link href={`/messages/${conv.id}`} className="flex items-center justify-between p-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-12 h-12 rounded-2xl border bg-zinc-50">
                                                    <AvatarFallback className="bg-primary/5 text-primary font-black">
                                                        {conv.other_participant_name ? conv.other_participant_name.charAt(0) : <MessageSquare size={20} />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-black text-primary">{conv.other_participant_name || 'Conversation'}</h4>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                        Updated {new Date(conv.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-zinc-300 group-hover:text-primary transition-colors" />
                                        </Link>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Community Posts Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                                <Users className="text-primary" /> Community
                            </h2>
                            <Button variant="link" asChild className="text-xs font-black text-primary uppercase tracking-widest p-0">
                                <Link href="/community">Forum</Link>
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {recentPosts.length === 0 ? (
                                <Card className="p-12 rounded-[2.5rem] bg-zinc-50/50 border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center text-center group transition-colors hover:bg-zinc-50 hover:border-primary/20">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-zinc-300 mb-6 group-hover:text-primary transition-colors group-hover:scale-110 duration-500">
                                        <Users size={32} />
                                    </div>
                                    <p className="text-zinc-500 font-medium mb-6">Your community feed is quiet. Start a conversation or ask a question!</p>
                                    <Button asChild className="h-12 px-8 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-primary hover:bg-primary-hover text-white shadow-premium">
                                        <Link href="/community/create">Start Discussion <ArrowUpRight size={16} /></Link>
                                    </Button>
                                </Card>
                            ) : (
                                recentPosts.map((post) => (
                                    <Card key={post.id} className="rounded-[2rem] border-zinc-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                        <Link href={`/community/post/${post.id}`} className="block p-6">
                                            <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] uppercase font-black px-2 mb-3 rounded-md">
                                                {post.category}
                                            </Badge>
                                            <h4 className="font-black text-primary text-sm line-clamp-1 mb-3 group-hover:text-primary/80 transition-colors">
                                                {post.title}
                                            </h4>
                                            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                                                    <MessageSquare size={10} /> View Post
                                                </span>
                                            </div>
                                        </Link>
                                    </Card>
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
