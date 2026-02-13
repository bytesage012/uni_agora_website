"use client";

import { useEffect, useState, use } from "react";
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
    Clock,
    MapPin,
    Shield,
    Pencil,
    UserCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { Star, StarHalf } from "lucide-react";

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

    // Review Form State
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");



    useEffect(() => {
        const fetchServiceDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch User
                const { data: { session } } = await supabase.auth.getSession();
                setCurrentUser(session?.user ?? null);

                // Fetch Service
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

                // Fetch Reviews
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
        if (!currentUser) return alert("Please login to leave a review.");
        if (newComment.trim().length < 5) return alert("Comment must be at least 5 characters.");

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

            // Refresh reviews
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
        } catch (err) {
            console.error("Error submitting review:", err);
            alert("Could not submit review. (Did you already review this?)");
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
                    <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
                        <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
                        <h1 className="text-2xl font-black text-primary mb-4">Listing Not Found</h1>
                        <p className="text-zinc-500 font-medium mb-8">{error || "The service you are looking for is no longer available."}</p>
                        <Link
                            href="/marketplace"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all"
                        >
                            <ArrowLeft size={20} /> Back to Marketplace
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 pt-12 pb-32 md:pb-20 max-w-5xl">
                <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold mb-12 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Marketplace
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-border-soft">
                            <div className="mb-6 flex items-center justify-between">
                                <span className="px-4 py-1.5 bg-bg-soft text-primary-soft text-xs font-black uppercase tracking-widest rounded-xl">
                                    {service.category}
                                </span>
                                {service.profiles?.verification_status === 'verified' && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-xl border border-green-100/50">
                                        <CheckCircle2 size={12} className="fill-green-600/10" /> Verified Seller
                                    </div>
                                )}
                            </div>

                            {service.image_url && (
                                <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-8 shadow-inner border border-zinc-100 bg-zinc-50">
                                    <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <h1 className="text-4xl font-black text-primary mb-6 leading-tight">
                                {service.title}
                            </h1>

                            <div className="flex flex-wrap gap-4 mb-10">
                                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <DollarSign size={18} className="text-primary" />
                                    <span className="font-bold text-primary">{service.price_range}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <Tag size={18} className="text-primary" />
                                    <span className="font-bold text-zinc-600">{service.category}</span>
                                </div>
                                {reviews.length > 0 && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                                        <Star size={18} className="text-amber-500 fill-amber-500" />
                                        <span className="font-bold text-amber-700">
                                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                                            <span className="text-amber-500/50 text-xs ml-1">({reviews.length})</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-black text-primary flex items-center gap-2">
                                    <Info size={20} /> Description
                                </h2>
                                <p className="text-zinc-600 leading-relaxed font-medium whitespace-pre-wrap text-lg">
                                    {service.description}
                                </p>
                            </div>

                            {/* Reviews Section */}
                            <div className="mt-16 pt-12 border-t border-zinc-100">
                                <div className="flex items-center justify-between mb-10">
                                    <h2 className="text-3xl font-black text-primary flex items-center gap-3">
                                        <Star className="text-amber-500 fill-amber-500" size={32} />
                                        Reviews
                                        <span className="text-zinc-300 text-lg font-bold ml-1">({reviews.length})</span>
                                    </h2>
                                </div>

                                {/* Review Form */}
                                {currentUser && (
                                    <div className="mb-12 bg-zinc-50 rounded-[2rem] p-8 border border-zinc-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary font-black">
                                                {currentUser.email?.charAt(0).toUpperCase()}
                                            </div>
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
                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                            <textarea
                                                className="w-full p-6 bg-white border border-zinc-100 rounded-[1.5rem] outline-none focus:border-primary/20 transition-all font-medium min-h-[120px]"
                                                placeholder="Share your experience with this freelancer..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            ></textarea>
                                            <button
                                                disabled={submittingReview}
                                                className="px-8 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {submittingReview ? "Posting..." : "Post Review"}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Reviews List */}
                                <div className="space-y-8">
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-12 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100">
                                            <p className="text-zinc-400 font-bold uppercase tracking-widest">No reviews yet. Be the first!</p>
                                        </div>
                                    ) : (
                                        reviews.map((review) => (
                                            <div key={review.id} className="flex gap-6 pb-8 border-b border-zinc-50 last:border-0">
                                                <div className="w-14 h-14 bg-zinc-100 rounded-[1.25rem] overflow-hidden flex-shrink-0">
                                                    {review.profiles.image_url ? (
                                                        <img src={review.profiles.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary font-black text-xl">
                                                            {review.profiles.full_name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-black text-primary">{review.profiles.full_name}</h4>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star key={s} size={12} className={s <= review.rating ? "text-amber-500 fill-amber-500" : "text-zinc-200"} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest ml-auto">
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
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar: Freelancer Info & Conversion */}
                    <div className="space-y-6 h-fit sticky top-24">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-border-soft sticky top-24 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10"></div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 bg-primary/5 text-primary rounded-[1.5rem] flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                                        {service.profiles.image_url ? (
                                            <img src={service.profiles.image_url} alt={service.profiles.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-black">{service.profiles.full_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    {service.profiles.verification_status === "verified" && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center border border-zinc-50">
                                            <CheckCircle2 size={14} className="text-primary" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-primary leading-tight">{service.profiles.full_name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${service.profiles.verification_status === "verified" ? "bg-primary/5 text-primary" : "bg-zinc-100 text-zinc-400"}`}>
                                            {service.profiles.verification_status === "verified" ? "Verified" : "Member"}
                                        </span>
                                        <span className="text-zinc-300 text-[9px] font-bold uppercase tracking-widest">Since {new Date().getFullYear()}</span>
                                    </div>
                                </div>
                            </div>

                            {currentUser?.id !== service.user_id && (
                                <button
                                    onClick={async () => {
                                        if (!currentUser) return alert("Please login to message.");
                                        if (currentUser.id === service.profiles.id) return alert("You can't message your own listing!");

                                        setLoading(true);
                                        try {
                                            // Use the robust get_or_create_conversation RPC
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
                                            alert("Could not start a conversation. Please try again later.");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}

                                    className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/20 hover:bg-green-900 active:scale-95 transition-all flex items-center justify-center gap-2 mb-3"
                                >
                                    <MessageCircle size={18} />
                                    Start Conversation
                                </button>
                            )}

                            {currentUser?.id === service.user_id && (
                                <Link
                                    href={`/edit-service/${service.id}`}
                                    className="w-full py-3.5 bg-zinc-900 text-white font-bold text-sm rounded-2xl shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 mb-3"
                                >
                                    <Pencil size={18} />
                                    Edit Listing
                                </Link>
                            )}



                            {currentUser?.id === service.user_id && (
                                <div className="bg-zinc-100 p-4 rounded-2xl border border-zinc-200 flex items-center gap-3 mb-6">
                                    <UserCircle className="text-zinc-600" size={20} />
                                    <div>
                                        <h3 className="text-[10px] font-black text-zinc-800 uppercase tracking-wider">Owner View</h3>
                                        <p className="text-[9px] text-zinc-500 font-bold">This is your listing</p>
                                    </div>
                                </div>
                            )}

                            {/* Safety Guarantee Moved Here */}
                            {/* Safety Guarantee */}
                            <div className="bg-amber-50 p-4 rounded-2xl border-l-4 border-amber-400 flex gap-3 mb-6 shadow-sm">
                                <ShieldCheck className="text-amber-600 shrink-0" size={20} />
                                <div>
                                    <h3 className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-0.5">Safety First</h3>
                                    <p className="text-[9px] text-amber-700/80 font-bold leading-relaxed">
                                        Meet in public places. cash on delivery.
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-50 transition-colors hover:bg-white hover:border-zinc-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin size={14} className="text-primary" />
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Location</p>
                                    </div>
                                    <p className="text-xs font-black text-primary truncate" title={service.profiles.university}>
                                        {service.profiles.university}
                                    </p>
                                </div>
                            </div>

                            <p className="text-[10px] text-zinc-400 font-bold text-center mt-6 uppercase tracking-widest flex items-center justify-center gap-2">
                                <ShieldCheck size={12} className="text-primary" /> End-to-End Secure
                            </p>
                        </div>
                    </div>
                </div>
            </main >

            {/* Fixed bottom for mobile */}
            {currentUser?.id !== service.user_id && (
                < div className="md:hidden fixed bottom-10 left-4 right-4 z-50" >
                    <button
                        onClick={async () => {
                            if (!currentUser) return router.push("/login");
                            try {
                                const { data: convId, error: rpcError } = await supabase.rpc('get_or_create_conversation', {
                                    p_id1: currentUser.id,
                                    p_id2: service.profiles.id
                                });
                                if (rpcError) throw rpcError;
                                if (convId) {
                                    router.push(`/messages/${convId}`);
                                }
                            } catch {
                                alert("Could not contact merchant. Please check your connection.");
                            }
                        }}
                        className="w-full py-6 bg-primary text-white font-black text-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(79,70,229,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white"
                    >
                        <MessageCircle size={28} /> Message Merchant
                    </button>
                </div >
            )}

            <Footer />
        </div >
    );
}
