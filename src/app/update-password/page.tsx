"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ShieldCheck,
    ArrowRight,
    Lock,
    Loader2,
    CheckCircle2,
    Eye,
    EyeOff
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

const updatePasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters."),
});

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<UpdatePasswordFormValues>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            password: "",
        },
    });

    const handleUpdate = async (values: UpdatePasswordFormValues) => {
        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: values.password,
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
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
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in-50 duration-500 shadow-inner">
                            <CheckCircle2 size={48} />
                        </div>
                        <CardHeader className="p-0">
                            <CardTitle className="text-3xl font-black text-primary">Password Updated!</CardTitle>
                            <CardDescription className="text-zinc-600 font-medium">Your password has been changed successfully. Redirecting you to login...</CardDescription>
                        </CardHeader>
                        <div className="pt-4">
                            <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                        </div>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader className="text-center pt-10 pb-6">
                            <CardTitle className="text-3xl font-black text-primary">Set New Password</CardTitle>
                            <CardDescription className="font-medium text-zinc-500">Secure your account with a strong password.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 md:px-12 pb-12">
                            {error && (
                                <Alert variant="destructive" className="mb-8 rounded-2xl border-red-100 bg-red-50 text-red-700">
                                    <AlertDescription className="font-bold">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-bold text-primary ml-1">New Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            className="h-14 pl-12 pr-12 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl"
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
                                            <>Update Password <ArrowRight size={20} /></>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
