"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Settings2,
    Trash2,
    ExternalLink,
    Loader2,
    ShoppingBag,
    AlertCircle,
    Pencil
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

            // 1. Get current session
            const { data: { session }, error: authError } = await supabase.auth.getSession();

            if (authError || !session) {
                router.push("/login");
                return;
            }

            // Check if user is a freelancer
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_freelancer")
                .eq("id", session.user.id)
                .single();

            if (!profile?.is_freelancer) {
                router.push("/profile");
                return;
            }

            // 2. Fetch services for this user
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
        } catch {
            alert("Error deleting service. Please try again.");
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
        <div className="min-h-screen flex flex-col bg-zinc-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-primary mb-2">My Services</h1>
                        <p className="text-zinc-500 font-medium">Manage your active campus listings</p>
                    </div>
                    <button
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-hover transition-all active:scale-95"
                        onClick={() => router.push("/create-service")}
                    >
                        <Plus size={20} /> Add New Service
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-3">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                {services.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-zinc-50 text-zinc-300 rounded-3xl flex items-center justify-center mx-auto">
                            <ShoppingBag size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-primary">No Services Yet</h2>
                            <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                                You haven&apos;t listed any services yet. Start earning on campus today!
                            </p>
                        </div>
                        <button
                            className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-primary-hover transition-all flex items-center gap-2 mx-auto"
                            onClick={() => router.push("/create-service")}
                        >
                            <Plus size={20} /> Add Your First Service
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="border border-zinc-100 bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group relative"
                            >
                                {service.image_url && (
                                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 border border-zinc-50">
                                        <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 bg-bg-soft text-primary-soft text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        {service.category}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => router.push(`/edit-service/${service.id}`)}
                                            className="p-2 text-zinc-400 hover:text-primary hover:bg-zinc-50 rounded-lg transition-colors"
                                            title="Edit listing"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete listing"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-primary mb-2 line-clamp-1">{service.title}</h3>
                                <p className="text-zinc-500 text-sm mb-6 line-clamp-2 font-medium h-10">
                                    {service.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                                    <div className="text-primary font-black">
                                        {service.price_range || "Contact for price"}
                                    </div>
                                    <button className="text-zinc-300 hover:text-primary transition-colors">
                                        <ExternalLink size={16} />
                                    </button>
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
