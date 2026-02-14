"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Mail,
    Clock,
    Search,
    AlertCircle,
    Loader2,
    ChevronRight,
    ArrowLeft,
    Trash2,
    CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

interface Submission {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

const ADMIN_EMAIL = "bytesage013@gmail.com";

export default function AdminContactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || session.user.email !== ADMIN_EMAIL) {
                router.push("/dashboard");
                return;
            }
            fetchSubmissions();
        };
        checkAdmin();
    }, [router]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from("contact_submissions")
                .select("*")
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;
            setSubmissions(data || []);
        } catch (err: any) {
            console.error("Error fetching submissions:", err);
            setError("Failed to load submissions.");
        } finally {
            setLoading(false);
        }
    };

    const deleteSubmission = async (id: string) => {
        if (!confirm("Are you sure you want to delete this submission?")) return;

        try {
            const { error } = await supabase
                .from("contact_submissions")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setSubmissions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Error deleting:", err);
            alert("Failed to delete.");
        }
    };

    const filtered = submissions.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors font-bold mb-4 group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
                        </Link>
                        <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
                            <Mail size={36} /> Contact Submissions
                        </h1>
                        <p className="text-zinc-500 font-medium">Manage user inquiries and feedback</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search submissions..."
                            className="pl-12 pr-6 py-3 bg-white border border-border-soft rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm w-full sm:w-64 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                {error ? (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                        <p className="text-red-600 font-bold">{error}</p>
                        <button onClick={fetchSubmissions} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold">Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-border-soft text-center shadow-sm">
                        <Mail className="text-zinc-100 mx-auto mb-6" size={80} />
                        <p className="text-zinc-400 font-black uppercase tracking-widest">No Submissions Found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filtered.map((sub) => (
                            <div key={sub.id} className="bg-white p-8 rounded-[2.5rem] border border-border-soft shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                ${sub.subject === 'bug' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    sub.subject === 'report' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        sub.subject === 'suggestion' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-zinc-50 text-zinc-500 border-zinc-100'}`}>
                                                {sub.subject}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                                <Clock size={12} />
                                                {new Date(sub.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-primary mb-1">{sub.name}</h3>
                                        <p className="text-zinc-500 font-bold mb-6">{sub.email}</p>
                                        <div className="bg-zinc-50 p-6 rounded-2xl text-zinc-700 font-medium leading-relaxed italic border border-zinc-100">
                                            "{sub.message}"
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col justify-end gap-3">
                                        <button
                                            onClick={() => deleteSubmission(sub.id)}
                                            className="p-4 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            title="Delete Submission"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <a
                                            href={`mailto:${sub.email}?subject=Re: UniAGORA ${sub.subject} - ${sub.name}`}
                                            className="p-4 text-zinc-400 hover:text-primary hover:bg-zinc-50 rounded-2xl transition-all"
                                            title="Reply via Email"
                                        >
                                            <Mail size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
