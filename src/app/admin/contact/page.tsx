"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Mail,
    Clock,
    Search,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Trash2,
    Reply,
    User,
    MessageSquare
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
        } catch (err: unknown) {
            console.error("Error fetching submissions:", err);
            setError("Failed to load submissions.");
        } finally {
            setLoading(false);
        }
    };

    const deleteSubmission = async (id: string) => {
        try {
            const { error } = await supabase
                .from("contact_submissions")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setSubmissions(prev => prev.filter(s => s.id !== id));
            toast.success("Submission deleted.");
        } catch (err) {
            console.error("Error deleting:", err);
            toast.error("Failed to delete submission.");
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
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
                <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <Button variant="ghost" asChild className="mb-4 font-bold text-zinc-400 hover:text-primary gap-2 p-0 h-auto hover:bg-transparent">
                            <Link href="/admin">
                                <ArrowLeft size={16} /> Back to Admin Hub
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary/20">
                                <Mail size={32} />
                            </div>
                            <h1 className="text-5xl font-black text-primary tracking-tight">Contact Inbox</h1>
                        </div>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed">Review user feedback, bug reports, and support requests.</p>
                    </div>

                    <div className="relative w-full lg:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                        <Input
                            placeholder="Search inbox..."
                            className="h-14 pl-12 bg-white border-zinc-100 rounded-2xl outline-none focus-visible:ring-primary/20 shadow-sm font-medium transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                {error ? (
                    <Alert variant="destructive" className="rounded-[2.5rem] p-12 border-none bg-red-50 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-6" />
                        <AlertTitle className="text-2xl font-black text-red-900 mb-2">Sync Error</AlertTitle>
                        <AlertDescription className="text-lg font-medium text-red-700/80 mb-8">
                            {error}
                        </AlertDescription>
                        <Button onClick={fetchSubmissions} variant="destructive" className="h-12 px-8 rounded-xl font-black">Retry Connection</Button>
                    </Alert>
                ) : filtered.length === 0 ? (
                    <Card className="rounded-[3.5rem] p-24 border-dashed border-2 border-zinc-200 bg-white/50 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 text-zinc-200">
                            <Mail size={48} />
                        </div>
                        <CardTitle className="text-3xl font-black text-primary mb-3">Your inbox is clear</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium text-lg leading-relaxed">
                            No new submissions found matching your search.
                        </CardDescription>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {filtered.map((sub) => (
                            <Card key={sub.id} className="rounded-[3rem] border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden p-8 md:p-10">
                                <div className="flex flex-col md:flex-row justify-between gap-10">
                                    <div className="flex-grow space-y-6">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <Badge variant="outline" className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2
                                                ${sub.subject === 'bug' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    sub.subject === 'report' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        sub.subject === 'suggestion' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-zinc-50 text-zinc-500 border-zinc-100'}`}>
                                                {sub.subject}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest bg-zinc-50 px-3 py-1.5 rounded-lg">
                                                <Clock size={12} className="text-primary" />
                                                {new Date(sub.created_at).toLocaleDateString()} at {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-primary flex items-center gap-3">
                                                <User size={20} className="text-primary" /> {sub.name}
                                            </h3>
                                            <p className="text-zinc-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 ml-8">
                                                {sub.email}
                                            </p>
                                        </div>

                                        <Card className="rounded-2xl border-none shadow-inner bg-zinc-50 p-8 relative">
                                            <MessageSquare className="absolute top-4 right-4 text-zinc-200" size={32} />
                                            <p className="text-zinc-700 font-medium text-lg leading-relaxed italic">
                                                &quot;{sub.message}&quot;
                                            </p>
                                        </Card>
                                    </div>

                                    <div className="flex md:flex-col justify-end gap-4 shrink-0">
                                        <Button asChild variant="secondary" className="h-14 w-full md:w-14 p-0 rounded-2xl bg-zinc-100 hover:bg-primary hover:text-white transition-all shadow-sm">
                                            <a href={`mailto:${sub.email}?subject=Re: UniAGORA ${sub.subject} - ${sub.name}`} title="Reply via Email">
                                                <Reply size={24} />
                                            </a>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" className="h-14 w-full md:w-14 p-0 rounded-2xl text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-all">
                                                    <Trash2 size={24} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-[2.5rem]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-2xl font-black text-primary">Delete Submission?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-lg font-medium text-zinc-500">
                                                        Are you sure you want to remove the message from <span className="font-black text-primary">{sub.name}</span>? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-4">
                                                    <AlertDialogCancel className="h-12 px-8 rounded-xl font-bold">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => deleteSubmission(sub.id)}
                                                        className="h-12 px-8 rounded-xl bg-red-600 hover:bg-red-700 font-black"
                                                    >
                                                        Delete Permanently
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
