"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ShieldCheck,
    ArrowRight,
    Mail,
    Loader2,
    CheckCircle2,
    ChevronLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address. Please use a university email."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleReset = async (values: ForgotPasswordFormValues) => {
        setLoading(true);
        setError(null);

        try {
            const baseUrl = window.location.origin;
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
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
            <Link href="/" className="mb-8 flex items-center gap-3 group">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                </div>
                <span className="text-4xl font-black text-primary tracking-tighter italic">UniAGORA</span>
            </Link>

            <Card className="max-w-md w-full rounded-[2.5rem] shadow-xl border-border-soft overflow-hidden">
                {success ? (
                    <CardContent className="p-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 transition-all animate-in zoom-in-50 duration-500 shadow-inner">
                            <CheckCircle2 size={48} />
                        </div>
                        <CardHeader className="p-0">
                            <CardTitle className="text-3xl font-black text-primary">Check Your Email</CardTitle>
                            <CardDescription className="text-zinc-600 font-medium">
                                We&apos;ve sent a reset link to your inbox if an account exists for that email.
                            </CardDescription>
                        </CardHeader>
                        <div className="pt-6">
                            <Button variant="ghost" asChild className="text-primary font-bold gap-2">
                                <Link href="/login">
                                    <ChevronLeft size={20} /> Back to Login
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader className="text-center pt-10 pb-6">
                            <CardTitle className="text-3xl font-black text-primary">Forgot Password?</CardTitle>
                            <CardDescription className="font-medium text-zinc-500">Enter your email to receive a recovery link.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 md:px-12 pb-12">
                            {error && (
                                <Alert variant="destructive" className="mb-8 rounded-2xl border-red-100 bg-red-50 text-red-700">
                                    <AlertDescription className="font-bold">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleReset)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-bold text-primary ml-1">Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                                        <Input
                                                            placeholder="student@university.edu.ng"
                                                            className="h-14 pl-12 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="ml-1 text-[11px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl shadow-xl hover:bg-primary/90 active:scale-95 transition-all gap-2 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                            <>Send Reset Link <ArrowRight size={20} /></>
                                        )}
                                    </Button>

                                    <div className="text-center pt-6">
                                        <Button variant="ghost" asChild className="text-sm font-bold text-muted-foreground hover:text-primary gap-2">
                                            <Link href="/login">
                                                <ChevronLeft size={16} /> Back to Login
                                            </Link>
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
