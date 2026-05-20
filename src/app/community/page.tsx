"use client";

import { useEffect, useState } from "react";
import {
    Users,
    MessageSquare,
    Search,
    Plus,
    TrendingUp,
    MessageCircle,
    Loader2,
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    upvotes?: number;
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string;
        image_url?: string;
    };
    comment_count?: number;
}

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const forumCategories = ["All", "General", "Academic", "Freelancing", "Events", "Market Talk"];

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from("community_posts")
                    .select(`
                        *,
                        profiles (
                            full_name,
                            image_url
                        )
                    `)
                    .order("created_at", { ascending: false });

                if (fetchError) {
                    if (fetchError.code === 'PGRST116' || fetchError.message.includes("does not exist")) {
                        setPosts([]);
                    } else {
                        throw fetchError;
                    }
                } else {
                    setPosts(data.map(post => ({
                        ...post,
                        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
                    })));
                }
            } catch (err) {
                console.error("Error fetching community posts:", err);
                setError("Failed to load community posts.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.25rem] flex items-center justify-center shadow-inner">
                                <Users size={32} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Campus Forum</h1>
                        </div>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-2xl">Connect, discuss, and grow with students across all universities.</p>
                    </div>
                    <Button asChild className="h-16 px-10 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3">
                        <Link href="/community/create">
                            <Plus size={24} /> New Discussion
                        </Link>
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Left Sidebar */}
                    <aside className="lg:col-span-1 space-y-10">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                            <Input
                                placeholder="Search discussions..."
                                className="h-16 pl-14 bg-white border-zinc-100 rounded-[1.5rem] outline-none focus-visible:ring-primary/20 shadow-sm font-medium transition-all text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white p-8">
                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <TrendingUp size={14} className="text-primary" /> Browse Categories
                            </h3>
                            <div className="space-y-3">
                                {forumCategories.map((cat) => (
                                    <Button
                                        key={cat}
                                        variant={selectedCategory === cat ? "default" : "ghost"}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full justify-between h-12 px-6 rounded-xl font-black text-sm transition-all group ${selectedCategory === cat ? 'shadow-lg shadow-primary/10' : 'text-zinc-500 hover:text-primary hover:bg-primary/5'}`}
                                    >
                                        {cat}
                                        <ArrowRight size={16} className={`transition-all duration-300 ${selectedCategory === cat ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                                    </Button>
                                ))}
                            </div>
                        </Card>

                        <Alert className="rounded-[2rem] bg-primary/5 border-primary/10 p-8">
                            <AlertDescription className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                Community Tip
                            </AlertDescription>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                Use the <strong className="text-primary">#MarketTalk</strong> category to ask for price verifications or vendor reviews!
                            </p>
                        </Alert>
                    </aside>

                    {/* Main Feed */}
                    <div className="lg:col-span-3 space-y-8">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-6">
                                <Loader2 className="animate-spin text-primary" size={56} />
                                <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Campus Feed...</p>
                            </div>
                        ) : error ? (
                            <Alert variant="destructive" className="rounded-[2rem] p-8 border-none bg-red-50 text-red-700">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                                <AlertDescription className="font-bold text-lg ml-2">{error}</AlertDescription>
                            </Alert>
                        ) : filteredPosts.length === 0 ? (
                            <Card className="rounded-[3.5rem] p-24 border-dashed border-2 border-zinc-200 bg-white/50 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 text-zinc-200">
                                    <MessageSquare size={48} />
                                </div>
                                <CardTitle className="text-3xl font-black text-primary mb-3">The floor is yours!</CardTitle>
                                <CardDescription className="text-zinc-500 mb-10 max-w-sm font-medium text-lg leading-relaxed">
                                    Be the first to start a conversation in this category or refine your search.
                                </CardDescription>
                                <Button asChild className="h-16 px-10 bg-primary text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/30">
                                    <Link href="/community/create">Start a Discussion</Link>
                                </Button>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {filteredPosts.map((post) => (
                                    <Card
                                        key={post.id}
                                        className="group rounded-[3rem] border-none shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-white cursor-pointer"
                                    >
                                        <Link href={`/community/post/${post.id}`} className="block p-10">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-sm bg-zinc-50">
                                                        <AvatarImage src={post.profiles?.image_url} className="object-cover" />
                                                        <AvatarFallback className="text-primary font-black">
                                                            {post.profiles?.full_name?.charAt(0) || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h4 className="font-black text-primary text-sm leading-tight">{post.profiles?.full_name || "Anonymous Student"}</h4>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none group-hover:bg-primary group-hover:text-white transition-colors">
                                                    {post.category}
                                                </Badge>
                                            </div>
                                            <h3 className="text-2xl font-black text-primary mb-4 leading-tight group-hover:text-primary/80 transition-colors">{post.title}</h3>
                                            <p className="text-zinc-500 font-medium line-clamp-2 mb-10 text-lg leading-relaxed">{post.content}</p>

                                            <Separator className="mb-6 opacity-50" />

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-zinc-400 font-black text-xs uppercase tracking-widest px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100">
                                                        <MessageCircle size={16} className="text-primary" />
                                                        {post.comment_count || 0} Comments
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                                    Join Discussion <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
