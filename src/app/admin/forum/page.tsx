"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    Search,
    Trash2,
    Loader2,
    ArrowLeft,
    ShieldAlert,
    MoreHorizontal,
    Eye,
    Clock,
    User
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const ADMIN_EMAIL = "bytesage013@gmail.com";

interface Post {
    id: string;
    title: string;
    category: string;
    upvotes?: number;
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string;
    };
}

export default function ForumModeration() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || session.user.email !== ADMIN_EMAIL) {
                router.push("/login");
                return;
            }
            fetchPosts();
        };
        checkAdmin();
    }, [router]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from("community_posts")
                .select(`
                    *,
                    profiles (
                        full_name
                    )
                `)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            const transformed = data.map(p => ({
                ...p,
                profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
            }));

            setPosts(transformed);
            setFilteredPosts(transformed);
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = posts;
        if (searchQuery.trim()) {
            result = result.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredPosts(result);
    }, [searchQuery, posts]);

    const deletePost = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from("community_posts")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
            setPosts(posts.filter(p => p.id !== id));
            toast.success("Discussion deleted permanently.");
        } catch (err) {
            console.error("Error deleting post:", err);
            toast.error("Failed to delete post.");
        } finally {
            // Loading handled by local state if needed, but removed as it was unused
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
                                <MessageSquare size={32} />
                            </div>
                            <h1 className="text-5xl font-black text-primary tracking-tight">Forum Moderation</h1>
                        </div>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed">Monitor campus discussions and manage community standards.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                            <Input
                                placeholder="Search by title or author..."
                                className="h-14 pl-12 bg-white border-zinc-100 rounded-2xl outline-none focus-visible:ring-primary/20 shadow-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white mb-12">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-zinc-50 border-b border-zinc-100">
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Discussion Title</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Author</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Posted Date</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPosts.map((post) => (
                                <TableRow key={post.id} className="group hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                                    <TableCell className="px-10 py-8">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-lg font-black text-primary leading-tight group-hover:text-primary/70 transition-colors line-clamp-1">{post.title}</span>
                                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter">ID: {post.id.substring(0, 8)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-zinc-400" />
                                            <span className="font-black text-zinc-600 text-sm">{post.profiles?.full_name || "Anonymous"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 py-8">
                                        <Badge variant="secondary" className="bg-zinc-50 text-zinc-400 font-black uppercase tracking-widest text-[9px] border-none px-3 py-1">
                                            {post.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-10 py-8 text-center">
                                        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm font-medium">
                                            <Clock size={14} />
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 py-8 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-zinc-200">
                                                    <MoreHorizontal size={20} className="text-zinc-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                                                <DropdownMenuLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest p-3">Post Management</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="mx-2" />
                                                <DropdownMenuItem asChild className="rounded-xl p-3 font-bold gap-3 focus:bg-primary/5 cursor-pointer text-primary">
                                                    <Link href={`/community/post/${post.id}`} target="_blank">
                                                        <Eye size={18} /> View Post
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="mx-2" />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <div className="flex items-center gap-3 px-3 py-3 text-red-600 font-bold text-sm cursor-pointer hover:bg-red-50 rounded-xl">
                                                            <Trash2 size={18} /> Delete Post
                                                        </div>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2.5rem]">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-2xl font-black text-primary">Delete Discussion?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-lg font-medium text-zinc-500">
                                                                This will permanently delete <span className="font-black text-primary">&quot;{post.title}&quot;</span> and all its comments. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="gap-4">
                                                            <AlertDialogCancel className="h-12 px-8 rounded-xl font-bold">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={() => deletePost(post.id)}
                                                                className="h-12 px-8 rounded-xl bg-red-600 hover:bg-red-700 font-black"
                                                            >
                                                                Confirm Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredPosts.length === 0 && (
                        <div className="py-24 text-center space-y-4 bg-zinc-50/50">
                            <MessageSquare className="mx-auto text-zinc-200" size={64} />
                            <h3 className="text-2xl font-black text-primary">No discussions found</h3>
                            <p className="text-zinc-400 font-medium max-w-xs mx-auto">Try adjusting your search to find the threads you want to moderate.</p>
                        </div>
                    )}
                </Card>

                {/* Admin Safety Alert */}
                <Alert variant="destructive" className="rounded-[3rem] p-8 md:p-12 border-none bg-red-50 shadow-sm flex items-start gap-8">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner border border-red-200">
                        <ShieldAlert size={32} />
                    </div>
                    <div className="space-y-3">
                        <AlertTitle className="text-2xl font-black text-red-900 tracking-tight">Community Governance</AlertTitle>
                        <AlertDescription className="text-red-700/80 text-lg font-medium leading-relaxed max-w-3xl">
                            Uphold campus standards with integrity. Delete content that promotes hate, harassment, or illegal activities. Always review discussions before final removal.
                        </AlertDescription>
                    </div>
                </Alert>
            </main>

            <Footer />
        </div>
    );
}
