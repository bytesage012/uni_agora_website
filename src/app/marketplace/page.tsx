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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
            <Navbar />

            <main className="flex-grow flex flex-col">
                {showFilters && (
                    <section className="sticky top-[68px] z-30 bg-white/90 backdrop-blur-xl border-b transition-all duration-300 animate-in slide-in-from-top-4">
                        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-5">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="relative w-full md:w-[400px] lg:w-[500px] flex-shrink-0">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input
                                        placeholder="Search services on campus..."
                                        className="h-12 pl-12 pr-6 bg-white rounded-full border-zinc-200 shadow-sm focus-visible:ring-primary font-bold text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex items-center gap-2 pb-2">
                                        {categories.map((cat) => (
                                            <Button
                                                key={cat}
                                                variant={selectedCategory === cat ? "default" : "secondary"}
                                                size="sm"
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`rounded-full px-6 font-black tracking-tight h-10 ${selectedCategory === cat ? 'shadow-lg shadow-primary/20 scale-105' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
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

                <section className="flex-grow max-w-[1440px] mx-auto w-full px-6 md:px-10 py-12">
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
                            <div className="w-24 h-24 bg-zinc-100 rounded-[2rem] flex items-center justify-center text-zinc-300 mx-auto">
                                <ShoppingBag size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-primary">No results found</h2>
                                <p className="text-zinc-500 font-medium max-w-xs mx-auto">
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
                                    className="group cursor-pointer rounded-[2rem] border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                                >
                                    <CardHeader className="p-6">
                                        <div className="relative aspect-[16/10] rounded-[1.5rem] overflow-hidden bg-zinc-100 mb-4 border border-zinc-50">
                                            {service.image_url ? (
                                                <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-zinc-300">
                                                    <ShoppingBag size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <Badge variant="secondary" className="rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-white/90 backdrop-blur-sm shadow-sm border-none">
                                                    {service.category}
                                                </Badge>
                                                {service.profiles?.verification_status === 'verified' && (
                                                    <Badge className="rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-green-500/90 text-white backdrop-blur-sm shadow-sm border-none gap-1">
                                                        <CheckCircle2 size={10} /> Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="px-6 py-0 flex-grow">
                                        <h3 className="text-xl font-black tracking-tight text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                                            {service.title}
                                        </h3>

                                        <div className="flex items-center gap-1.5 mb-6">
                                            {service.avgRating ? (
                                                <div className="flex items-center gap-1">
                                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                                    <span className="text-xs font-black text-primary">{service.avgRating.toFixed(1)}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">({service.reviewCount} reviews)</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New Listing</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 rounded-2xl border shadow-sm">
                                                <AvatarImage src={service.profiles?.image_url} />
                                                <AvatarFallback className="bg-primary/5 text-primary font-black">
                                                    {service.profiles?.full_name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-zinc-700 leading-none">
                                                    {service.profiles?.full_name || "Anonymous Helper"}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                    UNI-MEMBER
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-6 mt-6 border-t border-zinc-50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Budget</span>
                                            <Badge variant="secondary" className="bg-green-50 text-green-900 hover:bg-green-50 px-4 py-2 font-black text-sm rounded-xl border-none">
                                                {service.price_range || "Flexible"}
                                            </Badge>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-zinc-50 group-hover:bg-primary group-hover:text-white transition-all">
                                            <ArrowRight size={20} />
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
