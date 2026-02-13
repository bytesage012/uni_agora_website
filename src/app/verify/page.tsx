"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Upload,
    FileText,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Info
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function VerifyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validation: Max 5MB, PDF or Images
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB.");
            return;
        }

        const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Only PDF, JPEG, or PNG files are accepted.");
            return;
        }

        setFile(selectedFile);
        setError(null);

        // Generate preview for images
        if (selectedFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setFilePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a document to upload.");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            // 1. Upload to Storage
            const timestamp = Date.now();
            const fileName = `${timestamp}-${file.name.replace(/\s/g, "_")}`;
            const filePath = `verifications/${session.user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("uniagora")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("uniagora")
                .getPublicUrl(filePath);

            // 2. Update Profile
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    verification_document_url: publicUrl,
                    verification_status: "pending"
                })
                .eq("id", session.user.id);

            if (updateError) {
                // Handle missing column error gracefully for the user
                if (updateError.code === "PGRST204") {
                    throw new Error("The database needs an update to support document uploads. Please contact the administrator.");
                }
                throw updateError;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/profile");
            }, 3000);

        } catch (err: any) {
            console.error("Error in verification upload:", err);
            setError(err.message || "Failed to submit for verification. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-2xl">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold transition-colors mb-8 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Profile
                </Link>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-border-soft overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>

                    <div className="mb-10 text-center">
                        <div className="w-20 h-20 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={40} />
                        </div>
                        <h1 className="text-4xl font-black text-primary mb-2">Get Verified</h1>
                        <p className="text-zinc-500 font-medium text-lg">Build trust with the campus community</p>
                    </div>

                    <div className="mb-8 p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10 flex gap-4">
                        <Info className="text-primary shrink-0" size={24} />
                        <div className="text-sm">
                            <p className="font-bold text-primary mb-1 uppercase tracking-wider">Instructions</p>
                            <p className="text-primary/70 font-medium leading-relaxed">
                                Upload a clear image or PDF of your **University ID card** or **Course Form**.
                                Our team will review it within 24-48 hours.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-3">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-primary mb-2">Submission Received!</h2>
                            <p className="text-zinc-500 font-medium mb-8">
                                Your documents are being reviewed. Redirecting you to your profile...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-black text-primary uppercase tracking-widest ml-1">
                                    Identity Document
                                </label>

                                <div
                                    onClick={() => document.getElementById('doc-upload')?.click()}
                                    className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group
                                        ${file ? 'border-primary/50 bg-primary/5' : 'border-zinc-200 hover:border-primary/30 hover:bg-zinc-50'}`}
                                >
                                    <input
                                        type="file"
                                        id="doc-upload"
                                        className="hidden"
                                        accept=".pdf,image/*"
                                        onChange={handleFileChange}
                                    />

                                    {filePreview ? (
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-white shadow-xl">
                                            <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <p className="text-white font-bold text-sm">Change File</p>
                                            </div>
                                        </div>
                                    ) : file ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary">
                                                <FileText size={32} />
                                            </div>
                                            <div>
                                                <p className="font-black text-primary">{file.name}</p>
                                                <p className="text-xs text-zinc-400 font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Upload size={32} />
                                            </div>
                                            <div>
                                                <p className="font-black text-primary">Click to upload document</p>
                                                <p className="text-xs text-zinc-400 font-bold mt-1 uppercase tracking-widest">PDF, JPG, or PNG (Max 5MB)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !file}
                                className="w-full py-5 bg-primary text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:bg-green-900 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit for Verification
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
