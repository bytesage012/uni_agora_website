"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingBag,
    Search,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ExternalLink,
    Star,
    Trash2,
    ArrowLeft,
    MoreHorizontal,
    Eye,
    TrendingUp
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const ADMIN_EMAIL = "bytesage013@gmail.com";

interface Service {
    id: string;
    title: string;
    price_range: string;
    category: string;
    user_id: string;
    created_at: string;
    is_featured?: boolean;
    profiles: {
        full_name: string;
    };
}

export default function ServiceModeration() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || session.user.email !== ADMIN_EMAIL) {
                router.push("/login");
                return;
            }
            fetchServices();
        };
        checkAdmin();
    }, [router]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from("services")
                .select(`
                    *,
                    profiles (
                        full_name
                    )
                `)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            const transformed = data.map(s => ({
                ...s,
                profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
            }));

            setServices(transformed);
            setFilteredServices(transformed);
        } catch (err) {
            console.error("Error fetching services:", err);
            setError("Failed to load services.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = services;
        if (searchQuery.trim()) {
            result = result.filter(s =>
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (categoryFilter !== "all") {
            result = result.filter(s => s.category === categoryFilter);
        }
        setFilteredServices(result);
    }, [searchQuery, categoryFilter, services]);

    const toggleFeatured = async (id: string, current: boolean) => {
        setActionLoading(id);
        try {
            const { error: updateError } = await supabase
                .from("services")
                .update({ is_featured: !current })
                .eq("id", id);

            if (updateError) throw updateError;
            setServices(services.map(s => s.id === id ? { ...s, is_featured: !current } : s));
            toast.success(current ? "Removed from featured" : "Added to featured listings!");
        } catch (err) {
            toast.error("Failed to update service status.");
        } finally {
            setActionLoading(null);
        }
    };

    const deleteService = async (id: string) => {
        setActionLoading(id);
        try {
            const { error: deleteError } = await supabase
                .from("services")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
            setServices(services.filter(s => s.id !== id));
            toast.success("Service listing deleted.");
        } catch (err) {
            toast.error("Failed to delete service.");
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
                                <ShoppingBag size={32} />
                            </div>
                            <h1 className="text-5xl font-black text-primary tracking-tight">Service Moderation</h1>
                        </div>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed">Review marketplace listings and manage featured content across campuses.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                            <Input
                                placeholder="Search by title or provider..."
                                className="h-14 pl-12 bg-white border-zinc-100 rounded-2xl outline-none focus-visible:ring-primary/20 shadow-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-zinc-50 border-b border-zinc-100">
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Service Details</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Provider</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Price</TableHead>
                                <TableHead className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.map((service) => (
                                <TableRow key={service.id} className="group hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                                    <TableCell className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            {service.is_featured && (
                                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-400 shadow-sm border border-amber-100">
                                                    <Star size={18} className="fill-amber-400" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-primary leading-none mb-1.5">{service.title}</span>
                                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                    Posted {new Date(service.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 py-8 font-black text-zinc-600 text-sm">{service.profiles?.full_name || "Unknown Provider"}</TableCell>
                                    <TableCell className="px-10 py-8">
                                        <Badge variant="secondary" className="bg-zinc-50 text-zinc-400 font-black uppercase tracking-widest text-[9px] border-none px-3 py-1">
                                            {service.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-10 py-8 font-black text-primary text-xl">{service.price_range || "Flexible"}</TableCell>
                                    <TableCell className="px-10 py-8 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-zinc-200">
                                                    <MoreHorizontal size={20} className="text-zinc-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                                                <DropdownMenuLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest p-3">Service Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="mx-2" />
                                                <DropdownMenuItem asChild className="rounded-xl p-3 font-bold gap-3 focus:bg-primary/5 cursor-pointer text-primary">
                                                    <Link href={`/service/${service.id}`} target="_blank">
                                                        <Eye size={18} /> View Listing
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => toggleFeatured(service.id, !!service.is_featured)}
                                                    className="rounded-xl p-3 font-bold gap-3 focus:bg-amber-50 cursor-pointer text-amber-600"
                                                >
                                                    {service.is_featured ? (
                                                        <><Star size={18} className="fill-amber-600" /> Unfeature Listing</>
                                                    ) : (
                                                        <><TrendingUp size={18} /> Feature on Home</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="mx-2" />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <div className="flex items-center gap-3 px-3 py-3 text-red-600 font-bold text-sm cursor-pointer hover:bg-red-50 rounded-xl">
                                                            <Trash2 size={18} /> Delete Listing
                                                        </div>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2.5rem]">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-2xl font-black text-primary">Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-lg font-medium text-zinc-500">
                                                                This will permanently delete the service <span className="font-black text-primary">&quot;{service.title}&quot;</span>. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="gap-4">
                                                            <AlertDialogCancel className="h-12 px-8 rounded-xl font-bold">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={() => deleteService(service.id)}
                                                                className="h-12 px-8 rounded-xl bg-red-600 hover:bg-red-700 font-black"
                                                            >
                                                                Delete Permanently
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
                    {filteredServices.length === 0 && (
                        <div className="py-24 text-center space-y-4 bg-zinc-50/50">
                            <ShoppingBag className="mx-auto text-zinc-200" size={64} />
                            <h3 className="text-2xl font-black text-primary">No services found</h3>
                            <p className="text-zinc-400 font-medium max-w-xs mx-auto">Try adjusting your search to find the services you want to moderate.</p>
                        </div>
                    )}
                </Card>
            </main>

            <Footer />
        </div>
    );
}
