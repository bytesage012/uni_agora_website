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
    CheckCircle2,
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

const signupSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters."),
    email: z.string().email("Invalid email address. Please use a university email."),
    phoneNumber: z.string().length(11, "Phone number must be exactly 11 digits."),
    university: z.string().min(2, "Please enter your university name."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    agreed: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms and guidelines.",
    }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            university: "",
            password: "",
            agreed: false,
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

    const formatPhoneNumber = (phone: string) => {
        let formatted = phone;
        if (formatted.startsWith("0")) {
            formatted = formatted.substring(1);
        }
        return `+234${formatted}`;
    };

    const handleSignup = async (values: SignupFormValues) => {
        setError(null);
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert([
                        {
                            id: authData.user.id,
                            full_name: values.fullName,
                            phone_number: formatPhoneNumber(values.phoneNumber),
                            university: values.university,
                            is_freelancer: false,
                        },
                    ]);

                if (profileError) throw profileError;

                setSuccess(true);
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
                <Card className="max-w-md w-full rounded-[2.5rem] shadow-xl border-border-soft text-center p-8 md:p-12 space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 size={48} />
                    </div>
                    <CardHeader className="p-0">
                        <CardTitle className="text-3xl font-black text-primary">Welcome Aboard!</CardTitle>
                        <CardDescription className="text-zinc-600 font-medium leading-relaxed">
                            Your account has been created successfully. Ready to dive into the campus economy?
                        </CardDescription>
                    </CardHeader>
                    <div className="pt-4 flex flex-col gap-4">
                        <Button
                            className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
                            asChild
                        >
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm font-bold">
                            <Loader2 className="animate-spin" size={16} />
                            Auto-redirecting...
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

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
                    <CardTitle className="text-3xl font-black text-primary">Join the Economy</CardTitle>
                    <CardDescription className="font-medium text-zinc-500">Create your verified student account</CardDescription>
                </CardHeader>
                <CardContent className="px-8 md:px-12 pb-12">
                    {error && (
                        <Alert variant="destructive" className="mb-8 rounded-2xl border-red-100 bg-red-50 text-red-700">
                            <AlertDescription className="font-bold">{error}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-bold text-primary ml-1">Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Musa Ibrahim"
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
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-bold text-primary ml-1">Phone Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="080..."
                                                maxLength={11}
                                                className="h-14 px-4 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, "");
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription className="ml-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Used for students to contact you
                                        </FormDescription>
                                        <FormMessage className="ml-1 text-[11px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="university"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-bold text-primary ml-1">University</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. University of Lagos"
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
                                        <FormLabel className="text-sm font-bold text-primary ml-1">Password</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="agreed"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="h-5 w-5 border-2"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-xs text-muted-foreground font-medium leading-relaxed">
                                                I agree to the{" "}
                                                <Link href="/terms" target="_blank" className="text-primary font-bold hover:underline">
                                                    Terms of Service
                                                </Link>{" "}
                                                and{" "}
                                                <Link href="/community-guidelines" target="_blank" className="text-primary font-bold hover:underline">
                                                    Community Guidelines
                                                </Link>.
                                            </FormLabel>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl shadow-xl hover:bg-primary/90 active:scale-95 transition-all gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>Create Account <ArrowRight size={20} /></>
                                )}
                            </Button>

                            <div className="text-center pt-6">
                                <Link href="/login" className="text-sm font-bold text-accent hover:underline">
                                    Already have an account? Log In
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
