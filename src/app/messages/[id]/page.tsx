"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
    Send,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
    id: string;
    sender_id: string;
    text: string;
    created_at: string;
}

interface Participant {
    id: string;
    full_name: string;
    image_url?: string;
    verification_status: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const setupChat = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setCurrentUser(session.user);

            const fetchMessages = async () => {
                try {
                    const { data: { session: currentSession } } = await supabase.auth.getSession();
                    if (!currentSession) return;

                    const response = await fetch(`/api/messages?conversation_id=${resolvedParams.id}`, {
                        headers: {
                            'Authorization': `Bearer ${currentSession.access_token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to fetch messages');
                    const { data } = await response.json();

                    if (data) {
                        setMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const uniqueNewMessages = data.filter((m: Message) => !existingIds.has(m.id));
                            if (uniqueNewMessages.length === 0) return prev;

                            return [...prev, ...uniqueNewMessages].sort((a, b) =>
                                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            );
                        });
                    }
                } catch (err) {
                    console.error("Error polling messages:", err);
                }
            };

            await fetchMessages();
            setLoading(false);
            intervalId = setInterval(fetchMessages, 3000);

            const { data: participants } = await supabase
                .from("conversation_participants")
                .select("profiles(*)")
                .eq("conversation_id", resolvedParams.id)
                .neq("user_id", session.user.id)
                .single();

            if (participants?.profiles) {
                setOtherParticipant(Array.isArray(participants.profiles) ? participants.profiles[0] : participants.profiles);
            }
        };

        setupChat();

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [resolvedParams.id, router]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || sending) return;

        setSending(true);
        const text = newMessage;
        setNewMessage("");

        const tempId = Math.random().toString();
        const optimisticMsg: Message = {
            id: tempId,
            sender_id: currentUser.id,
            text: text,
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) throw new Error("No active session");

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentSession.access_token}`
                },
                body: JSON.stringify({
                    conversation_id: resolvedParams.id,
                    sender_id: currentUser.id,
                    text: text,
                }),
            });

            if (!response.ok) throw new Error('Failed to send message');

            const { data } = await response.json();

            if (data) {
                setMessages(prev => prev.map(m => m.id === tempId ? data : m));
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast.error("Message failed to send.");
            setNewMessage(text);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans overflow-hidden h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col overflow-hidden relative">
                {/* Chat Header */}
                <header className="bg-white/90 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-sm z-20">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl text-zinc-400">
                            <Link href="/messages">
                                <ArrowLeft size={20} />
                            </Link>
                        </Button>
                        {otherParticipant && (
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm bg-primary/5">
                                    <AvatarImage src={otherParticipant.image_url} className="object-cover" />
                                    <AvatarFallback className="text-primary font-black">
                                        {otherParticipant.full_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-black text-primary leading-none mb-1 flex items-center gap-1.5 text-lg">
                                        {otherParticipant.full_name}
                                        {otherParticipant.verification_status === 'verified' && (
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        )}
                                    </h2>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active Now</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Messages Area */}
                <ScrollArea className="flex-grow p-4 md:p-8 bg-zinc-50/30">
                    <div className="max-w-3xl mx-auto space-y-6 py-4">
                        {messages.length === 0 && (
                            <div className="py-20 text-center">
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest bg-white border-zinc-100 text-zinc-400">
                                    Your conversation starts here
                                </Badge>
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUser?.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] md:max-w-[65%] px-6 py-4 rounded-[1.5rem] shadow-sm text-sm font-medium leading-relaxed
                                            ${isMe
                                                ? 'bg-primary text-white rounded-tr-none shadow-primary/10'
                                                : 'bg-white text-primary border border-zinc-100 rounded-tl-none shadow-zinc-200/50'}`}
                                    >
                                        {msg.text}
                                        <div className={`mt-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter
                                            ${isMe ? 'text-white/60' : 'text-zinc-400'}`}>
                                            <Clock size={10} />
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="bg-white p-6 md:p-8 border-t z-20">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                            <Input
                                className="flex-grow h-16 px-8 bg-zinc-50 border-zinc-100 rounded-[2rem] outline-none focus-visible:ring-primary/20 font-medium text-primary shadow-inner text-lg"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={sending}
                            />
                            <Button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="h-16 w-16 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all p-0"
                            >
                                {sending ? (
                                    <Loader2 className="animate-spin" size={28} />
                                ) : (
                                    <Send size={28} />
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
