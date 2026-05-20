"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    MessageCircle,
    ShieldCheck,
    Loader2,
    AlertCircle,
    Tag,
    DollarSign,
    Info,
    Pencil,
    Star,
    Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
    full_name: string;
    phone_number: string;
    university: string;
    verification_status: string;
    image_url?: string;
}

interface Service {
    id: string;
    title: string;
    category: string;
    description: string;
    price_range: string;
    image_url?: string;
    user_id: string;
    profiles: Profile & { id: string };
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles: {
        full_name: string;
        image_url?: string;
    };
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
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col justify-between p-12 text-white relative overflow-hidden select-none min-h-[360px] rounded-[2.5rem]`}>
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/20 rounded-full blur-2xl"></div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full w-fit">
                UniAGORA Verified
            </span>

            <div className="space-y-2 z-10 text-left">
                <p className="text-xs font-bold tracking-wider opacity-60 uppercase">Campus Marketplace Listing</p>
                <p className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">{category}</p>
            </div>
        </div>
    );
}

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [service, setService] = useState<Service | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchServiceDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setCurrentUser(session?.user ?? null);

                const { data, error: fetchError } = await supabase
                    .from("services")
                    .select(`
                        *,
                        profiles (
                          id,
                          full_name,
                          phone_number,
                          university,
                          verification_status,
                          image_url
                        )
                    `)
                    .eq("id", resolvedParams.id)
                    .single();

                if (fetchError) throw fetchError;

                setService({
                    ...data,
                    profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
                });

                const { data: reviewsData, error: reviewsError } = await supabase
                    .from("service_reviews")
                    .select(`
                        *,
                        profiles (
                            full_name,
                            image_url
                        )
                    `)
                    .eq("service_id", resolvedParams.id)
                    .order("created_at", { ascending: false });

                if (!reviewsError) {
                    setReviews(reviewsData.map(r => ({
                        ...r,
                        profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
                    })));
                }

            } catch (err) {
                console.error("Error fetching service detail:", err);
                const errorMessage = err instanceof Error ? err.message : "listing issue";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceDetail();
    }, [resolvedParams.id]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return toast.error("Please login to leave a review.");
        if (newComment.trim().length < 5) return toast.error("Comment must be at least 5 characters.");

        setSubmittingReview(true);
        try {
            const { error: reviewError } = await supabase
                .from("service_reviews")
                .insert({
                    service_id: resolvedParams.id,
                    user_id: currentUser.id,
                    rating: newRating,
                    comment: newComment
                });

            if (reviewError) throw reviewError;

            const { data: reviewsData } = await supabase
                .from("service_reviews")
                .select(`*, profiles(full_name, image_url)`)
                .eq("service_id", resolvedParams.id)
                .order("created_at", { ascending: false });

            if (reviewsData) {
                setReviews(reviewsData.map(r => ({
                    ...r,
                    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
                })));
            }
            setNewComment("");
            setNewRating(5);
            toast.success("Review posted successfully!");
        } catch (err) {
            console.error("Error submitting review:", err);
            toast.error("Could not submit review. (Did you already review this?)");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#F8FAF7]">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen flex flex-col bg-[#F8FAF7]">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-4">
                    <Card className="max-w-md w-full p-10 rounded-[3rem] shadow-xl text-center border-none bg-white">
                        <AlertCircle className="mx-auto text-red-500 mb-6" size={56} />
                        <CardTitle className="text-xl font-black text-primary mb-3">Listing Not Found</CardTitle>
                        <CardDescription className="text-zinc-500 font-semibold mb-8">
                            {error || "The service you are looking for is no longer available or was removed."}
                        </CardDescription>
                        <Button asChild className="h-12 px-8 rounded-xl shadow-lg">
                            <Link href="/marketplace">
                                <ArrowLeft size={16} className="mr-2" /> Back to Marketplace
                            </Link>
                        </Button>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAF7] font-sans text-[#002217]">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 md:px-12 pt-10 pb-32 max-w-6xl">
                <Button variant="ghost" asChild className="mb-10 font-bold text-zinc-500 hover:text-primary gap-2 hover:bg-[#F0F4F1] rounded-xl px-4 py-2">
                    <Link href="/marketplace">
                        <ArrowLeft size={16} /> Back to Marketplace
                    </Link>
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="rounded-[2.5rem] border border-[#E2EAE4] shadow-sm overflow-hidden bg-white">
                            <div className="p-6 md:p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-[#F0F4F1] text-primary hover:bg-[#F0F4F1] font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border-none">
                                        {service.category}
                                    </Badge>
                                    {service.profiles?.verification_status === 'verified' && (
                                        <Badge className="bg-green-500 text-white hover:bg-green-500 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border-none gap-1">
                                            <CheckCircle2 size={10} /> Verified Seller
                                        </Badge>
                                    )}
                                </div>

                                {service.image_url ? (
                                    <div className="w-full aspect-[16/9] rounded-[2rem] overflow-hidden shadow-inner border border-zinc-100 bg-[#F8FAF7]">
                                        <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <CategoryPlaceholder category={service.category} />
                                )}

                                <div className="space-y-4">
                                    <CardTitle className="text-3xl md:text-4xl font-black text-primary leading-tight">
                                        {service.title}
                                    </CardTitle>

                                    <div className="flex flex-wrap gap-3">
                                        <Badge variant="outline" className="h-9 px-4 rounded-xl border-zinc-200 text-primary font-black gap-2 text-xs">
                                            <DollarSign size={14} /> Budget: {service.price_range}
                                        </Badge>
                                        <Badge variant="outline" className="h-9 px-4 rounded-xl border-zinc-200 text-zinc-500 font-black gap-2 text-xs">
                                            <Tag size={14} /> Category: {service.category}
                                        </Badge>
                                        {avgRating && (
                                            <Badge className="h-9 px-4 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-50 border border-amber-100 gap-2 text-xs">
                                                <Star size={14} className="fill-amber-500 text-amber-500" />
                                                {avgRating} <span className="text-amber-500/50 text-[10px]">({reviews.length})</span>
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <Separator className="bg-[#E2EAE4]" />

                                <div className="space-y-4">
                                    <h2 className="text-lg font-black text-primary flex items-center gap-2 uppercase tracking-wider text-[10px] text-zinc-400">
                                        <Info size={16} className="text-primary" /> Listing Description
                                    </h2>
                                    <p className="text-zinc-700 leading-relaxed font-semibold whitespace-pre-wrap text-base">
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Reviews Section */}
                        <div className="space-y-8 pt-8">
                            <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                                <Star className="text-amber-500 fill-amber-500" size={24} />
                                Reviews
                                <span className="text-zinc-400 text-base font-bold">({reviews.length})</span>
                            </h2>

                            {/* Review Form */}
                            {currentUser && currentUser.id !== service.user_id && (
                                <Card className="bg-white rounded-[2rem] p-6 border border-[#E2EAE4] shadow-sm relative overflow-hidden">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Avatar className="h-10 w-10 rounded-xl shadow-sm border border-zinc-100">
                                            <AvatarFallback className="bg-primary/5 text-primary font-black">
                                                {currentUser.email?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left">
                                            <p className="font-black text-primary text-sm">Leave Feedback</p>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewRating(star)}
                                                        className="transition-transform active:scale-90"
                                                    >
                                                        <Star
                                                            size={16}
                                                            className={star <= newRating ? "text-amber-500 fill-amber-500" : "text-zinc-300"}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <Textarea
                                            className="w-full p-4 bg-[#F8FAF7] border-zinc-200/80 rounded-xl focus:ring-primary/20 min-h-[100px] font-semibold text-sm"
                                            placeholder="Write an honest comment about your transactions with this student..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <Button
                                            disabled={submittingReview}
                                            className="h-11 px-6 rounded-xl shadow-md font-black text-xs uppercase tracking-wider"
                                        >
                                            {submittingReview ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                            Submit Review
                                        </Button>
                                    </form>
                                </Card>
                            )}

                            {/* Reviews List */}
                            <ScrollArea className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-[2rem] border border-zinc-200/50">
                                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No reviews posted yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="flex gap-4 pb-6 border-b border-[#F0F4F1] last:border-0 items-start text-left bg-white p-6 rounded-[2rem] border border-[#E2EAE4]/60 shadow-sm">
                                                <Avatar className="h-10 w-10 rounded-xl border border-zinc-100 bg-[#F8FAF7]">
                                                    <AvatarImage src={review.profiles.image_url} />
                                                    <AvatarFallback className="bg-primary/5 text-primary font-black text-sm">
                                                        {review.profiles.full_name?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-grow space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-black text-primary text-sm">{review.profiles.full_name}</h4>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star key={s} size={10} className={s <= review.rating ? "text-amber-500 fill-amber-500" : "text-zinc-200"} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-zinc-600 font-semibold text-sm leading-relaxed">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="rounded-[2.5rem] border border-[#E2EAE4] shadow-sm overflow-hidden sticky top-28 bg-white">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="relative mb-4 mt-2">
                                    <Avatar className="w-20 h-20 rounded-[1.5rem] border-4 border-[#F0F4F1] shadow-md">
                                        <AvatarImage src={service.profiles.image_url} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
                                            {service.profiles.full_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {service.profiles.verification_status === "verified" && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center border border-zinc-100">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-black text-primary leading-tight">{service.profiles.full_name}</h3>
                                <Badge variant="secondary" className={`text-[8px] font-black uppercase tracking-widest rounded-md mt-2 px-2.5 py-0.5 ${service.profiles.verification_status === "verified" ? "bg-green-50 text-green-700" : "bg-[#F0F4F1] text-zinc-400"}`}>
                                    {service.profiles.verification_status === "verified" ? "Verified Student" : "Classmate"}
                                </Badge>
                                
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2 bg-[#F8FAF7] border border-zinc-200/50 px-3 py-1 rounded-full">
                                    {service.profiles.university}
                                </p>

                                <Separator className="my-6 bg-[#F0F4F1]" />

                                <div className="w-full text-left space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Budget</span>
                                        <span className="font-black text-primary text-base">{service.price_range}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Campus Security</span>
                                        <span className="text-green-600 font-black flex items-center gap-1 text-xs">
                                            <Shield size={12} /> Insured Deal
                                        </span>
                                    </div>
                                </div>

                                {currentUser?.id !== service.user_id && (
                                    <Button
                                        onClick={async () => {
                                            if (!currentUser) return toast.error("Please login to message.");
                                            if (currentUser.id === service.profiles.id) return toast.error("You can't message your own listing!");

                                            try {
                                                const { data: convId, error: rpcError } = await supabase.rpc('get_or_create_conversation', {
                                                    p_id1: currentUser.id,
                                                    p_id2: service.profiles.id
                                                });

                                                if (rpcError) throw rpcError;
                                                if (convId) {
                                                    router.push(`/messages/${convId}`);
                                                }
                                            } catch (err) {
                                                console.error("Error starting chat:", err);
                                                toast.error("Could not start a conversation.");
                                            }
                                        }}
                                        className="w-full h-12 bg-primary text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-primary/10 gap-2 mb-4"
                                    >
                                        <MessageCircle size={18} />
                                        Message Merchant
                                    </Button>
                                )}

                                {currentUser?.id === service.user_id && (
                                    <Button asChild className="w-full h-12 bg-zinc-900 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:bg-black gap-2 mb-4">
                                        <Link href={`/edit-service/${service.id}`}>
                                            <Pencil size={16} /> Edit Listing
                                        </Link>
                                    </Button>
                                )}

                                <Alert className="bg-amber-50/60 border-amber-100 text-amber-900 rounded-[1.5rem] text-left p-4">
                                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-[10px] font-black uppercase tracking-wider mb-1">Campus Safety Guidelines</AlertTitle>
                                    <AlertDescription className="text-[10px] font-semibold leading-normal text-amber-800">
                                        Meet only in public, well-lit campus zones (e.g., student unions or libraries). Deliver and inspect before paying.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>

                            <CardFooter className="bg-[#F8FAF7] border-t border-[#F0F4F1] p-4 flex justify-center">
                                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <Shield size={12} className="text-primary" /> Verified Student Merchant Listing
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Contact Button */}
            {currentUser?.id !== service.user_id && (
                <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
                    <Button
                        onClick={async () => {
                            if (!currentUser) return router.push("/login");
                            try {
                                const { data: convId, error: rpcError } = await supabase.rpc('get_or_create_conversation', {
                                    p_id1: currentUser.id,
                                    p_id2: service.profiles.id
                                });
                                if (rpcError) throw rpcError;
                                if (convId) router.push(`/messages/${convId}`);
                            } catch {
                                toast.error("Could not contact merchant.");
                            }
                        }}
                        className="w-full h-14 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl border-4 border-white gap-2"
                    >
                        <MessageCircle size={20} /> Message Merchant
                    </Button>
                </div>
            )}

            <Footer />
        </div>
    );
}
