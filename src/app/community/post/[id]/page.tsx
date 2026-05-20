"use client";

import { useEffect, useState, use } from "react";
import {
    ChevronLeft,
    MessageCircle,
    Send,
    Clock,
    Loader2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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
    upvotes?: number;
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
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commenting, setCommenting] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<unknown>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setCurrentUser(session?.user ?? null);

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
        if (!currentUser) {
            toast.error("Please login to comment.");
            return;
        }
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
            toast.success("Comment posted!");
        } catch (err) {
            console.error("Error posting comment:", err);
            toast.error("Failed to post comment.");
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
            <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
                <Navbar />
                <div className="flex-grow flex items-center justify-center px-4">
                    <Card className="max-w-md w-full p-12 rounded-[2.5rem] shadow-sm text-center border-none">
                        <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
                        <CardTitle className="text-2xl font-black text-primary mb-4">Discussion Missing</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium mb-8">{error || "This conversation may have been removed."}</CardDescription>
                        <Button asChild className="h-12 px-8 rounded-2xl shadow-lg">
                            <Link href="/community">
                                <ChevronLeft size={20} className="mr-2" /> Back to Community
                            </Link>
                        </Button>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <Button variant="ghost" asChild className="mb-8 font-bold text-zinc-500 hover:text-primary gap-2">
                    <Link href="/community">
                        <ChevronLeft size={20} /> Back to Forum
                    </Link>
                </Button>

                <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white mb-12">
                    <CardHeader className="p-8 md:p-12 pb-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-sm bg-zinc-50">
                                    <AvatarImage src={post.profiles.image_url} className="object-cover" />
                                    <AvatarFallback className="text-primary font-black text-xl">
                                        {post.profiles.full_name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-black text-primary text-lg flex items-center gap-2">
                                        {post.profiles.full_name}
                                        {post.profiles.verification_status === 'verified' && (
                                            <CheckCircle2 size={16} className="text-primary" />
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                        <Clock size={12} className="text-primary" />
                                        {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none">
                                {post.category}
                            </Badge>
                        </div>
                        <CardTitle className="text-3xl md:text-4xl font-black text-primary leading-tight tracking-tight">
                            {post.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 md:p-12 pt-0">
                        <p className="text-zinc-600 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </CardContent>
                </Card>

                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <MessageCircle className="text-primary h-6 w-6" />
                        <h2 className="text-2xl font-black text-primary">
                            Responses
                            <span className="text-zinc-300 font-bold ml-2">({comments.length})</span>
                        </h2>
                    </div>

                    <Card className="rounded-[2.5rem] p-8 md:p-10 border-none shadow-sm bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                        {!currentUser ? (
                            <div className="text-center py-10">
                                <p className="text-zinc-500 font-black text-sm uppercase tracking-widest mb-6">Join the conversation</p>
                                <Button asChild className="h-12 px-10 rounded-xl font-black shadow-lg">
                                    <Link href="/login">Login to Comment</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleCommentSubmit} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary border-none">
                                        <AvatarFallback className="font-black text-[10px]">
                                            {currentUser.email?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Posting as {currentUser.email?.split('@')[0]}</span>
                                </div>
                                <Textarea
                                    required
                                    rows={4}
                                    placeholder="Share your thoughts..."
                                    className="w-full p-6 bg-zinc-50 border-zinc-100 rounded-[1.5rem] outline-none focus-visible:ring-primary/20 transition-all font-medium text-primary shadow-inner text-lg resize-none"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={commenting}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        disabled={commenting || !newComment.trim()}
                                        type="submit"
                                        className="h-14 px-10 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-2"
                                    >
                                        {commenting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                        Post Comment
                                    </Button>
                                </div>
                            </form>
                        )}
                    </Card>

                    <div className="space-y-6 pt-4">
                        {comments.length === 0 ? (
                            <div className="text-center py-20 bg-zinc-50 rounded-[3rem] border-dashed border-2 border-zinc-100">
                                <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px]">Be the first to respond</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <Card key={comment.id} className="rounded-[2rem] border-none shadow-sm bg-white p-8 flex gap-6 hover:shadow-md transition-shadow">
                                    <Avatar className="h-12 w-12 rounded-xl border bg-zinc-50 shrink-0">
                                        <AvatarImage src={comment.profiles.image_url} className="object-cover" />
                                        <AvatarFallback className="text-primary font-black">
                                            {comment.profiles.full_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-black text-primary text-sm leading-none">{comment.profiles.full_name}</h4>
                                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 font-medium text-sm leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
