"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Trash2,
    ExternalLink,
    Loader2,
    ShoppingBag,
    AlertCircle,
    Pencil,
    MoreVertical
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Service {
    id: string;
    title: string;
    category: string;
    description: string;
    price_range: string;
    created_at: string;
    image_url?: string;
}

export default function MyServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkUserAndFetchServices = async () => {
            setLoading(true);
            setError(null);

            const { data: { session }, error: authError } = await supabase.auth.getSession();

            if (authError || !session) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("is_freelancer")
                .eq("id", session.user.id)
                .single();

            if (!profile?.is_freelancer) {
                router.push("/profile");
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from("services")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("created_at", { ascending: false });

                if (fetchError) throw fetchError;
                setServices(data || []);
            } catch (err) {
                console.error("Error fetching services:", err);
                setError("Could not load your services. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        checkUserAndFetchServices();
    }, [router]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            const { error } = await supabase
                .from("services")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setServices(services.filter(s => s.id !== id));
            toast.success("Service deleted successfully.");
        } catch {
            toast.error("Error deleting service. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-zinc-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-primary mb-2">My Services</h1>
                        <p className="text-zinc-500 font-medium">Manage your active campus listings</p>
                    </div>
                    <Button
                        className="h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        onClick={() => router.push("/create-service")}
                    >
                        <Plus size={20} className="mr-2" /> Add New Service
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-8 rounded-2xl">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="font-bold">{error}</AlertDescription>
                    </Alert>
                )}

                {services.length === 0 ? (
                    <Card className="border-dashed border-2 border-zinc-200 rounded-[3rem] bg-white/50 p-20 text-center space-y-8 flex flex-col items-center">
                        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-zinc-200">
                            <ShoppingBag size={48} />
                        </div>
                        <div className="space-y-3">
                            <CardTitle className="text-3xl font-black text-primary">No Services Yet</CardTitle>
                            <CardDescription className="text-zinc-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                                You haven&apos;t listed any services yet. Start earning on campus today!
                            </CardDescription>
                        </div>
                        <Button
                            className="h-16 px-10 bg-primary text-white font-black text-lg rounded-[1.5rem] shadow-2xl shadow-primary/30"
                            onClick={() => router.push("/create-service")}
                        >
                            <Plus size={24} className="mr-2" /> Add Your First Service
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <Card
                                key={service.id}
                                className="border-zinc-100 bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                            >
                                <CardHeader className="p-6 pb-0">
                                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-50 bg-zinc-100">
                                        {service.image_url ? (
                                            <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-zinc-200">
                                                <ShoppingBag size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-white/90 backdrop-blur-sm text-primary font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-xl border-none shadow-sm hover:bg-white">
                                                {service.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-black text-primary line-clamp-1 group-hover:text-primary/80 transition-colors">{service.title}</h3>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400">
                                                    <MoreVertical size={20} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                                                <DropdownMenuItem onClick={() => router.push(`/service/${service.id}`)} className="rounded-xl px-4 py-2.5 font-bold cursor-pointer">
                                                    <ExternalLink size={16} className="mr-2" /> View Listing
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/edit-service/${service.id}`)} className="rounded-xl px-4 py-2.5 font-bold cursor-pointer">
                                                    <Pencil size={16} className="mr-2" /> Edit Listing
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1" />
                                                <DropdownMenuItem onClick={() => handleDelete(service.id)} className="rounded-xl px-4 py-2.5 font-bold text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer">
                                                    <Trash2 size={16} className="mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <p className="text-zinc-500 text-sm line-clamp-2 font-medium h-10 mb-6">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Budget</span>
                                            <span className="text-primary font-black text-lg">
                                                {service.price_range || "Flexible"}
                                            </span>
                                        </div>
                                        <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl bg-zinc-50 group-hover:bg-primary group-hover:text-white transition-all" onClick={() => router.push(`/service/${service.id}`)}>
                                            <ExternalLink size={18} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
