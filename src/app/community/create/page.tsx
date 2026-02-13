"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    ChevronLeft,
    Loader2,
    AlertCircle,
    FileText,
    Tag,
    Send,
    MessageSquare
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CreatePostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "General",
        content: "",
    });

    const categories = ["General", "Academic", "Freelancing", "Events", "Market Talk"];

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login?redirect=/community/create");
            }
        };
        checkSession();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.content.length < 10) {
            setError("Content must be at least 10 characters long.");
            setLoading(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error("You must be logged in to post.");
            }

            const { error: insertError } = await supabase
                .from("community_posts")
                .insert([
                    {
                        user_id: session.user.id,
                        title: formData.title,
                        category: formData.category,
                        content: formData.content,
                    },
                ]);

            if (insertError) throw insertError;

            router.push("/community");
        } catch (err) {
            console.error("Error creating post:", err);
            setError("Failed to create post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full text-zinc-900">
                    <Link
                        href="/community"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold mb-8 transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Community
                    </Link>

                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-border-soft">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                                <MessageSquare size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-primary mb-2 tracking-tight">Start a Discussion</h1>
                            <p className="text-zinc-500 font-medium tracking-tight">Share your thoughts with the campus community</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-3">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Post Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <Tag size={16} /> Discussion Title
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="What's on your mind?"
                                    className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <FileText size={16} /> Category
                                </label>
                                <select
                                    required
                                    className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium appearance-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <FileText size={16} /> Content
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    placeholder="Write your discussion points here..."
                                    className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium resize-none"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest ml-1">
                                    Keep it respectful and campus-related.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:bg-green-900 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>Post Discussion <Send size={20} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
