"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push("/dashboard");
            }
        };
        checkAuth();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (authError) {
                // Custom error message as per requirements
                throw new Error("Invalid login credentials. Please check your email and password.");
            }

            // Success redirect
            router.push("/marketplace");
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-3xl font-black text-primary mb-2">Welcome Back</h1>
                    <p className="text-zinc-500 font-medium">Log in to your campus account</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-3">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
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

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-bold text-primary">Password</label>
                            <Link href="/forgot-password" className="text-xs font-bold text-zinc-400 hover:text-primary transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
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

                    {/* Buttons */}
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-xl hover:bg-green-900 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : (
                            <>Log In <ArrowRight size={20} /></>
                        )}
                    </button>

                    <div className="text-center pt-6">
                        <Link href="/signup" className="text-sm font-bold text-accent hover:underline">
                            New to UniAGORA? Create Account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
