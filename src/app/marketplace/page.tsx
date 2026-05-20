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
    ArrowRight,
    Star
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkeletonCard from "../components/SkeletonCard";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

function CategoryPlaceholder({ category }: { category: string }) {
    const colors: Record<string, string> = {
        "Graphic Design": "from-purple-600 to-indigo-950",
        "Writing & Translation": "from-blue-600 to-cyan-950",
        "Tutoring & Lessons": "from-amber-500 to-orange-950",
        "Tech & Programming": "from-teal-600 to-emerald-950",
        "Photography & Video": "from-pink-600 to-rose-950",
        "Fashion & Style": "from-fuchsia-500 to-pink-950",
        "Food & Groceries": "from-green-600 to-yellow-950",
        "Beauty & Care": "from-rose-500 to-red-950",
        "Repairs & Maintenance": "from-zinc-600 to-zinc-950",
        "default": "from-emerald-700 to-emerald-950"
    };

    const gradient = colors[category] || colors["default"];

    return (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col justify-between p-6 text-white relative overflow-hidden select-none`}>
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-xl"></div>
            
            <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                UniAGORA
            </span>

            <div className="space-y-0.5 z-10 text-left">
                <p className="text-[10px] font-bold tracking-wider opacity-60 uppercase">Campus Service</p>
                <p className="text-base font-black tracking-tight leading-none uppercase">{category}</p>
            </div>
        </div>
    );
}

export default function MarketplacePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col bg-[#F8FAF7]">
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

                const { data: ratingsData } = await supabase
                    .from("service_reviews")
                    .select("service_id, rating");

                const ratingsMap: Record<string, { total: number, count: number }> = {};
                (ratingsData || []).forEach(r => {
                    if (!ratingsMap[r.service_id]) ratingsMap[r.service_id] = { total: 0, count: 0 };
                    ratingsMap[r.service_id].total += r.rating;
                    ratingsMap[r.service_id].count += 1;
                });

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

    useEffect(() => {
        let result = services;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.title.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query)
            );
        }
        if (selectedCategory !== "All") {
            result = result.filter(s => s.category === selectedCategory);
        }
        setFilteredServices(result);
    }, [searchQuery, selectedCategory, services]);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAF7] font-sans text-[#002217]">
            <Navbar />

            <main className="flex-grow flex flex-col">
                {showFilters && (
                    <section className="sticky top-[68px] z-30 bg-white/80 backdrop-blur-xl border-b border-[#E2EAE4] transition-all duration-300 animate-in fade-in">
                        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative w-full md:w-[320px] lg:w-[420px] flex-shrink-0">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <Input
                                        placeholder="Search services on campus..."
                                        className="h-12 pl-12 pr-6 bg-[#F8FAF7] rounded-2xl border-zinc-200 shadow-inner focus-visible:ring-primary font-bold text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex items-center gap-2 pb-1">
                                        {categories.map((cat) => (
                                            <Button
                                                key={cat}
                                                variant={selectedCategory === cat ? "default" : "secondary"}
                                                size="sm"
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`rounded-xl px-5 font-black tracking-tight h-10 transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-md shadow-primary/10' : 'bg-white text-zinc-500 hover:bg-[#F0F4F1] border border-zinc-200/50'}`}
                                            >
                                                {getCategoryLabel(cat)}
                                            </Button>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" className="hidden" />
                                </ScrollArea>
                            </div>
                        </div>
                    </section>
                )}

                <section className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-12 py-12">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <Card className="bg-red-50 border-red-100 p-8 rounded-[2rem] text-center max-w-md mx-auto">
                            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                            <h2 className="text-xl font-black text-primary mb-2">Oops!</h2>
                            <p className="text-red-700 font-medium mb-6">{error}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="px-8 h-12 rounded-2xl"
                            >
                                Retry
                            </Button>
                        </Card>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-32 space-y-6">
                            <div className="w-20 h-20 bg-white rounded-[1.5rem] border border-zinc-200/60 flex items-center justify-center text-zinc-300 mx-auto">
                                <ShoppingBag size={36} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-primary">No services listed</h2>
                                <p className="text-zinc-500 font-medium max-w-xs mx-auto text-sm">
                                    Try adjusting your keywords or category filters to find what you&apos;re looking for.
                                </p>
                            </div>
                            <Button
                                variant="link"
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                className="text-primary font-black"
                            >
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredServices.map((service) => (
                                <Card
                                    key={service.id}
                                    onClick={() => router.push(`/service/${service.id}`)}
                                    className="group cursor-pointer border border-[#E2EAE4] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[2.5rem] overflow-hidden flex flex-col h-full bg-white"
                                >
                                    <CardHeader className="p-5 pb-0">
                                        <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-[#F8FAF7] border border-[#E2EAE4] shadow-inner">
                                            {service.image_url ? (
                                                <Image 
                                                    src={service.image_url} 
                                                    alt={service.title} 
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            ) : (
                                                <CategoryPlaceholder category={service.category} />
                                            )}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <Badge variant="secondary" className="rounded-xl px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-white/95 text-primary shadow-sm border-none">
                                                    {service.category}
                                                </Badge>
                                                {service.profiles?.verification_status === 'verified' && (
                                                    <Badge className="rounded-xl px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-green-500 text-white shadow-sm border-none gap-1">
                                                        <CheckCircle2 size={10} /> Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="px-6 pt-5 pb-0 flex-grow text-left">
                                        <h3 className="text-lg font-black tracking-tight text-primary mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                            {service.title}
                                        </h3>

                                        <div className="flex items-center gap-1.5 mb-5">
                                            {service.avgRating ? (
                                                <div className="flex items-center gap-1">
                                                    <Star size={12} className="text-amber-500 fill-amber-500" />
                                                    <span className="text-xs font-black text-primary">{service.avgRating.toFixed(1)}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">({service.reviewCount} reviews)</span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">New Listing</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 rounded-xl border border-zinc-100 shadow-sm">
                                                <AvatarImage src={service.profiles?.image_url} />
                                                <AvatarFallback className="bg-primary/5 text-primary font-black text-xs">
                                                    {service.profiles?.full_name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-zinc-700 leading-none">
                                                    {service.profiles?.full_name || "Anonymous Helper"}
                                                </span>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                    Campus Member
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-6 mt-5 border-t border-[#F0F4F1] flex items-center justify-between">
                                        <div className="flex flex-col text-left">
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Budget</span>
                                            <span className="text-lg font-black text-primary">{service.price_range || "Flexible"}</span>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-[#F0F4F1] group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <ArrowRight size={16} />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div >
    );
}
