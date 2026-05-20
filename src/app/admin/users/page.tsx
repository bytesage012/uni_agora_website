"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Users,
    CheckCircle2,
    ExternalLink,
    Search,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Filter,
    MoreHorizontal,
    Ban,
    UserCheck,
    FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
    id: string;
    full_name: string;
    university: string;
    verification_status: string;
    is_freelancer: boolean;
    verification_document_url?: string;
    created_at: string;
    image_url?: string;
}

const ADMIN_EMAIL = "bytesage013@gmail.com";

export default function AdminUsersPage() {
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

            setUsers(users.map(u => u.id === userId ? { ...u, verification_status: newStatus } : u));
            toast.success(`User status updated to ${newStatus}`);

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
            toast.error("Failed to update status.");
        } finally {
            setActionLoading(null);
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

    if (error && !users.length) {
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

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
                <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <Button variant="ghost" asChild className="mb-4 font-bold text-zinc-400 hover:text-primary gap-2 p-0 h-auto hover:bg-transparent">
                            <Link href="/admin">
                                <ArrowLeft size={16} /> Back to Admin Hub
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary/20">
                                <Users size={32} />
                            </div>
                            <h1 className="text-5xl font-black text-primary tracking-tight">Manage Users</h1>
                        </div>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed">Review student identities and manage marketplace access.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                            <Input
                                placeholder="Search by name or campus..."
                                className="h-14 pl-12 bg-white border-zinc-100 rounded-2xl outline-none focus-visible:ring-primary/20 shadow-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-14 w-full sm:w-48 px-6 bg-white border-zinc-100 rounded-2xl font-black text-xs uppercase tracking-widest focus:ring-primary/20 shadow-sm">
                                <SelectValue placeholder="Status Filter" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all" className="rounded-xl my-1">All Status</SelectItem>
                                <SelectItem value="verified" className="rounded-xl my-1">Verified</SelectItem>
                                <SelectItem value="pending" className="rounded-xl my-1">Pending</SelectItem>
                                <SelectItem value="unverified" className="rounded-xl my-1">Unverified</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </header>

                <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-zinc-50 border-b border-zinc-100">
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">User Profile</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Campus & Role</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Verification Docs</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="group hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                                    <TableCell className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 rounded-2xl border bg-zinc-50 shadow-sm">
                                                <AvatarImage src={user.image_url} className="object-cover" />
                                                <AvatarFallback className="text-primary font-black">
                                                    {user.full_name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-primary leading-none mb-1.5">{user.full_name}</span>
                                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Clock size={10} className="text-primary" />
                                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 py-8">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-sm font-black text-zinc-600">{user.university}</span>
                                            <Badge variant="outline" className={`w-fit text-[9px] font-black uppercase tracking-widest border-none px-2 py-0.5 ${user.is_freelancer ? 'bg-primary/5 text-primary' : 'bg-zinc-50 text-zinc-400'}`}>
                                                {user.is_freelancer ? "Freelancer" : "Student"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 py-8">
                                        {user.verification_document_url ? (
                                            <Button variant="secondary" size="sm" asChild className="h-10 px-4 rounded-xl bg-zinc-100 hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest gap-2 group-hover:shadow-md">
                                                <a href={user.verification_document_url} target="_blank" rel="noopener noreferrer">
                                                    <FileText size={14} /> Open Document
                                                </a>
                                            </Button>
                                        ) : (
                                            <span className="text-[10px] font-black text-zinc-300 uppercase italic tracking-[0.2em] ml-2">No Doc Uploaded</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-10 py-8 text-center">
                                        <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2
                                            ${user.verification_status === 'verified'
                                                ? 'bg-green-50 text-green-600 border-green-100 shadow-sm'
                                                : user.verification_status === 'pending'
                                                    ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                                    : 'bg-zinc-50 text-zinc-400 border-zinc-100'}`}>
                                            {user.verification_status || 'unverified'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-10 py-8 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-zinc-200">
                                                    <MoreHorizontal size={20} className="text-zinc-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                                                <DropdownMenuLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest p-3">Verify Identity</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="mx-2" />
                                                <DropdownMenuItem 
                                                    onClick={() => toggleVerification(user.id, user.verification_status)}
                                                    className={`rounded-xl p-3 font-bold gap-3 focus:bg-primary/5 cursor-pointer ${user.verification_status === 'verified' ? 'text-red-600 focus:text-red-700' : 'text-primary'}`}
                                                >
                                                    {user.verification_status === 'verified' ? (
                                                        <><Ban size={18} /> Revoke Verification</>
                                                    ) : (
                                                        <><UserCheck size={18} /> Approve Verification</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-zinc-100 cursor-pointer text-zinc-600">
                                                    <Users size={18} /> View Public Profile
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredUsers.length === 0 && (
                        <div className="py-24 text-center space-y-4 bg-zinc-50/50">
                            <Users className="mx-auto text-zinc-200" size={64} />
                            <h3 className="text-2xl font-black text-primary">No users found</h3>
                            <p className="text-zinc-400 font-medium max-w-xs mx-auto">Try adjusting your filters or search query to find who you're looking for.</p>
                        </div>
                    )}
                </Card>
            </main>

            <Footer />
        </div>
    );
}
