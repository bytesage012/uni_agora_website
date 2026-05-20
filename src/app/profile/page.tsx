"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
                const message = err instanceof Error ? err.message : "Could not load your profile.";
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
            toast.success("You are now a freelancer!");
            router.push("/dashboard");
        } catch (err) {
            console.error("Error updating freelancer status:", err);
            toast.error("Failed to update status.");
        } finally {
            setUpdating(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size must be less than 2MB");
            return;
        }

        setUploading(true);
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

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ image_url: publicUrl })
                .eq("id", profile.id);

            if (updateError) throw updateError;

            setProfile({ ...profile, image_url: publicUrl });
            toast.success("Profile picture updated!");
        } catch (err) {
            console.error("Error uploading profile image:", err);
            toast.error("Failed to upload image.");
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
                    <Card className="max-w-md w-full p-12 rounded-[2.5rem] shadow-xl text-center border-none">
                        <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
                        <CardTitle className="text-2xl font-black text-primary mb-4">Error</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium mb-8">{error || "Profile not found."}</CardDescription>
                        <Button onClick={() => window.location.reload()} className="h-12 px-8 rounded-2xl shadow-lg">
                            Retry
                        </Button>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-primary mb-2">User Profile</h1>
                    <p className="text-zinc-500 font-medium text-lg">Manage your personal information and campus status</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="md:col-span-2 space-y-8">
                        <Card className="rounded-[2.5rem] shadow-sm border-border-soft overflow-hidden">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-12 pb-12 border-b">
                                    <div className="relative group">
                                        <Avatar className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl bg-primary/5">
                                            <AvatarImage src={profile.image_url} className="object-cover" />
                                            <AvatarFallback className="text-primary">
                                                <User size={64} />
                                            </AvatarFallback>
                                        </Avatar>
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem]">
                                                <Loader2 className="animate-spin text-primary" size={32} />
                                            </div>
                                        )}
                                        <Button
                                            size="icon"
                                            className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 active:scale-90 transition-all border-4 border-white"
                                            onClick={() => document.getElementById('profile-upload')?.click()}
                                            disabled={uploading}
                                        >
                                            <Camera size={18} />
                                        </Button>
                                        <input
                                            type="file"
                                            id="profile-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>

                                    <div className="text-center md:text-left">
                                        <h2 className="text-3xl font-black text-primary mb-2 leading-tight">{profile.full_name}</h2>
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                                            <Badge variant={profile.verification_status === 'verified' ? "default" : "secondary"} className="font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg gap-1.5 border-none">
                                                {profile.verification_status === 'verified' ? <CheckCircle2 size={12} /> : null}
                                                {profile.is_freelancer ? "Freelancer Member" : "Student Member"}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                            <Button variant="secondary" asChild className="rounded-xl font-bold px-6 border-none bg-zinc-100 hover:bg-zinc-200">
                                                <Link href="/edit-profile">
                                                    Edit Account Info
                                                </Link>
                                            </Button>

                                            {profile.verification_status !== 'verified' && (
                                                <Button
                                                    asChild={profile.verification_status !== 'pending'}
                                                    variant={profile.verification_status === 'pending' ? "outline" : "default"}
                                                    className={`rounded-xl font-bold px-6 ${profile.verification_status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50' : 'shadow-lg shadow-primary/20'}`}
                                                >
                                                    {profile.verification_status === 'pending' ? (
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 size={16} className="animate-spin" /> Pending Review
                                                        </div>
                                                    ) : (
                                                        <Link href="/verify">
                                                            <ShieldCheck size={16} className="mr-2" /> Get Verified
                                                        </Link>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-zinc-50 rounded-[1.25rem] flex items-center justify-center text-zinc-400 border border-zinc-100">
                                            <Mail size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</p>
                                            <p className="font-bold text-primary text-lg">{profile.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-zinc-50 rounded-[1.25rem] flex items-center justify-center text-zinc-400 border border-zinc-100">
                                            <School size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">University</p>
                                            <p className="font-bold text-primary text-lg">{profile.university}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-zinc-50 rounded-[1.25rem] flex items-center justify-center text-zinc-400 border border-zinc-100">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Verification Status</p>
                                            <Badge variant="outline" className="font-black text-xs uppercase tracking-widest px-3 py-1 rounded-lg border-zinc-200 text-primary">
                                                {profile.verification_status || "Active Member"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Freelancer Onboarding */}
                    <div className="space-y-6">
                        <Card className="rounded-[2.5rem] shadow-sm border-border-soft overflow-hidden p-8">
                            <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/5">
                                <Briefcase size={32} />
                            </div>

                            {profile.is_freelancer ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl font-black text-primary">Freelancer Active</CardTitle>
                                        <CardDescription className="text-zinc-500 font-medium leading-relaxed">
                                            You are currently listed as a freelancer. Manage your campus services from your dashboard.
                                        </CardDescription>
                                    </div>
                                    <Button asChild className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 font-black text-lg">
                                        <Link href="/my-services">
                                            Manage My Services <ChevronRight size={20} className="ml-1" />
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl font-black text-primary">Start Selling</CardTitle>
                                        <CardDescription className="text-zinc-500 font-medium leading-relaxed">
                                            Want to offer your skills to other students? Become a freelancer and start earning today!
                                        </CardDescription>
                                    </div>
                                    <Button
                                        disabled={updating}
                                        onClick={handleBecomeFreelancer}
                                        className="w-full h-14 bg-zinc-900 text-white rounded-2xl shadow-xl hover:bg-black font-black text-lg"
                                    >
                                        {updating ? <Loader2 className="animate-spin mr-2" /> : null}
                                        Become a Freelancer
                                    </Button>
                                    <p className="text-[10px] text-zinc-400 font-bold text-center italic tracking-tight">
                                        By joining, you agree to our community guidelines.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
