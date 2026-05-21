"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2
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

const loginSchema = z.object({
    email: z.string().email("Invalid email address. Please use a university email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push("/dashboard");
            }
        };
        checkAuth();
    }, [router]);

    const handleLogin = async (values: LoginFormValues) => {
        setError(null);
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (authError) {
                throw new Error("Invalid login credentials. Please check your email and password.");
            }

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
            <Link href="/" className="mb-8 flex items-center gap-3 group">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                </div>
                <span className="text-4xl font-black text-primary tracking-tighter italic">UniAGORA</span>
            </Link>

            <Card className="max-w-md w-full rounded-[2.5rem] shadow-xl border-border-soft overflow-hidden">
                <CardHeader className="text-center pt-10 pb-6">
                    <CardTitle className="text-3xl font-black text-primary">Welcome Back</CardTitle>
                    <CardDescription className="font-medium text-zinc-500">Log in to your campus account</CardDescription>
                </CardHeader>
                <CardContent className="px-8 md:px-12 pb-12">
                    {error && (
                        <Alert variant="destructive" className="mb-8 rounded-2xl border-red-100 bg-red-50 text-red-700">
                            <AlertDescription className="font-bold">{error}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-bold text-primary ml-1">Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="student@university.edu.ng"
                                                className="h-14 px-4 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="ml-1 text-[11px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <FormLabel className="text-sm font-bold text-primary">Password</FormLabel>
                                            <Link href="/forgot-password" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                                                Forgot Password?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="h-14 px-4 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl pr-12"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </Button>
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
                                    <>Log In <ArrowRight size={20} /></>
                                )}
                            </Button>

                            <div className="text-center pt-6">
                                <Link href="/signup" className="text-sm font-bold text-accent hover:underline">
                                    New to UniAGORA? Create Account
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
