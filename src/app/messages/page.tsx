"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    MessageCircle,
    Loader2,
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

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


    useEffect(() => {
        const fetchInbox = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/login");
                    return;
                }


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
                        unread_count: 0,
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

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
                <Navbar />
                <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-12">
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-48 rounded-2xl mb-8" />
                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-6 animate-pulse">
                                    <Skeleton className="h-16 w-16 rounded-2xl" />
                                    <div className="flex-grow space-y-3">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <Skeleton className="h-4 w-64" />
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                            <MessageSquare size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-primary tracking-tight">Messages</h1>
                    </div>
                    <p className="text-zinc-500 font-medium text-lg">Real-time chats with campus freelancers</p>
                </header>

                {error ? (
                    <Alert variant="destructive" className="rounded-[2rem] p-8 border-none bg-red-50 text-red-700">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <AlertDescription className="font-bold text-lg ml-2">{error}</AlertDescription>
                    </Alert>
                ) : conversations.length === 0 ? (
                    <Card className="py-32 px-6 rounded-[3rem] border-none shadow-sm flex flex-col items-center text-center bg-white">
                        <div className="w-24 h-24 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-300 mb-8 shadow-inner">
                            <MessageCircle size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-primary tracking-tight mb-4">No conversations yet</h3>
                        <p className="text-zinc-500 font-medium mb-8 max-w-sm">
                            Connect with freelancers or clients on the marketplace to start chatting.
                        </p>
                        <Button asChild className="h-14 px-8 rounded-2xl font-bold bg-primary hover:bg-primary-hover text-white">
                            <Link href="/marketplace">Browse Marketplace</Link>
                        </Button>
                    </Card>
                ) : (
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                        <ScrollArea className="h-[600px]">
                            <div className="divide-y divide-zinc-50">
                                {conversations.map((conv) => (
                                    <Link
                                        key={conv.id}
                                        href={`/messages/${conv.id}`}
                                        className="flex items-center gap-6 p-8 hover:bg-zinc-50 transition-all group"
                                    >
                                        <div className="relative">
                                            <Avatar className="h-16 w-16 rounded-2xl border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                                                <AvatarImage src={conv.other_participant.image_url} className="object-cover" />
                                                <AvatarFallback className="bg-primary/5 text-primary font-black text-2xl">
                                                    {conv.other_participant.full_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {conv.unread_count > 0 && (
                                                <Badge className="absolute -top-1 -right-1 h-6 min-w-[24px] rounded-full bg-accent text-white border-2 border-white flex items-center justify-center font-black animate-bounce px-1">
                                                    {conv.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-xl font-black text-primary truncate">
                                                    {conv.other_participant.full_name}
                                                </h3>
                                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest whitespace-nowrap">
                                                    {new Date(conv.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-zinc-500 font-medium truncate pr-8 text-sm">
                                                {conv.last_message}
                                            </p>
                                        </div>
                                        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                            <Button size="icon" variant="ghost" className="h-10 w-10 bg-primary/5 text-primary rounded-xl">
                                                <ArrowRight size={20} />
                                            </Button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                )}
            </main>
            <Footer />
        </div>
    );
}
