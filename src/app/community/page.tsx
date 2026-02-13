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
    MessageSquare as PostIcon
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
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
                // Fetch posts with profile info
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
                        // Table doesn't exist yet, show a placeholder or empty state
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
                {/* Hero Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Users size={28} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Campus Forum</h1>
                        </div>
                        <p className="text-zinc-500 font-medium text-lg">Connect, discuss, and grow with students across all universities.</p>
                    </div>
                    <Link
                        href="/community/create"
                        className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 h-fit whitespace-nowrap"
                    >
                        <Plus size={24} /> New Discussion
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Left Sidebar: Categories & Search */}
                    <aside className="lg:col-span-1 space-y-8">
                        {/* Search Box */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search discussions..."
                                className="w-full py-4 pl-12 pr-6 bg-white border border-border-soft rounded-2xl outline-none focus:border-primary/20 shadow-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category List */}
                        <div className="bg-white p-6 rounded-[2rem] border border-border-soft shadow-sm">
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <TrendingUp size={14} /> Categories
                            </h3>
                            <div className="space-y-2">
                                {forumCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-between group ${selectedCategory === cat
                                                ? "bg-primary text-white shadow-lg shadow-primary/10"
                                                : "text-zinc-500 hover:bg-zinc-50 hover:text-primary"
                                            }`}
                                    >
                                        {cat}
                                        <ArrowRight size={14} className={`transition-transform ${selectedCategory === cat ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Trending Tip */}
                        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-2">Community Tip</h4>
                            <p className="text-zinc-600 text-xs font-medium leading-relaxed">
                                Use the <strong>#MarketTalk</strong> category to ask for price verifications or vendor reviews!
                            </p>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <div className="lg:col-span-3 space-y-6">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-primary" size={48} />
                                <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-xs">Loading Feed...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex items-center gap-4">
                                <AlertCircle className="text-red-500" size={32} />
                                <p className="font-bold text-red-600">{error}</p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="bg-white rounded-[3rem] p-20 border border-border-soft shadow-sm text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-zinc-50 text-zinc-200 rounded-3xl flex items-center justify-center mb-6">
                                    <PostIcon size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-primary mb-2">The floor is yours!</h2>
                                <p className="text-zinc-500 mb-8 max-w-sm font-medium">Be the first to start a conversation in this category or search for something else.</p>
                                <Link
                                    href="/community/create"
                                    className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Start a Discussion
                                </Link>
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/community/post/${post.id}`}
                                    className="block bg-white p-8 rounded-[2.5rem] border border-border-soft shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 flex items-center justify-center font-black text-primary">
                                                {post.profiles?.image_url ? (
                                                    <img src={post.profiles.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    post.profiles?.full_name?.charAt(0) || "?"
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-primary text-sm">{post.profiles?.full_name || "Anonymous Student"}</h4>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="px-4 py-1.5 bg-bg-soft text-primary-soft text-[10px] font-black uppercase tracking-widest rounded-xl">
                                            {post.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors leading-tight">{post.title}</h3>
                                    <p className="text-zinc-600 font-medium line-clamp-2 mb-6 text-sm">{post.content}</p>

                                    <div className="flex items-center gap-6 pt-6 border-t border-zinc-50">
                                        <div className="flex items-center gap-2 text-zinc-400 font-black text-xs">
                                            <MessageCircle size={16} />
                                            {post.comment_count || 0} Comments
                                        </div>
                                        <div className="flex items-center gap-2 text-primary font-black text-xs ml-auto group-hover:translate-x-1 transition-transform">
                                            Join Discussion <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
