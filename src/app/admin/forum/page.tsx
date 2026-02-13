"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    Search,
    Trash2,
    AlertCircle,
    Loader2,
    ExternalLink,
    ArrowLeft,
    ShieldAlert,
    MessageCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const ADMIN_EMAIL = "bytesage013@gmail.com";

interface Post {
    id: string;
    title: string;
    category: string;
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string;
    };
}

export default function ForumModeration() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || session.user.email !== ADMIN_EMAIL) {
                router.push("/login");
                return;
            }
            fetchPosts();
        };
        checkAdmin();
    }, [router]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from("community_posts")
                .select(`
                    *,
                    profiles (
                        full_name
                    )
                `)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            const transformed = data.map(p => ({
                ...p,
                profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
            }));

            setPosts(transformed);
            setFilteredPosts(transformed);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Failed to load forum content.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = posts;
        if (searchQuery.trim()) {
            result = result.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredPosts(result);
    }, [searchQuery, posts]);

    const deletePost = async (id: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this discussion and all its comments?")) return;
        setActionLoading(id);
        try {
            const { error: deleteError } = await supabase
                .from("community_posts")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
            setPosts(posts.filter(p => p.id !== id));
        } catch (err) {
            alert("Failed to delete post.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/admin" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary font-bold mb-4 transition-colors">
                            <ArrowLeft size={16} /> Back to Hub
                        </Link>
                        <h1 className="text-4xl font-black text-primary tracking-tight">Forum Moderation</h1>
                        <p className="text-zinc-500 font-medium">Monitor and manage community discussions</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search discussions..."
                                className="pl-12 pr-6 py-3 bg-white border border-border-soft rounded-xl outline-none focus:border-primary transition-all font-bold text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-border-soft">
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Discussion Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Author</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Posted On</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary line-clamp-1">{post.title}</span>
                                                <span className="text-[10px] font-black text-primary/30 uppercase tracking-tighter">ID: {post.id.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-zinc-700">{post.profiles.full_name}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-medium text-zinc-500 text-sm">{new Date(post.created_at).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            <Link
                                                href={`/community/post/${post.id}`}
                                                target="_blank"
                                                className="p-2 bg-zinc-100 text-zinc-400 hover:text-primary rounded-xl transition-all inline-block shadow-sm"
                                                title="View Discussion"
                                            >
                                                <ExternalLink size={18} />
                                            </Link>
                                            <button
                                                onClick={() => deletePost(post.id)}
                                                disabled={actionLoading === post.id}
                                                className="p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all shadow-sm"
                                                title="Delete Post"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPosts.length === 0 && (
                            <div className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest">
                                No discussions found matching your search
                            </div>
                        )}
                    </div>
                </div>

                {/* Safety Tips for Admins */}
                <div className="mt-12 bg-red-50 border border-red-100 p-8 rounded-[2.5rem] flex items-start gap-6 shadow-sm">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-red-800 mb-1 tracking-tight">Community Standards</h4>
                        <p className="text-red-700/80 text-sm font-medium leading-relaxed max-w-2xl">
                            Delete any content that violates campus guidelines, includes hate speech, or promotes illegal activities. Use the "View" link to check comments before taking action.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
