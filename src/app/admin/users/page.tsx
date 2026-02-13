"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Users,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Search,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Filter
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

interface UserProfile {
    id: string;
    full_name: string;
    university: string;
    verification_status: string;
    is_freelancer: boolean;
    verification_document_url?: string;
    created_at: string;
}

// NOTE: Replace this with your actual admin email
const ADMIN_EMAIL = "bytesage013@gmail.com";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            if (session.user.email !== ADMIN_EMAIL) {
                setError("Restricted Access: You do not have admin privileges.");
                setLoading(false);
                return;
            }

            fetchUsers();
        };

        checkAdmin();
    }, [router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;
            setUsers(data || []);
            setFilteredUsers(data || []);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError("Failed to load users list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = users;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(u =>
                u.full_name.toLowerCase().includes(q) ||
                u.university.toLowerCase().includes(q)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter(u => u.verification_status === statusFilter);
        }

        setFilteredUsers(result);
    }, [searchQuery, statusFilter, users]);

    const toggleVerification = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === "verified" ? "unverified" : "verified";
        setActionLoading(userId);

        try {
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ verification_status: newStatus })
                .eq("id", userId);

            if (updateError) throw updateError;

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, verification_status: newStatus } : u));

            // Celebration!
            if (newStatus === "verified") {
                const confetti = (await import("canvas-confetti")).default;
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#003D29', '#FFCE00', '#FFFFFF']
                });
            }
        } catch (err) {
            console.error("Error toggling verification:", err);
            alert("Failed to update status.");
        } finally {
            setActionLoading(null);
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

    if (error && !users.length) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
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

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <h1 className="text-4xl font-black text-primary tracking-tight">Admin Console</h1>
                        </div>
                        <p className="text-zinc-500 font-medium">Verified Merchant Management System</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="pl-12 pr-6 py-3 bg-white border border-border-soft rounded-xl outline-none focus:border-primary transition-all font-bold text-sm w-full sm:w-64 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-3 bg-white border border-border-soft rounded-xl outline-none focus:border-primary font-bold text-sm shadow-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="unverified">Unverified</option>
                        </select>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-border-soft">
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Campus Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Documents</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Verification Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50 transition-colors even:bg-zinc-50/50 border-b border-border-soft last:border-0">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary">{user.full_name}</span>
                                                <span className="text-xs text-zinc-400 font-bold">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-zinc-700">{user.university}</span>
                                                <span className="text-[10px] font-black text-primary/50 uppercase tracking-tighter">
                                                    {user.is_freelancer ? "Freelancer" : "Buyer Only"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.verification_document_url ? (
                                                <a
                                                    href={user.verification_document_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    View Document <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="text-[10px] font-black text-zinc-300 uppercase italic tracking-widest">No Doc</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                    ${user.verification_status === 'verified'
                                                        ? 'bg-green-50 text-green-600 border-green-100'
                                                        : user.verification_status === 'pending'
                                                            ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                                            : 'bg-zinc-50 text-zinc-400 border-zinc-100'}`}>
                                                    {user.verification_status || 'unverified'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => toggleVerification(user.id, user.verification_status)}
                                                disabled={actionLoading === user.id}
                                                className={`px-5 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 disabled:opacity-50
                                                    ${user.verification_status === 'verified'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                                        : 'bg-primary text-white hover:bg-green-900 active:scale-95 shadow-primary/20'}`}
                                            >
                                                {actionLoading === user.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : user.verification_status === 'verified' ? (
                                                    'Revoke'
                                                ) : (
                                                    'Verify Now'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest">
                                No users found matching your search
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
