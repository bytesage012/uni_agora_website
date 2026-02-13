"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingBag,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    ExternalLink,
    Star,
    Trash2,
    ArrowLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const ADMIN_EMAIL = "bytesage013@gmail.com";

interface Service {
    id: string;
    title: string;
    price: number;
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
        } catch (err) {
            alert("Failed to update service.");
        } finally {
            setActionLoading(null);
        }
    };

    const deleteService = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        setActionLoading(id);
        try {
            const { error: deleteError } = await supabase
                .from("services")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
            setServices(services.filter(s => s.id !== id));
        } catch (err) {
            alert("Failed to delete service.");
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

            <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/admin" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary font-bold mb-4 transition-colors">
                            <ArrowLeft size={16} /> Back to Hub
                        </Link>
                        <h1 className="text-4xl font-black text-primary tracking-tight">Service Moderation</h1>
                        <p className="text-zinc-500 font-medium">Manage marketplace listings and featured content</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search services..."
                                className="pl-12 pr-6 py-3 bg-white border border-border-soft rounded-xl outline-none focus:border-primary transition-all font-bold text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-border-soft">
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Service Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Provider</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Price</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                {service.is_featured && <Star size={16} className="text-amber-400 fill-amber-400" />}
                                                <div className="flex flex-col">
                                                    <span className="font-black text-primary">{service.title}</span>
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{new Date(service.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-zinc-700">{service.profiles.full_name}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {service.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-primary">₦{service.price}</td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            <button
                                                onClick={() => toggleFeatured(service.id, !!service.is_featured)}
                                                disabled={actionLoading === service.id}
                                                className={`p-2 rounded-xl transition-all shadow-sm ${service.is_featured ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-400 hover:text-amber-500'}`}
                                                title={service.is_featured ? "Unfeature" : "Feature on Homepage"}
                                            >
                                                <Star size={18} />
                                            </button>
                                            <Link
                                                href={`/service/${service.id}`}
                                                target="_blank"
                                                className="p-2 bg-zinc-100 text-zinc-400 hover:text-primary rounded-xl transition-all inline-block shadow-sm"
                                                title="View Listing"
                                            >
                                                <ExternalLink size={18} />
                                            </Link>
                                            <button
                                                onClick={() => deleteService(service.id)}
                                                disabled={actionLoading === service.id}
                                                className="p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all shadow-sm"
                                                title="Delete Listing"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredServices.length === 0 && (
                            <div className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest">
                                No services found matching your search
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
