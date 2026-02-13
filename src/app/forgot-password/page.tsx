"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    ArrowRight,
    Mail,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Get base URL for redirect
            const baseUrl = window.location.origin;
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${baseUrl}/update-password`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
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
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <ShieldCheck size={24} />
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter italic">UniAGORA</span>
            </Link>

            <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border-soft">
                {success ? (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 transition-all animate-in zoom-in-50 duration-500">
                            <CheckCircle2 size={48} />
                        </div>
                        <h1 className="text-3xl font-black text-primary">Check Your Email</h1>
                        <p className="text-zinc-600 font-medium">
                            If an account exists for <span className="text-primary font-bold">{email}</span>, we&apos;ve sent a reset link to your inbox.
                        </p>
                        <div className="pt-6">
                            <Link href="/login" className="text-primary font-bold flex items-center justify-center gap-2 hover:underline">
                                <ChevronLeft size={20} /> Back to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-primary mb-2">Forgot Password?</h1>
                            <p className="text-zinc-500 font-medium">No worries! Enter your email to receive a recovery link.</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="student@university.edu.ng"
                                        className="w-full p-4 pl-12 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>Send Reset Link <ArrowRight size={20} /></>
                                )}
                            </button>

                            <div className="text-center pt-6">
                                <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-primary transition-colors flex items-center justify-center gap-2">
                                    <ChevronLeft size={16} /> Remembered your password?
                                </Link>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
