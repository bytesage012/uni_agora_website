"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
    Search,
    CheckCircle2,
    ShoppingBag,
    Loader2,
    AlertCircle,
    Filter,
    ArrowRight,
    Star
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkeletonCard from "../components/SkeletonCard";

interface Profile {
    full_name: string;
    verification_status: string;
    image_url?: string;
}

interface Service {
    id: string;
    title: string;
    category: string;
    description: string;
    price_range: string;
    created_at: string;
    image_url?: string;
    profiles: Profile;
    avgRating?: number;
    reviewCount?: number;
}

export default function MarketplacePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col bg-zinc-50">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
                <Footer />
            </div>
        }>
            <MarketplaceContent />
        </Suspense>
    );
}

function MarketplaceContent() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const searchParams = useSearchParams();
    const showFilters = searchParams.get("f") !== "off";

    useEffect(() => {
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [searchParams]);

    const categories = [
        "All",
        "Graphic Design",
        "Writing & Translation",
        "Tutoring & Lessons",
        "Tech & Programming",
        "Photography & Video",
        "Fashion & Style",
        "Food & Groceries",
        "Beauty & Care",
        "Repairs & Maintenance"
    ];

    // Map display labels to filter values if needed, but here they match create-service dropdown
    const getCategoryLabel = (cat: string) => {
        if (cat === "Tech & Programming") return "Tech";
        if (cat === "Graphic Design") return "Design";
        if (cat === "Writing & Translation") return "Writing";
        if (cat === "Tutoring & Lessons") return "Tutoring";
        if (cat === "Repairs & Maintenance") return "Repairs";
        if (cat === "Photography & Video") return "Photo/Video";
        return cat;
    };

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error: fetchError } = await supabase
                    .from("services")
                    .select(`
            *,
            profiles (
              full_name,
              verification_status,
              image_url
            )
          `)
                    .order("created_at", { ascending: false });

                if (fetchError) throw fetchError;

                // Fetch aggregate ratings
                const { data: ratingsData } = await supabase
                    .from("service_reviews")
                    .select("service_id, rating");

                const ratingsMap: Record<string, { total: number, count: number }> = {};
                (ratingsData || []).forEach(r => {
                    if (!ratingsMap[r.service_id]) ratingsMap[r.service_id] = { total: 0, count: 0 };
                    ratingsMap[r.service_id].total += r.rating;
                    ratingsMap[r.service_id].count += 1;
                });

                // Transform the profiles object/array from Supabase join
                const transformedData = (data || []).map((item) => {
                    const ratingInfo = ratingsMap[item.id];
                    return {
                        ...item,
                        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
                        avgRating: ratingInfo ? ratingInfo.total / ratingInfo.count : undefined,
                        reviewCount: ratingInfo ? ratingInfo.count : 0
                    };
                });

                setServices(transformedData);
                setFilteredServices(transformedData);
            } catch (err) {
                console.error("Error fetching services:", err);
                setError("Could not load the marketplace. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = services;

        // Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.title.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query)
            );
        }

        // Category Filter
        if (selectedCategory !== "All") {
            result = result.filter(s => s.category === selectedCategory);
        }

        setFilteredServices(result);
    }, [searchQuery, selectedCategory, services]);

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50">
            <Navbar />

            <main className="flex-grow flex flex-col">
                {/* Redesigned Marketplace Header - Merged with Nav */}
                {showFilters && (
                    <section className="sticky top-[68px] z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100 transition-all duration-300 animate-in slide-in-from-top-4">
                        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-5">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                {/* Search Row */}
                                <div className="relative w-full md:w-[400px] lg:w-[500px] flex-shrink-0">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#004d00]" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search services on campus..."
                                        className="w-full py-3 pl-12 pr-6 bg-white rounded-full border border-zinc-200 shadow-sm focus:shadow-md focus:border-[#004d00]/30 outline-none transition-all font-bold text-sm text-primary placeholder:text-zinc-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Filter Row - Same Line */}
                                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 w-full">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black tracking-tight transition-all duration-300 ${selectedCategory === cat
                                                ? "bg-[#004d00] text-white shadow-md scale-105"
                                                : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border border-zinc-100"
                                                }`}
                                        >
                                            {getCategoryLabel(cat)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* The Grid / Content */}
                <section className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-10 py-12">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center max-w-md mx-auto">
                            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                            <h2 className="text-xl font-black text-primary mb-2">Oops!</h2>
                            <p className="text-red-700 font-medium mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-primary text-white font-bold rounded-2xl"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-32 space-y-6">
                            <div className="w-24 h-24 bg-zinc-100 rounded-[2rem] flex items-center justify-center text-zinc-300 mx-auto">
                                <ShoppingBag size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-primary">No results found</h2>
                                <p className="text-zinc-500 font-medium max-w-xs mx-auto">
                                    Try adjusting your keywords or category filters to find what you&apos;re looking for.
                                </p>
                            </div>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                className="text-primary font-black hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredServices.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => router.push(`/service/${service.id}`)}
                                    className="bg-white border-[1px] border-[rgba(0,0,0,0.05)] rounded-[2rem] p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer group flex flex-col h-full overflow-hidden"
                                >
                                    <div className="mb-6">
                                        {service.image_url ? (
                                            <div className="w-full aspect-[16/10] bg-zinc-100 rounded-[1.5rem] overflow-hidden mb-6 shadow-sm border border-zinc-100">
                                                <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="px-4 py-1.5 bg-bg-soft text-primary-soft text-[10px] font-black uppercase tracking-widest rounded-2xl">
                                                    {service.category}
                                                </span>
                                                {service.profiles?.verification_status === 'verified' && (
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-2 py-1 rounded-lg">
                                                        <CheckCircle2 size={12} className="fill-green-600/10" /> Verified
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {service.image_url && (
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="px-4 py-1.5 bg-bg-soft text-primary-soft text-[10px] font-black uppercase tracking-widest rounded-2xl">
                                                    {service.category}
                                                </span>
                                                {service.profiles?.verification_status === 'verified' && (
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-2 py-1 rounded-lg">
                                                        <CheckCircle2 size={12} className="fill-green-600/10" /> Verified
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold tracking-tight text-primary mb-1 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                                        {service.title}
                                    </h3>

                                    <div className="flex items-center gap-1.5 mb-4">
                                        {service.avgRating ? (
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-black text-primary">{service.avgRating.toFixed(1)}</span>
                                                <span className="text-[10px] font-bold text-zinc-300">({service.reviewCount} reviews)</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">New Listing</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-primary/5 text-primary rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-100 shadow-sm">
                                            {service.profiles?.image_url ? (
                                                <img src={service.profiles.image_url} alt={service.profiles.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-black">{service.profiles?.full_name?.charAt(0) || "U"}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-zinc-700 leading-none">
                                                {service.profiles?.full_name || "Anonymous Helper"}
                                            </span>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                                UNI-MEMBER
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-zinc-400/80 uppercase tracking-widest mb-1">Budget</span>
                                            <span className="px-4 py-2 bg-green-50 text-green-900 font-bold rounded-xl text-sm inline-block">
                                                {service.price_range || "Flexible"}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>

                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div >
    );
}
