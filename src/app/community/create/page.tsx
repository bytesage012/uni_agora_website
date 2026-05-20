"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ChevronLeft,
    Loader2,
    Tag,
    Send,
    MessageSquare,
    Layers
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const postSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    category: z.string().min(1, "Please select a category."),
    content: z.string().min(10, "Discussion content must be at least 10 characters."),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function CreatePostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories = ["General", "Academic", "Freelancing", "Events", "Market Talk"];

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            category: "General",
            content: "",
        },
    });

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login?redirect=/community/create");
            }
        };
        checkSession();
    }, [router]);

    const onSubmit = async (values: PostFormValues) => {
        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error("You must be logged in to post.");
            }

            const { error: insertError } = await supabase
                .from("community_posts")
                .insert([
                    {
                        user_id: session.user.id,
                        title: values.title,
                        category: values.category,
                        content: values.content,
                    },
                ]);

            if (insertError) throw insertError;

            toast.success("Discussion posted successfully!");
            router.push("/community");
        } catch (err) {
            console.error("Error creating post:", err);
            const msg = "Failed to create post. Please try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full">
                    <Button variant="ghost" asChild className="mb-8 font-bold text-zinc-500 hover:text-primary gap-2">
                        <Link href="/community">
                            <ChevronLeft size={20} /> Back to Community
                        </Link>
                    </Button>

                    <Card className="rounded-[2.5rem] shadow-sm border-border-soft overflow-hidden border-t-8 border-t-zinc-900">
                        <CardHeader className="text-center pt-10 pb-6">
                            <div className="w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center text-zinc-900 mx-auto mb-6 shadow-inner border border-zinc-200">
                                <MessageSquare size={32} />
                            </div>
                            <CardTitle className="text-3xl font-black text-primary mb-2">Start a Discussion</CardTitle>
                            <CardDescription className="font-medium text-zinc-500">Share your thoughts with the campus community</CardDescription>
                        </CardHeader>

                        <CardContent className="px-8 md:px-12 pb-12">
                            {error && (
                                <Alert variant="destructive" className="mb-8 rounded-2xl border-red-100 bg-red-50 text-red-700">
                                    <AlertDescription className="font-bold">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                    <Tag size={16} /> Discussion Title
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="What's on your mind?"
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
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                    <Layers size={16} /> Category
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-14 px-4 bg-muted/50 border-transparent focus:ring-primary rounded-2xl">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl">
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat} value={cat} className="rounded-xl my-1">{cat}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="ml-1 text-[11px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                    <MessageSquare size={16} /> Content
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Write your discussion points here..."
                                                        className="min-h-[160px] p-4 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="ml-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    Keep it respectful and campus-related.
                                                </FormDescription>
                                                <FormMessage className="ml-1 text-[11px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 bg-zinc-900 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all gap-3 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                            <>Post Discussion <Send size={20} /></>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
