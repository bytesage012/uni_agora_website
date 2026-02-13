"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    MessageCircle,
    Send,
    Clock,
    User,
    Loader2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string;
        image_url?: string;
    };
}

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    created_at: string;
    user_id: string;
    profiles: {
        id: string;
        full_name: string;
        image_url?: string;
        verification_status: string;
    };
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commenting, setCommenting] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setCurrentUser(session?.user ?? null);

                // Fetch Post
                const { data: postData, error: postError } = await supabase
                    .from("community_posts")
                    .select(`
                        *,
                        profiles (
                            id,
                            full_name,
                            image_url,
                            verification_status
                        )
                    `)
                    .eq("id", resolvedParams.id)
                    .single();

                if (postError) throw postError;
                setPost({
                    ...postData,
                    profiles: Array.isArray(postData.profiles) ? postData.profiles[0] : postData.profiles
                });

                // Fetch Comments
                const { data: commentsData, error: commentsError } = await supabase
                    .from("community_comments")
                    .select(`
                        *,
                        profiles (
                            full_name,
                            image_url
                        )
                    `)
                    .eq("post_id", resolvedParams.id)
                    .order("created_at", { ascending: true });

                if (commentsError) throw commentsError;
                setComments(commentsData.map(c => ({
                    ...c,
                    profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
                })));

            } catch (err) {
                console.error("Error fetching post data:", err);
                setError("Discussion not found or connection issue.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [resolvedParams.id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return alert("Please login to comment.");
        if (newComment.trim().length < 2) return;

        setCommenting(true);
        try {
            const { data: commentData, error: commentError } = await supabase
                .from("community_comments")
                .insert([
                    {
                        post_id: resolvedParams.id,
                        user_id: currentUser.id,
                        content: newComment,
                    }
                ])
                .select(`
                    *,
                    profiles (
                        full_name,
                        image_url
                    )
                `)
                .single();

            if (commentError) throw commentError;

            const transformedComment = {
                ...commentData,
                profiles: Array.isArray(commentData.profiles) ? commentData.profiles[0] : commentData.profiles
            };

            setComments([...comments, transformedComment]);
            setNewComment("");
        } catch (err) {
            console.error("Error posting comment:", err);
            alert("Failed to post comment.");
        } finally {
            setCommenting(false);
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

    if (error || !post) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-sm text-center">
                        <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
                        <h1 className="text-2xl font-black text-primary mb-4">Discussion Missing</h1>
                        <p className="text-zinc-500 font-medium mb-8">{error || "This conversation may have been removed."}</p>
                        <Link href="/community" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl">
                            <ChevronLeft size={20} /> Back to Community
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <Link
                    href="/community"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold mb-8 transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Forum
                </Link>

                {/* Post Content */}
                <article className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-border-soft mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                                {post.profiles.image_url ? (
                                    <img src={post.profiles.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    post.profiles.full_name?.charAt(0)
                                )}
                            </div>
                            <div>
                                <h3 className="font-black text-primary text-lg flex items-center gap-2">
                                    {post.profiles.full_name}
                                    {post.profiles.verification_status === 'verified' && (
                                        <CheckCircle2 size={16} className="text-primary" />
                                    )}
                                </h3>
                                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                    <Clock size={14} />
                                    {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                        <span className="px-5 py-2 bg-bg-soft text-primary-soft text-xs font-black uppercase tracking-[0.2em] rounded-xl h-fit">
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-primary mb-8 leading-tight tracking-tight">
                        {post.title}
                    </h1>

                    <div className="prose prose-zinc max-w-none">
                        <p className="text-zinc-600 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>
                </article>

                {/* Comments Section */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                        <MessageCircle className="text-primary" />
                        Responses
                        <span className="text-zinc-300 font-bold ml-1">({comments.length})</span>
                    </h2>

                    {/* New Comment Form */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-border-soft shadow-sm relative overflow-hidden">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                        {!currentUser ? (
                            <div className="text-center py-6">
                                <p className="text-zinc-500 font-bold mb-4">Please login to join the discussion.</p>
                                <Link href="/login" className="px-8 py-3 bg-primary text-white font-black rounded-xl">Login Now</Link>
                            </div>
                        ) : (
                            <form onSubmit={handleCommentSubmit} className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-primary font-black text-xs border border-zinc-100">
                                        {currentUser.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-black text-zinc-500">Posting as {currentUser.email?.split('@')[0]}</span>
                                </div>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Write your response..."
                                    className="w-full p-6 bg-zinc-50 border border-zinc-100 rounded-[1.5rem] outline-none focus:border-primary/20 transition-all font-medium text-primary shadow-inner"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={commenting}
                                />
                                <div className="flex justify-end">
                                    <button
                                        disabled={commenting || !newComment.trim()}
                                        type="submit"
                                        className="px-8 py-4 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {commenting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                        Post Comment
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 pt-4">
                        {comments.length === 0 ? (
                            <div className="text-center py-16 bg-zinc-100/30 rounded-[3rem] border-2 border-dashed border-zinc-100">
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No responses yet. Be the first!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-white p-8 rounded-[2rem] border border-zinc-50 shadow-sm flex gap-6">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-100 flex items-center justify-center font-black text-primary shadow-sm h-fit">
                                        {comment.profiles.image_url ? (
                                            <img src={comment.profiles.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            comment.profiles.full_name?.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-black text-primary text-sm">{comment.profiles.full_name}</h4>
                                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 font-medium text-sm leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
