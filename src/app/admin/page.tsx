"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Users,
    ShoppingBag,
    MessageSquare,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    Clock,
    Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const ADMIN_EMAIL = "bytesage013@gmail.com";

export default function AdminHub() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingVerifications: 0,
        totalServices: 0,
        totalForumPosts: 0
    });

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || session.user.email !== ADMIN_EMAIL) {
                setError("Restricted Access: Admin privileges required.");
                setLoading(false);
                return;
            }

            // Fetch platform stats
            try {
                const [
                    { count: userCount },
                    { count: pendingCount },
                    { count: serviceCount },
                    { count: forumCount }
                ] = await Promise.all([
                    supabase.from("profiles").select("*", { count: "exact", head: true }),
                    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
                    supabase.from("services").select("*", { count: "exact", head: true }),
                    supabase.from("community_posts").select("*", { count: "exact", head: true })
                ]);

                setStats({
                    totalUsers: userCount || 0,
                    pendingVerifications: pendingCount || 0,
                    totalServices: serviceCount || 0,
                    totalForumPosts: forumCount || 0
                });
            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [router]);

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

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                    <AlertCircle className="text-red-500 mb-4" size={64} />
                    <h1 className="text-2xl font-black text-primary mb-2">Access Denied</h1>
                    <p className="text-zinc-500 mb-8 max-w-md">{error}</p>
                    <Link href="/dashboard" className="px-8 py-4 bg-primary text-white font-black rounded-xl">
                        Return to Dashboard
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const adminCards = [
        {
            title: "User Management",
            desc: "Verify students and manage permissions",
            icon: <Users size={24} />,
            link: "/admin/users",
            color: "blue",
            stats: `${stats.totalUsers} registered`
        },
        {
            title: "Service Moderation",
            desc: "Review and feature marketplace services",
            icon: <ShoppingBag size={24} />,
            link: "/admin/services",
            color: "emerald",
            stats: `${stats.totalServices} listings`
        },
        {
            title: "Forum Content",
            desc: "Moderate posts and community discussions",
            icon: <MessageSquare size={24} />,
            link: "/admin/forum",
            color: "purple",
            stats: `${stats.totalForumPosts} topics`
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-primary tracking-tight">Admin Hub</h1>
                    </div>
                    <p className="text-zinc-500 font-medium">Platform-wide overview and management</p>
                </header>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-3xl border border-border-soft shadow-sm">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Scale</p>
                        <h3 className="text-3xl font-black text-primary">{stats.totalUsers}</h3>
                        <p className="text-xs font-bold text-zinc-500 mt-1">Active Profiles</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-border-soft shadow-sm border-l-4 border-l-amber-400">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Attention Needed</p>
                        <h3 className="text-3xl font-black text-primary">{stats.pendingVerifications}</h3>
                        <p className="text-xs font-bold text-amber-600 mt-1">Pending Verifications</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-border-soft shadow-sm">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Marketplace</p>
                        <h3 className="text-3xl font-black text-primary">{stats.totalServices}</h3>
                        <p className="text-xs font-bold text-zinc-500 mt-1">Live Services</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-border-soft shadow-sm">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Engagement</p>
                        <h3 className="text-3xl font-black text-primary">{stats.totalForumPosts}</h3>
                        <p className="text-xs font-bold text-zinc-500 mt-1">Community Posts</p>
                    </div>
                </div>

                {/* Management Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {adminCards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.link}
                            className="group bg-white p-8 rounded-[2.5rem] border border-border-soft shadow-sm hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 bg-zinc-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-black text-primary mb-2">{card.title}</h3>
                            <p className="text-zinc-500 text-sm font-medium mb-6 leading-relaxed">{card.desc}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{card.stats}</span>
                                <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* System Health / Recent Alerts Placeholder */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-border-soft shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-primary">System Status: Operational</h3>
                            <p className="text-zinc-500 text-sm font-medium">All database connections and API routes are healthy.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-zinc-300 uppercase tracking-[0.2em]">
                        <Clock size={14} />
                        Last Refreshed: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
