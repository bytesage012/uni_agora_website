"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    School,
    ShieldCheck,
    Briefcase,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Camera,
    Link,
    X,
    Upload
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface UserProfile {
    id: string;
    full_name: string;
    university: string;
    is_freelancer: boolean;
    verification_status: string;
    email?: string;
    image_url?: string;
    verification_document_url?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/login");
                    return;
                }

                const { data, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (profileError) throw profileError;

                setProfile({
                    ...data,
                    email: session.user.email
                });
            } catch (err) {
                console.error("Error fetching profile:", err);
                const message = err instanceof Error ? err.message : "Could not load your profile. Please try again.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleBecomeFreelancer = async () => {
        if (!profile) return;
        setUpdating(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ is_freelancer: true })
                .eq("id", profile.id);

            if (updateError) throw updateError;

            setProfile({ ...profile, is_freelancer: true });
            // Redirect to dashboard to see new options
            router.push("/dashboard");
        } catch (err) {
            console.error("Error updating freelancer status:", err);
            const message = err instanceof Error ? err.message : "Failed to update status. Please try again.";
            setError(message);
        } finally {
            setUpdating(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        if (file.size > 2 * 1024 * 1024) {
            setError("Image size must be less than 2MB");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const timestamp = Date.now();
            const fileName = `${timestamp}-${file.name.replace(/\s/g, "_")}`;
            const filePath = `profiles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("uniagora")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("uniagora")
                .getPublicUrl(filePath);

            // Update profile record
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ image_url: publicUrl })
                .eq("id", profile.id);

            if (updateError) throw updateError;

            setProfile({ ...profile, image_url: publicUrl });
            setImagePreview(publicUrl);
        } catch (err) {
            console.error("Error uploading profile image:", err);
            setError("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
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

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col bg-zinc-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
                        <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
                        <h1 className="text-2xl font-black text-primary mb-4">Error</h1>
                        <p className="text-zinc-500 font-medium mb-8">{error || "Profile not found."}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all"
                        >
                            Retry
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-primary mb-2">User Profile</h1>
                    <p className="text-zinc-500 font-medium">Manage your personal information and campus status</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-border-soft">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-10 border-b border-zinc-50">
                                <div className="relative group">
                                    <div className="w-32 h-32 bg-primary/5 text-primary rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                                        {profile.image_url ? (
                                            <img src={profile.image_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={64} />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="animate-spin text-primary" size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => document.getElementById('profile-upload')?.click()}
                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all border-4 border-white"
                                        title="Change profile picture"
                                    >
                                        <Camera size={18} />
                                    </button>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </div>

                                <div className="text-center md:text-left mt-4 md:mt-0">
                                    <h2 className="text-3xl font-black text-primary mb-1">{profile.full_name}</h2>
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 font-bold text-sm uppercase tracking-tight mb-4">
                                        <CheckCircle2 size={16} className={profile.verification_status === 'verified' ? "text-primary" : "text-zinc-300"} />
                                        <span>{profile.is_freelancer ? "Freelancer Member" : "Student Member"}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <Link
                                            href="/edit-profile"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95 text-sm"
                                        >
                                            Edit Account Info
                                        </Link>

                                        {profile.verification_status !== 'verified' && (
                                            <Link
                                                href="/verify"
                                                className={`inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all active:scale-95 text-sm
                                                    ${profile.verification_status === 'pending'
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-100 cursor-default'
                                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                                            >
                                                {profile.verification_status === 'pending' ? (
                                                    <><Loader2 size={16} className="animate-spin" /> Pending Review</>
                                                ) : (
                                                    <><ShieldCheck size={16} /> Get Verified</>
                                                )}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</p>
                                        <p className="font-bold text-primary">{profile.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                                        <School size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">University</p>
                                        <p className="font-bold text-primary">{profile.university}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">verification Status</p>
                                        <p className="font-bold text-primary uppercase">
                                            {profile.verification_status || "Active Member"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Freelancer Onboarding */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border-soft">
                            <div className="w-16 h-16 bg-accent/5 text-accent rounded-2xl flex items-center justify-center mb-6">
                                <Briefcase size={32} />
                            </div>

                            {profile.is_freelancer ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-black text-primary mb-2">Freelancer Active</h3>
                                        <p className="text-zinc-500 text-sm font-medium">You are currently listed as a freelancer on UniAGORA. You can manage your services from the dashboard.</p>
                                    </div>
                                    <button
                                        onClick={() => router.push("/my-services")}
                                        className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                                    >
                                        Manage My Services <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-black text-primary mb-2">Start Selling</h3>
                                        <p className="text-zinc-500 text-sm font-medium">Want to offer your skills to other students? Become a freelancer today!</p>
                                    </div>
                                    <button
                                        disabled={updating}
                                        onClick={handleBecomeFreelancer}
                                        className="w-full py-4 bg-accent text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 transition-all"
                                    >
                                        {updating ? <Loader2 className="animate-spin" size={24} /> : "Become a Freelancer"}
                                    </button>
                                    <p className="text-[10px] text-zinc-400 font-bold text-center italic">
                                        By joining, you agree to our Community Guidelines.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
