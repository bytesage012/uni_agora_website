"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
    Send,
    ArrowLeft,
    Loader2,
    User,
    CheckCircle2,
    Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

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
    const [currentUser, setCurrentUser] = useState<any>(null);
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

            // Fetch initial messages using API
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
                            // Merge new messages, avoiding duplicates
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

            // Initial fetch
            await fetchMessages();

            // First fetch complete
            setLoading(false);

            // Start polling every 3 seconds
            intervalId = setInterval(fetchMessages, 3000);

            // Fetch other participant
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

        // Optimistic ID for the temporary message
        const tempId = Math.random().toString();
        const optimisticMsg: Message = {
            id: tempId,
            sender_id: currentUser.id,
            text: text,
            created_at: new Date().toISOString(),
        };

        // Add optimistically
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) throw new Error("No active session");

            // Use Next.js API for sending
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

            // Replace optimistic message with real one from DB
            if (data) {
                setMessages(prev => prev.map(m => m.id === tempId ? data : m));
            }
        } catch (err) {
            console.error("Error sending message:", err);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Message failed to send. Please check your connection.");
            setNewMessage(text);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <main className="flex-grow flex flex-col h-screen overflow-hidden">
                {/* Chat Header */}
                <header className="bg-white border-b border-border-soft px-8 py-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/messages" className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
                            <ArrowLeft size={20} className="text-zinc-400" />
                        </Link>
                        {otherParticipant && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl overflow-hidden border border-zinc-50">
                                    {otherParticipant.image_url ? (
                                        <img src={otherParticipant.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black">
                                            {otherParticipant.full_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-black text-primary leading-none mb-1 flex items-center gap-1.5">
                                        {otherParticipant.full_name}
                                        {otherParticipant.verification_status === 'verified' && (
                                            <CheckCircle2 size={14} className="text-primary" />
                                        )}
                                    </h2>
                                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active Now</p>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-4 bg-zinc-50/50">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Your conversation starts here</p>
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUser?.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] md:max-w-[60%] px-6 py-3 rounded-2xl shadow-sm text-sm font-medium
                                            ${isMe
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white text-primary border border-white rounded-tl-none'}`}
                                    >
                                        {msg.text}
                                        <div className={`mt-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter
                                            ${isMe ? 'text-white/50' : 'text-zinc-300'}`}>
                                            <Clock size={10} />
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white p-4 md:p-8 border-t border-border-soft">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                            <input
                                type="text"
                                className="flex-grow p-6 bg-zinc-50 border border-zinc-100 rounded-[1.5rem] outline-none focus:border-primary/20 transition-all font-medium text-primary shadow-inner"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                            >
                                {sending ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <Send size={24} />
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
