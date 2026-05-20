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
            <div className="min-h-screen flex flex-col bg-zinc-50">
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
            <div className="min-h-screen flex flex-col bg-zinc-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-4">
                    <Card className="max-w-md w-full p-12 rounded-[2.5rem] shadow-xl text-center border-none">
                        <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
                        <CardTitle className="text-2xl font-black text-primary mb-4">Listing Not Found</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium mb-8">
                            {error || "The service you are looking for is no longer available."}
                        </CardDescription>
                        <Button asChild className="h-12 px-8 rounded-2xl shadow-lg">
                            <Link href="/marketplace">
                                <ArrowLeft size={20} className="mr-2" /> Back to Marketplace
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
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 pt-12 pb-32 md:pb-20 max-w-5xl">
                <Button variant="ghost" asChild className="mb-12 font-bold text-zinc-500 hover:text-primary gap-2">
                    <Link href="/marketplace">
                        <ArrowLeft size={20} /> Back to Marketplace
                    </Link>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <Card className="rounded-[2.5rem] shadow-sm border-border-soft overflow-hidden">
                            <CardHeader className="p-8 md:p-12">
                                <div className="mb-6 flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-zinc-100 text-primary hover:bg-zinc-100 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl border-none">
                                        {service.category}
                                    </Badge>
                                    {service.profiles?.verification_status === 'verified' && (
                                        <Badge className="bg-green-500 text-white hover:bg-green-500 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl border-none gap-1.5">
                                            <CheckCircle2 size={12} /> Verified Seller
                                        </Badge>
                                    )}
                                </div>

                                {service.image_url && (
                                    <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-8 shadow-inner border border-zinc-100 bg-zinc-50">
                                        <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <CardTitle className="text-4xl font-black text-primary mb-6 leading-tight">
                                    {service.title}
                                </CardTitle>

                                <div className="flex flex-wrap gap-4 mb-10">
                                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-zinc-200 text-primary font-bold gap-2 text-sm">
                                        <DollarSign size={18} /> {service.price_range}
                                    </Badge>
                                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-zinc-200 text-zinc-600 font-bold gap-2 text-sm">
                                        <Tag size={18} /> {service.category}
                                    </Badge>
                                    {avgRating && (
                                        <Badge className="h-10 px-4 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-100 gap-2 text-sm">
                                            <Star size={18} className="fill-amber-500 text-amber-500" />
                                            {avgRating} <span className="text-amber-500/50 text-xs">({reviews.length})</span>
                                        </Badge>
                                    )}
                                </div>

                                <Separator className="my-8" />

                                <div className="space-y-4">
                                    <h2 className="text-xl font-black text-primary flex items-center gap-2">
                                        <Info size={20} /> Description
                                    </h2>
                                    <p className="text-zinc-600 leading-relaxed font-medium whitespace-pre-wrap text-lg">
                                        {service.description}
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Reviews Section */}
                        <div className="pt-12">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-black text-primary flex items-center gap-3">
                                    <Star className="text-amber-500 fill-amber-500" size={32} />
                                    Reviews
                                    <span className="text-zinc-300 text-lg font-bold">({reviews.length})</span>
                                </h2>
                            </div>

                            {/* Review Form */}
                            {currentUser && (
                                <Card className="mb-12 bg-zinc-50 rounded-[2.5rem] p-8 border border-zinc-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <Avatar className="h-12 w-12 rounded-2xl shadow-sm border border-white">
                                            <AvatarFallback className="bg-primary/10 text-primary font-black">
                                                {currentUser.email?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-black text-primary">Leave a Review</p>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setNewRating(star)}
                                                        className="transition-transform active:scale-90"
                                                    >
                                                        <Star
                                                            size={20}
                                                            className={star <= newRating ? "text-amber-500 fill-amber-500" : "text-zinc-300"}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <form onSubmit={handleReviewSubmit} className="space-y-4 relative z-10">
                                        <Textarea
                                            className="w-full p-6 bg-white border-zinc-100 rounded-[1.5rem] focus:ring-primary/20 min-h-[120px] font-medium"
                                            placeholder="Share your experience with this freelancer..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <Button
                                            disabled={submittingReview}
                                            className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 font-black"
                                        >
                                            {submittingReview ? <Loader2 className="animate-spin mr-2" /> : null}
                                            Post Review
                                        </Button>
                                    </form>
                                </Card>
                            )}

                            {/* Reviews List */}
                            <ScrollArea className="space-y-8">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-12 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100">
                                        <p className="text-zinc-400 font-bold uppercase tracking-widest">No reviews yet. Be the first!</p>
                                    </div>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="flex gap-6 pb-8 border-b border-zinc-50 last:border-0 items-start">
                                            <Avatar className="h-14 w-14 rounded-2xl border bg-zinc-100">
                                                <AvatarImage src={review.profiles.image_url} />
                                                <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                                                    {review.profiles.full_name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-black text-primary">{review.profiles.full_name}</h4>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star key={s} size={12} className={s <= review.rating ? "text-amber-500 fill-amber-500" : "text-zinc-200"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-600 font-medium leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    {/* Sidebar: Freelancer Info & Conversion */}
                    <div className="space-y-6">
                        <Card className="rounded-[2rem] shadow-sm border-border-soft overflow-hidden sticky top-24 border-t-8 border-primary">
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <div className="relative mb-4">
                                        <Avatar className="w-24 h-24 rounded-[2rem] border-4 border-white shadow-xl">
                                            <AvatarImage src={service.profiles.image_url} />
                                            <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                                                {service.profiles.full_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {service.profiles.verification_status === "verified" && (
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center border border-zinc-50">
                                                <CheckCircle2 size={18} className="text-green-500" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-black text-primary leading-tight">{service.profiles.full_name}</h3>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <Badge variant="secondary" className={`text-[10px] font-black uppercase tracking-widest rounded-md ${service.profiles.verification_status === "verified" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-400"}`}>
                                            {service.profiles.verification_status === "verified" ? "Verified Freelancer" : "Member"}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                                        {service.profiles.university}
                                    </p>
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
                                        className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 gap-2 mb-4"
                                    >
                                        <MessageCircle size={24} />
                                        Message Freelancer
                                    </Button>
                                )}

                                {currentUser?.id === service.user_id && (
                                    <Button asChild className="w-full h-14 bg-zinc-900 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-black gap-2 mb-4">
                                        <Link href={`/edit-service/${service.id}`}>
                                            <Pencil size={20} /> Edit Listing
                                        </Link>
                                    </Button>
                                )}

                                <Alert className="bg-amber-50 border-amber-200 text-amber-900 rounded-2xl">
                                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                                    <AlertTitle className="text-xs font-black uppercase tracking-wider mb-1">Safety First</AlertTitle>
                                    <AlertDescription className="text-[10px] font-bold leading-relaxed">
                                        Meet in public campus areas. Pay only after service delivery.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>

                            <CardFooter className="bg-zinc-50 border-t p-6 flex flex-col items-center">
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-primary" /> Verified Student Listing
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main >

            {/* Mobile Contact Button */}
            {currentUser?.id !== service.user_id && (
                <div className="md:hidden fixed bottom-8 left-4 right-4 z-50">
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
                        className="w-full h-16 bg-primary text-white font-black text-xl rounded-[2rem] shadow-2xl border-4 border-white gap-3"
                    >
                        <MessageCircle size={28} /> Message Merchant
                    </Button>
                </div>
            )}

            <Footer />
        </div >
    );
}
