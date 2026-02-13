"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Phone,
    MapPin,
    Save,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        university: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, phone_number, university")
                .eq("id", session.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                setError("Could not load profile data.");
            } else if (data) {
                // Strip +234 for editing if it exists
                let displayPhone = data.phone_number || "";
                if (displayPhone.startsWith("+234")) {
                    displayPhone = "0" + displayPhone.substring(4);
                }

                setFormData({
                    fullName: data.full_name || "",
                    phoneNumber: displayPhone,
                    university: data.university || "",
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, [router]);

    const validatePhone = (phone: string) => {
        // Basic check for 11 digits
        return /^\d{11}$/.test(phone);
    };

    const formatPhoneNumber = (phone: string) => {
        let formatted = phone;
        if (formatted.startsWith("0")) {
            formatted = formatted.substring(1);
        }
        return `+234${formatted}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        if (!validatePhone(formData.phoneNumber)) {
            setError("Please enter a valid 11-digit phone number.");
            setSaving(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.fullName,
                    phone_number: formatPhoneNumber(formData.phoneNumber),
                    university: formData.university,
                })
                .eq("id", session.user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setError(err.message || "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
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
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold transition-colors mb-8 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-border-soft">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-primary mb-2">Edit Profile</h1>
                        <p className="text-zinc-500 font-medium text-lg">Update your personal information</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-3">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-bold rounded-2xl flex items-center gap-3 animate-bounce">
                            <CheckCircle2 size={18} className="shrink-0" />
                            Profile Updated Successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                <User size={16} /> Full Name
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="Your full name"
                                className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                <Phone size={16} /> Phone Number
                            </label>
                            <input
                                required
                                type="tel"
                                placeholder="e.g. 08123456789"
                                className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest ml-1">
                                MUST BE 11 DIGITS. USED FOR CAMPUS-WIDE CONTACT.
                            </p>
                        </div>

                        {/* University */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                <MapPin size={16} /> University
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. University of Ilorin"
                                className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving || success}
                            className="w-full py-5 bg-primary text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:bg-green-900 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} /> Processing...
                                </>
                            ) : (
                                <>
                                    <Save size={24} /> Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
