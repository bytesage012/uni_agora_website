"use client";

import { useState, useEffect, use } from "react";
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
    ImageIcon,
    Save
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        priceHint: "",
    });
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
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
        const fetchServiceAndVerifyOwner = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/login");
                    return;
                }

                const { data: service, error: fetchError } = await supabase
                    .from("services")
                    .select("*")
                    .eq("id", resolvedParams.id)
                    .single();

                if (fetchError || !service) {
                    throw new Error("Listing not found.");
                }

                if (service.user_id !== session.user.id) {
                    router.push("/marketplace");
                    return;
                }

                setFormData({
                    title: service.title,
                    category: service.category,
                    description: service.description,
                    priceHint: service.price_range,
                });
                setExistingImageUrl(service.image_url);
                setImagePreview(service.image_url);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Security access issue.");
            } finally {
                setLoading(false);
            }
        };

        fetchServiceAndVerifyOwner();
    }, [resolvedParams.id, router]);

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
        setSaving(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Please log in.");

            // 1. Upload new image if exists
            let imageUrl = existingImageUrl;
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

            // 2. Update service
            const { error: updateError } = await supabase
                .from("services")
                .update({
                    title: formData.title,
                    category: formData.category,
                    description: formData.description,
                    price_range: formData.priceHint,
                    image_url: imageUrl,
                })
                .eq("id", resolvedParams.id)
                .eq("user_id", session.user.id); // Extra safety

            if (updateError) throw updateError;

            router.push(`/service/${resolvedParams.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update listing.");
        } finally {
            setSaving(false);
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

            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full">
                    <Link
                        href={`/service/${resolvedParams.id}`}
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold mb-8 transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Cancel Editing
                    </Link>

                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-premium border-premium">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center text-white mx-auto mb-6">
                                <FileText size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-primary mb-2">Refine Your Listing</h1>
                            <p className="text-zinc-500 font-medium">Keep your service details fresh and attractive</p>
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
                                    className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                    value={formData.priceHint}
                                    onChange={(e) => setFormData({ ...formData, priceHint: e.target.value })}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                    <ImageIcon size={16} /> Update Image (Optional)
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
                                                    setImagePreview(existingImageUrl);
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
                                            <p className="text-sm font-bold text-zinc-500">Click to change image</p>
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
                                disabled={saving}
                                type="submit"
                                className="w-full py-5 bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {saving ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>Update Listing <Save size={20} /></>
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
