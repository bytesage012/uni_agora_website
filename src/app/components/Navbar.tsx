"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, LogOut, LayoutDashboard, ShoppingBag, Menu, X, User as UserIcon, MessageSquare, Search, Users, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    // Active Link Helper
    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        // Check initial session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Initialize notifications if user exists
        const initNotifications = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fetch unread notifications
                const { data: notifs, error: notifError } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (!notifError && notifs) {
                    setNotifications(notifs);
                    setUnreadCount(notifs.filter(n => !n.is_read).length);
                }

                // Real-time subscription for notifications
                const channel = supabase
                    .channel(`user-notifs-${session.user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: `user_id=eq.${session.user.id}`
                        },
                        (payload) => {
                            setNotifications(prev => [payload.new, ...prev].slice(0, 5));
                            setUnreadCount(c => c + 1);
                        }
                    )
                    .subscribe();

                return channel;
            }
            return null;
        };

        let notificationChannel: any = null;
        initNotifications().then(channel => {
            notificationChannel = channel;
        });

        return () => {
            subscription.unsubscribe();
            if (notificationChannel) supabase.removeChannel(notificationChannel);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        setMobileMenuOpen(false);
    };

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);

            if (!error) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);

            if (!error) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    const handleNotificationClick = async (notif: any) => {
        setShowNotifications(false);
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }
        if (notif.link) {
            router.push(notif.link);
        }
    };

    return (
        <nav className="sticky top-0 w-full bg-white/70 backdrop-blur-md z-[50] border-b border-white/20 shadow-sm transition-all duration-300">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-2xl font-black text-primary tracking-tighter italic">UniAGORA</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-sm font-bold">
                    <Link
                        href="/marketplace"
                        className={`transition-colors flex items-center gap-1.5 ${isActive('/marketplace') ? 'text-primary' : 'text-zinc-500 hover:text-primary'}`}
                    >
                        <ShoppingBag size={16} /> Marketplace
                    </Link>
                    <Link
                        href="/community"
                        className={`transition-colors flex items-center gap-1.5 ${isActive('/community') ? 'text-primary' : 'text-zinc-500 hover:text-primary'}`}
                    >
                        <Users size={16} /> Community
                    </Link>

                    {user && (
                        <div className="relative ml-2">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-zinc-500 hover:text-primary transition-colors hover:bg-zinc-100 rounded-xl"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border border-border-soft shadow-2xl py-4 z-50 overflow-hidden">
                                    <div className="px-6 pb-4 border-b border-zinc-50 flex items-center justify-between">
                                        <h4 className="text-sm font-black text-primary uppercase tracking-widest">Notifications</h4>
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-[10px] font-bold text-zinc-400 hover:text-primary uppercase"
                                        >
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-8 py-10 text-center">
                                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <button
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`w-full text-left block px-6 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 ${!notif.is_read ? 'bg-primary/[0.02]' : ''}`}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.is_read ? 'bg-accent' : 'bg-transparent'}`}></div>
                                                        <div>
                                                            <p className="text-xs font-black text-primary mb-0.5">{notif.title}</p>
                                                            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed line-clamp-2">{notif.content}</p>
                                                            <p className="text-[9px] text-zinc-300 font-bold mt-1 uppercase tracking-tighter">
                                                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                    <div className="px-6 pt-4 border-t border-zinc-50 text-center">
                                        <Link
                                            href="/notifications"
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline inline-block pb-2"
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            View All Notifications
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <Link
                        href="/about"
                        className={`transition-colors ${isActive('/about') ? 'text-primary' : 'text-zinc-500 hover:text-primary'}`}
                    >
                        About Us
                    </Link>
                    <Link
                        href="/contact"
                        className={`transition-colors ${isActive('/contact') ? 'text-primary' : 'text-zinc-500 hover:text-primary'}`}
                    >
                        Support
                    </Link>

                    <div className="h-6 w-[1px] bg-zinc-200"></div>

                    {loading ? (
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-9 bg-zinc-100 animate-pulse rounded-xl"></div>
                            <div className="w-24 h-9 bg-zinc-100 animate-pulse rounded-xl"></div>
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-6">
                            {user.email === 'bytesage013@gmail.com' && (
                                <Link
                                    href="/admin"
                                    className={`flex items-center gap-2 transition-colors ${isActive('/admin') ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'}`}
                                >
                                    <ShieldCheck size={18} /> Admin
                                </Link>
                            )}
                            <Link
                                href="/messages"
                                className={`flex items-center gap-2 transition-colors ${isActive('/messages') ? 'text-accent' : 'text-primary hover:text-accent'}`}
                            >
                                <MessageSquare size={18} /> Messages
                            </Link>
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-2 transition-colors ${isActive('/dashboard') ? 'text-accent' : 'text-primary hover:text-accent'}`}
                            >
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <Link
                                href="/profile"
                                className={`flex items-center gap-2 transition-colors ${isActive('/profile') ? 'text-accent' : 'text-primary hover:text-accent'}`}
                            >
                                <UserIcon size={18} /> Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-zinc-400 hover:text-red-500 transition-all flex items-center gap-2 font-bold group"
                                title="Logout"
                            >
                                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                                <span className="hidden lg:inline text-xs uppercase tracking-widest">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-zinc-500 hover:text-primary transition-colors">Login</Link>
                            <Link href="/signup" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-green-900 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                Join Now
                            </Link>
                        </div>
                    )}

                    {/* Marketplace Search Toggle - Desktop */}
                    {pathname === '/marketplace' && (
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                if (params.get('f') === 'off') params.delete('f');
                                else params.set('f', 'off');
                                router.push(`/marketplace?${params.toString()}`, { scroll: false });
                            }}
                            className="p-2.5 bg-zinc-50 text-primary rounded-xl hover:bg-zinc-100 border border-zinc-100 transition-all active:scale-90 flex items-center gap-2"
                            title="Toggle Search & Filters"
                        >
                            <Search size={18} className="text-[#004d00]" />
                            <span className="hidden lg:inline text-xs font-black uppercase tracking-tight">Filters</span>
                        </button>
                    )}
                </div>

                {/* Mobile Toggle & Actions */}
                <div className="flex items-center gap-2 md:hidden">
                    {pathname === '/marketplace' && (
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                if (params.get('f') === 'off') params.delete('f');
                                else params.set('f', 'off');
                                router.push(`/marketplace?${params.toString()}`, { scroll: false });
                            }}
                            className="p-2 bg-zinc-50 text-primary rounded-lg border border-zinc-100 active:scale-90"
                        >
                            <Search size={20} className="text-[#004d00]" />
                        </button>
                    )}
                    <button
                        className="text-primary p-2 bg-zinc-50 rounded-lg"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {
                mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-border-soft shadow-2xl py-8 px-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-200">
                        <Link href="/marketplace" className="text-lg font-black text-primary flex items-center gap-3 active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>
                            <ShoppingBag size={20} /> Marketplace
                        </Link>
                        <Link href="/community" className="text-lg font-black text-primary flex items-center gap-3 active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>
                            <Users size={20} /> Community
                        </Link>
                        <Link href="/about" className="text-lg font-black text-primary active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                        <Link href="/contact" className="text-lg font-black text-primary active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>Support</Link>

                        <hr className="border-zinc-100" />

                        {user ? (
                            <>
                                {user.email === 'bytesage013@gmail.com' && (
                                    <Link href="/admin" className="text-lg font-black text-red-600 flex items-center gap-3 active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>
                                        <ShieldCheck size={20} /> Admin Panel
                                    </Link>
                                )}
                                <Link href="/messages" className="flex items-center gap-3 text-lg font-black text-primary active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>
                                    <MessageSquare size={20} /> My Messages
                                </Link>
                                <Link href="/dashboard" className="flex items-center gap-3 text-lg font-black text-primary active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>
                                    <LayoutDashboard size={20} /> My Dashboard
                                </Link>
                                <Link href="/profile" className="text-lg font-black text-primary active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-4 bg-zinc-100 text-zinc-600 font-black rounded-2xl flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform"
                                >
                                    <LogOut size={20} /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4 pt-4">
                                <Link href="/login" className="w-full py-4 bg-zinc-50 text-primary font-black rounded-2xl text-center active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link href="/signup" className="w-full py-4 bg-primary text-white font-black rounded-2xl text-center shadow-lg active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(false)}>
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>
                )
            }
        </nav >
    );
}
