"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    Search,
    Loader2,
    AlertCircle,
    User,
    ArrowLeft,
    Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

interface Conversation {
    id: string;
    updated_at: string;
    last_message?: string;
    unread_count: number;
    other_participant: {
        id: string;
        full_name: string;
        image_url?: string;
    };
}

export default function InboxPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchInbox = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/login");
                    return;
                }
                setCurrentUser(session.user);

                // This is a simplified fetch. In a real app, you'd use a view or complex join.
                // We'll fetch participants first to find conversations the user is in.
                const { data: participants, error: partError } = await supabase
                    .from("conversation_participants")
                    .select("conversation_id")
                    .eq("user_id", session.user.id);

                if (partError) throw partError;

                const convIds = (participants || []).map(p => p.conversation_id);
                if (convIds.length === 0) {
                    setConversations([]);
                    return;
                }

                // Fetch other participants for these conversations
                const { data: others, error: othersError } = await supabase
                    .from("conversation_participants")
                    .select(`
                        conversation_id,
                        profiles (
                            id,
                            full_name,
                            image_url
                        )
                    `)
                    .in("conversation_id", convIds)
                    .neq("user_id", session.user.id);

                if (othersError) throw othersError;

                // Fetch last messages and unread status (simplified)
                const convs = await Promise.all(others.map(async (o) => {
                    const { data: lastMsg } = await supabase
                        .from("messages")
                        .select("text, created_at")
                        .eq("conversation_id", o.conversation_id)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .single();

                    return {
                        id: o.conversation_id,
                        updated_at: lastMsg?.created_at || new Date().toISOString(),
                        last_message: lastMsg?.text || "Started a conversation",
                        unread_count: 0, // In a real app, query unread count
                        other_participant: Array.isArray(o.profiles) ? o.profiles[0] : o.profiles
                    } as Conversation;
                }));

                setConversations(convs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));

            } catch (err) {
                console.error("Error fetching inbox:", err);
                setError("Failed to load your messages.");
            } finally {
                setLoading(false);
            }
        };

        fetchInbox();
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <MessageSquare size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-primary tracking-tight">Messages</h1>
                    </div>
                    <p className="text-zinc-500 font-medium font-sans">Real-time chats with campus freelancers</p>
                </header>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={48} />
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Loading Inbox...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex items-center gap-4">
                        <AlertCircle className="text-red-500" size={32} />
                        <p className="font-bold text-red-600">{error}</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-16 border border-border-soft shadow-sm text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-zinc-50 text-zinc-200 rounded-3xl flex items-center justify-center mb-6">
                            <MessageSquare size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-primary mb-2">No messages yet</h2>
                        <p className="text-zinc-500 mb-8 max-w-sm">When you contact a merchant or someone messages you, it will appear here.</p>
                        <Link href="/marketplace" className="px-8 py-4 bg-primary text-white font-black rounded-xl hover:scale-105 transition-all">
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-sm overflow-hidden divide-y divide-zinc-50">
                        {conversations.map((conv) => (
                            <Link
                                key={conv.id}
                                href={`/messages/${conv.id}`}
                                className="flex items-center gap-6 p-8 hover:bg-zinc-50 transition-all group"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                                        {conv.other_participant.image_url ? (
                                            <img src={conv.other_participant.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-black">{conv.other_participant.full_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                            {conv.unread_count}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-black text-primary truncate">
                                            {conv.other_participant.full_name}
                                        </h3>
                                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest whitespace-nowrap">
                                            {new Date(conv.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 font-medium truncate pr-8">
                                        {conv.last_message}
                                    </p>
                                </div>
                                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                                        <ArrowLeft size={18} className="rotate-180" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
