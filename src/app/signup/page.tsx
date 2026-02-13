"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        whatsappNumber: "",
        password: "",
    });

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push("/dashboard");
            }
        };
        checkAuth();
    }, [router]);

    // Validation
    const validatePhone = (phone: string) => {
        // Exactly 11 digits
        return /^\d{11}$/.test(phone);
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const formatPhoneNumber = (phone: string) => {
        let formatted = phone;
        if (formatted.startsWith("0")) {
            formatted = formatted.substring(1);
        }
        return `+234${formatted}`;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Initial Validation
        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        if (!validatePhone(formData.whatsappNumber)) {
            setError("WhatsApp number must be exactly 11 digits.");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password too short.");
            setLoading(false);
            return;
        }

        try {
            // 1. Supabase Auth Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Insert into profiles table
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert([
                        {
                            id: authData.user.id,
                            full_name: formData.fullName,
                            phone_number: formatPhoneNumber(formData.whatsappNumber),
                            university: "Unspecified University", // General default
                            is_freelancer: false,
                        },
                    ]);

                if (profileError) throw profileError;

                setSuccess(true);
                // Redirect after delay
                setTimeout(() => {
                    router.push("/dashboard");
                }, 3000);
            }
        } catch (err) {
            let message = "An unexpected error occurred.";
            if (err instanceof Error) {
                message = err.message;
                if (message.includes("User already registered")) {
                    message = "This email is already used. Try logging in.";
                }
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
                <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl border border-border-soft text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-primary">Welcome Aboard!</h2>
                    <p className="text-zinc-600 font-medium leading-relaxed">
                        Your account has been created successfully. Ready to dive into the campus economy?
                    </p>
                    <div className="pt-4 flex flex-col gap-4">
                        <Link
                            href="/dashboard"
                            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-center"
                        >
                            Go to Dashboard
                        </Link>
                        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm font-bold">
                            <Loader2 className="animate-spin" size={16} />
                            Auto-redirecting...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 py-12">
            {/* Logo Link back to home */}
            <Link href="/" className="mb-8 flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white">
                    <ShieldCheck size={24} />
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter italic">UniAGORA</span>
            </Link>

            <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border-soft">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-primary mb-2">Join the Campus Economy</h1>
                    <p className="text-zinc-500 font-medium">Create your verified student account</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-3">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary ml-1">Full Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Musa Ibrahim"
                            className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary ml-1">Email Address</label>
                        <input
                            required
                            type="email"
                            placeholder="student@university.edu.ng"
                            className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* WhatsApp Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary ml-1">WhatsApp Number</label>
                        <input
                            required
                            type="tel"
                            maxLength={11}
                            placeholder="080..."
                            className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all"
                            value={formData.whatsappNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setFormData({ ...formData, whatsappNumber: value });
                            }}
                        />
                        <p className="text-[11px] font-bold text-zinc-400 ml-1 uppercase tracking-wider">
                            Used for clients to contact you
                        </p>
                    </div>

                    {/* University (Locked) */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary ml-1">University</label>
                        <input
                            type="text"
                            placeholder="e.g. University of Lagos"
                            className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all"
                            onChange={(e) => setFormData({ ...formData, ...{ university: e.target.value } })}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary ml-1">Password</label>
                        <div className="relative">
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all pr-12"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Legal Checkbox */}
                    <div className="flex items-start gap-3 py-2">
                        <input
                            id="legal"
                            type="checkbox"
                            className="mt-1 w-5 h-5 accent-primary cursor-pointer"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <label htmlFor="legal" className="text-xs text-zinc-600 leading-relaxed cursor-pointer select-none">
                            I agree to the{" "}
                            <Link href="/terms" target="_blank" className="text-primary font-bold hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/community-guidelines" target="_blank" className="text-primary font-bold hover:underline">
                                Community Guidelines
                            </Link>.
                        </label>
                    </div>

                    {/* Buttons */}
                    <button
                        disabled={!agreed || loading}
                        type="submit"
                        className="w-full py-5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-xl hover:bg-green-900 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : (
                            <>Create Account <ArrowRight size={20} /></>
                        )}
                    </button>

                    <div className="text-center pt-6">
                        <Link href="/login" className="text-sm font-bold text-accent hover:underline">
                            Already have an account? Log In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
