"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Users,
    ShoppingBag,
    MessageSquare,
    Mail,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    Loader2,
    BarChart3
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ADMIN_EMAIL = "bytesage013@gmail.com";

export default function AdminHub() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingVerifications: 0,
        totalServices: 0,
        totalForumPosts: 0,
        totalContactSubmissions: 0
    });

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || session.user.email !== ADMIN_EMAIL) {
                setError("Restricted Access: Admin privileges required.");
                setLoading(false);
                return;
            }

            try {
                const [
                    { count: userCount },
                    { count: pendingCount },
                    { count: serviceCount },
                    { count: forumCount },
                    { count: contactCount }
                ] = await Promise.all([
                    supabase.from("profiles").select("*", { count: "exact", head: true }),
                    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
                    supabase.from("services").select("*", { count: "exact", head: true }),
                    supabase.from("community_posts").select("*", { count: "exact", head: true }),
                    supabase.from("contact_submissions").select("*", { count: "exact", head: true })
                ]);

                setStats({
                    totalUsers: userCount || 0,
                    pendingVerifications: pendingCount || 0,
                    totalServices: serviceCount || 0,
                    totalForumPosts: forumCount || 0,
                    totalContactSubmissions: contactCount || 0
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
            <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
                    <Card className="p-12 rounded-[3rem] border-none shadow-2xl bg-white">
                        <AlertCircle className="text-red-500 mx-auto mb-8" size={72} />
                        <CardTitle className="text-3xl font-black text-primary mb-4">Access Denied</CardTitle>
                        <CardDescription className="text-zinc-500 text-lg font-medium mb-10 leading-relaxed">
                            {error}
                        </CardDescription>
                        <Button asChild className="h-14 px-10 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20">
                            <Link href="/dashboard">Return to Dashboard</Link>
                        </Button>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    const adminCards = [
        {
            title: "User Management",
            desc: "Verify student IDs and manage permissions",
            icon: <Users size={28} />,
            link: "/admin/users",
            stats: `${stats.totalUsers} profiles`,
            color: "text-blue-600 bg-blue-50"
        },
        {
            title: "Service Moderation",
            desc: "Review and feature marketplace listings",
            icon: <ShoppingBag size={28} />,
            link: "/admin/services",
            stats: `${stats.totalServices} items`,
            color: "text-emerald-600 bg-emerald-50"
        },
        {
            title: "Forum Moderation",
            desc: "Monitor community posts and comments",
            icon: <MessageSquare size={28} />,
            link: "/admin/forum",
            stats: `${stats.totalForumPosts} topics`,
            color: "text-purple-600 bg-purple-50"
        },
        {
            title: "Support Inquiries",
            desc: "Review feedback and help requests",
            icon: <Mail size={28} />,
            link: "/admin/contact",
            stats: `${stats.totalContactSubmissions} new`,
            color: "text-amber-600 bg-amber-50"
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary/20">
                                <ShieldCheck size={32} />
                            </div>
                            <h1 className="text-5xl font-black text-primary tracking-tight">Admin Hub</h1>
                        </div>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed">Platform-wide overview and infrastructure management.</p>
                    </div>
                    <Badge variant="outline" className="px-5 py-2 rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] bg-white shadow-sm flex items-center gap-2">
                        <BarChart3 size={14} /> Live Platform Data
                    </Badge>
                </header>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8">
                        <CardDescription className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Total Scale</CardDescription>
                        <CardTitle className="text-4xl font-black text-primary mb-1">{stats.totalUsers}</CardTitle>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Profiles</p>
                    </Card>
                    <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8 border-l-4 border-l-amber-400">
                        <CardDescription className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Needs Action</CardDescription>
                        <CardTitle className="text-4xl font-black text-primary mb-1">{stats.pendingVerifications}</CardTitle>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending Verification</p>
                    </Card>
                    <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8">
                        <CardDescription className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Economy</CardDescription>
                        <CardTitle className="text-4xl font-black text-primary mb-1">{stats.totalServices}</CardTitle>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live Services</p>
                    </Card>
                    <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8">
                        <CardDescription className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Engagement</CardDescription>
                        <CardTitle className="text-4xl font-black text-primary mb-1">{stats.totalForumPosts}</CardTitle>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Forum Threads</p>
                    </Card>
                </div>

                <div className="space-y-4 mb-8">
                    <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                        <Separator className="w-8 h-1 bg-primary/20" /> Control Panels
                    </h2>
                </div>

                {/* Management Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {adminCards.map((card) => (
                        <Card
                            key={card.title}
                            className="group rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 bg-white cursor-pointer overflow-hidden"
                        >
                            <Link href={card.link} className="p-10 flex flex-col h-full">
                                <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-black/5`}>
                                    {card.icon}
                                </div>
                                <CardTitle className="text-xl font-black text-primary mb-3 leading-tight">{card.title}</CardTitle>
                                <CardDescription className="text-zinc-500 font-medium text-sm mb-10 leading-relaxed">{card.desc}</CardDescription>
                                
                                <div className="mt-auto flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-zinc-50 text-zinc-400 font-black uppercase tracking-widest text-[9px] border-none px-3 py-1">
                                        {card.stats}
                                    </Badge>
                                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>

                {/* System Health */}
                <Card className="rounded-[3rem] p-10 md:p-12 border-none shadow-sm bg-white overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center shadow-inner border border-green-100">
                                <CheckCircle2 size={40} />
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-2xl font-black text-primary">System Status: Operational</CardTitle>
                                <CardDescription className="text-zinc-500 text-lg font-medium">All database connections and campus nodes are performing optimally.</CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="px-5 py-3 rounded-2xl border-zinc-100 text-zinc-400 font-black uppercase tracking-widest text-[10px] bg-zinc-50/50 flex items-center gap-3">
                            <Clock size={16} className="text-primary" />
                            Refreshed: {new Date().toLocaleTimeString()}
                        </Badge>
                    </div>
                </Card>
            </main>

            <Footer />
        </div>
    );
}
