"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    ChevronLeft,
    Loader2,
    AlertCircle,
    Package,
    FileText,
    Tag,
    DollarSign,
    Upload,
    X,
    ImageIcon
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CreateServicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        priceHint: "",
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories = [
        "Graphic Design",
        "Writing",
        "Tutoring",
        "Photography",
        "Tech & Repairs"
    ];

    useEffect(() => {
        const checkSessionAndStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
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
            }
        };
        checkSessionAndStatus();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Image size must be less than 2MB");
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Get current session for user_id
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error("You must be logged in to create a service.");
            }

            // 1.5 Verify freelancer status again before submission
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_freelancer")
                .eq("id", session.user.id)
                .single();

            if (!profile?.is_freelancer) {
                throw new Error("Unauthorized: You must be a freelancer to create a service.");
            }

            // 2. Upload image if exists
            let imageUrl = null;
            if (image) {
                const timestamp = Date.now();
                const fileName = `${timestamp}-${image.name.replace(/\s/g, "_")}`;
                const filePath = `services/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("uniagora")
                    .upload(filePath, image);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("uniagora")
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // 3. Insert service
            const { error: insertError } = await supabase
                .from("services")
                .insert([
                    {
                        user_id: session.user.id,
                        title: formData.title,
                        category: formData.category,
                        description: formData.description,
                        price_range: formData.priceHint,
                        image_url: imageUrl,
                    },
                ]);

            if (insertError) throw insertError;

            // 3. Success redirect
            router.push("/my-services");
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50">
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full">
                    <Link
                        href="/my-services"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold mb-8 transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to My Services
                    </Link>

                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-premium border-premium">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                                <Package size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-primary mb-2">Launch Your Gig</h1>
                            <p className="text-zinc-500 font-medium">List your skills and start earning on campus</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-3">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Service Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <Tag size={16} /> Service Title
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Laptop Repair, Essay Writing"
                                    className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <Package size={16} /> Category
                                </label>
                                <select
                                    required
                                    className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium appearance-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <FileText size={16} /> Description
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Describe what you offer in detail (e.g. 'I can fix MacBooks and Windows laptops, replace screens, and clean internal fans.')"
                                    className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Price Hint */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <DollarSign size={16} /> Price Hint
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Starting at ₦2,000 or ₦5,000 - ₦10,000"
                                    className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                    value={formData.priceHint}
                                    onChange={(e) => setFormData({ ...formData, priceHint: e.target.value })}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <ImageIcon size={16} /> Service Image
                                </label>
                                <div
                                    className={`relative group border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer ${imagePreview ? 'border-primary/20 bg-primary/5' : 'border-zinc-200 hover:border-primary/50 bg-zinc-50/50'}`}
                                    onClick={() => document.getElementById("image-upload")?.click()}
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full shadow-lg hover:bg-white transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-zinc-400 mb-3 group-hover:text-primary transition-colors">
                                                <Upload size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-zinc-500">Click to upload an image</p>
                                            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-black">JPG, PNG (Max 2MB)</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        id="image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-xl hover:bg-green-900 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>Launch Gig <ArrowRight size={20} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
