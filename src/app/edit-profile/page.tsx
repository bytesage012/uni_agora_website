"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    User,
    Phone,
    MapPin,
    Save,
    ArrowLeft,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { toast } from "sonner";

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

const profileSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters."),
    phoneNumber: z.string().regex(/^\d{11}$/, "Please enter a valid 11-digit phone number."),
    university: z.string().min(3, "University name must be at least 3 characters."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            university: "",
        },
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
                let displayPhone = data.phone_number || "";
                if (displayPhone.startsWith("+234")) {
                    displayPhone = "0" + displayPhone.substring(4);
                }

                form.reset({
                    fullName: data.full_name || "",
                    phoneNumber: displayPhone,
                    university: data.university || "",
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, [router, form]);

    const formatPhoneNumber = (phone: string) => {
        let formatted = phone;
        if (formatted.startsWith("0")) {
            formatted = formatted.substring(1);
        }
        return `+234${formatted}`;
    };

    const handleSubmit = async (values: ProfileFormValues) => {
        setSaving(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    full_name: values.fullName,
                    phone_number: formatPhoneNumber(values.phoneNumber),
                    university: values.university,
                })
                .eq("id", session.user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            toast.success("Profile updated successfully!");
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (err: unknown) {
            console.error("Error updating profile:", err);
            const msg = err instanceof Error ? err.message : "Failed to update profile.";
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-2xl">
                <Button variant="ghost" asChild className="mb-8 font-bold text-zinc-500 hover:text-primary gap-2">
                    <Link href="/dashboard">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </Link>
                </Button>

                <Card className="rounded-[2.5rem] shadow-sm border-border-soft overflow-hidden border-t-8 border-t-primary">
                    <CardHeader className="text-center pt-10 pb-6">
                        <CardTitle className="text-4xl font-black text-primary mb-2">Edit Profile</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium text-lg">Update your personal information</CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 md:px-12 pb-12">
                        {error && (
                            <Alert variant="destructive" className="mb-8 rounded-2xl border-red-100 bg-red-50 text-red-700">
                                <AlertDescription className="font-bold">{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="mb-8 rounded-2xl border-green-100 bg-green-50 text-green-700 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 size={18} className="mr-2" />
                                <AlertDescription className="font-bold">Profile Updated Successfully! Redirecting...</AlertDescription>
                            </Alert>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                <User size={16} /> Full Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your full name"
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
                                            <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                <Phone size={16} /> Phone Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. 08123456789"
                                                    className="h-14 px-4 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="ml-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                MUST BE 11 DIGITS. USED FOR CAMPUS-WIDE CONTACT.
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
                                            <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                <MapPin size={16} /> University
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. University of Ilorin"
                                                    className="h-14 px-4 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="ml-1 text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={saving || success}
                                    className="w-full h-16 bg-primary text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all gap-3 mt-4"
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
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
}
