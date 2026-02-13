"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    MessageSquare,
    Users,
    ChevronRight,
    Trash2,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function NotificationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchAllNotifications = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setUser(session.user);

            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false });

            if (!error) {
                setNotifications(data || []);
            }
            setLoading(false);
        };

        fetchAllNotifications();
    }, [router]);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id);

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const handleNotificationClick = async (notif: any) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }
        if (notif.link) {
            router.push(notif.link);
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

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary font-bold mb-4 transition-colors">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
                            <Bell className="text-accent" /> Activity Center
                        </h1>
                        <p className="text-zinc-500 font-medium mt-1">Stay updated with your latest interactions</p>
                    </div>
                </header>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] border border-dashed border-zinc-200 text-center shadow-sm">
                            <Bell size={48} className="mx-auto text-zinc-100 mb-6" />
                            <h3 className="text-xl font-black text-primary mb-2">No notifications yet</h3>
                            <p className="text-zinc-400 font-medium mb-8">We'll alert you here when someone messages you or replies to your post.</p>
                            <Link href="/marketplace" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20">
                                Explore Marketplace
                            </Link>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`group bg-white p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:border-primary/10 flex items-center gap-6 ${!notif.is_read ? 'border-primary/20 shadow-md ring-1 ring-primary/5' : 'border-border-soft'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${notif.type === 'message' ? 'bg-blue-50 text-blue-500' :
                                        notif.type === 'reply' ? 'bg-purple-50 text-purple-500' :
                                            'bg-zinc-50 text-zinc-400'
                                    }`}>
                                    {notif.type === 'message' ? <MessageSquare size={24} /> :
                                        notif.type === 'reply' ? <Users size={24} /> :
                                            <Bell size={24} />}
                                </div>

                                <div className="flex-grow cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-primary">{notif.title}</h4>
                                        {!notif.is_read && <span className="w-2 h-2 bg-accent rounded-full"></span>}
                                    </div>
                                    <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-2">{notif.content}</p>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(notif.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => deleteNotification(notif.id)}
                                        className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    {notif.link && (
                                        <button
                                            onClick={() => handleNotificationClick(notif)}
                                            className="p-3 text-zinc-300 hover:text-primary hover:bg-zinc-50 rounded-xl transition-all"
                                            title="View"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
