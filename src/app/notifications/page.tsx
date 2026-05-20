"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    MessageSquare,
    Users,
    ChevronRight,
    Trash2,
    Loader2,
    ArrowLeft,
    Clock,
    X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        try {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Notification removed.");
        } catch (err) {
            toast.error("Failed to delete notification.");
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
                <header className="mb-12">
                    <Button variant="ghost" asChild className="mb-6 font-bold text-zinc-400 hover:text-primary gap-2 p-0 h-auto hover:bg-transparent">
                        <Link href="/dashboard">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black text-primary tracking-tight flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Bell size={32} className="text-primary" />
                                </div>
                                Notifications
                            </h1>
                            <p className="text-zinc-500 font-medium text-lg">Stay updated with your latest interactions</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <Card className="rounded-[3rem] p-24 border-dashed border-2 border-zinc-200 bg-white/50 text-center flex flex-col items-center">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 text-zinc-200">
                                <Bell size={48} />
                            </div>
                            <CardTitle className="text-3xl font-black text-primary mb-3">No notifications yet</CardTitle>
                            <CardDescription className="text-zinc-500 mb-10 max-w-sm font-medium text-lg leading-relaxed">
                                We&apos;ll alert you here when someone messages you or interacts with your activity.
                            </CardDescription>
                            <Button asChild className="h-14 px-10 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30">
                                <Link href="/marketplace">Explore Marketplace</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notif) => (
                                <Card
                                    key={notif.id}
                                    className={`group rounded-[2.5rem] border-none transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex items-center gap-6 p-8 relative overflow-hidden ${!notif.is_read ? 'bg-white shadow-md ring-2 ring-primary/5 border-primary/20' : 'bg-white/70 shadow-sm opacity-80'}`}
                                >
                                    {!notif.is_read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                                    )}
                                    
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                                        notif.type === 'message' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                                        notif.type === 'reply' ? 'bg-purple-50 text-purple-500 border-purple-100' :
                                        'bg-zinc-50 text-zinc-400 border-zinc-100'
                                    }`}>
                                        {notif.type === 'message' ? <MessageSquare size={28} /> :
                                            notif.type === 'reply' ? <Users size={28} /> :
                                                <Bell size={28} />}
                                    </div>

                                    <div className="flex-grow cursor-pointer group-hover:translate-x-1 transition-transform duration-300" onClick={() => handleNotificationClick(notif)}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-xl font-black text-primary leading-none">{notif.title}</h4>
                                            {!notif.is_read && (
                                                <Badge className="h-2 w-2 p-0 rounded-full bg-accent animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-zinc-500 font-medium text-lg leading-relaxed mb-4">{notif.content}</p>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 w-fit px-3 py-1 rounded-lg">
                                            <Clock size={12} className="text-primary" /> 
                                            {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteNotification(notif.id)}
                                            className="h-12 w-12 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </Button>
                                        {notif.link && (
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => handleNotificationClick(notif)}
                                                className="h-12 w-12 rounded-xl bg-zinc-100 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                title="View"
                                            >
                                                <ChevronRight size={22} />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
