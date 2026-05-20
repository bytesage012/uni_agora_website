"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ChevronLeft,
    Loader2,
    Package,
    FileText,
    Tag,
    DollarSign,
    Upload,
    X,
    ImageIcon,
    Save
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { toast } from "sonner";

import Image from "next/image";
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

const serviceSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    category: z.string().min(1, "Please select a category."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    priceHint: z.string().min(1, "Please provide a price hint."),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories = [
        "Writing & Translation",
        "Graphic Design",
        "Tutoring & Lessons",
        "Tech & Programming",
        "Photography & Video",
        "Fashion & Style",
        "Food & Groceries",
        "Beauty & Care",
        "Repairs & Maintenance"
    ];

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            title: "",
            category: "",
            description: "",
            priceHint: "",
        },
    });

    useEffect(() => {
        const fetchServiceAndVerifyOwner = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/login");
                    return;
                }

                const { data: service, error: fetchError } = await supabase
                    .from("services")
                    .select("*")
                    .eq("id", resolvedParams.id)
                    .single();

                if (fetchError || !service) {
                    throw new Error("Listing not found.");
                }

                if (service.user_id !== session.user.id) {
                    router.push("/marketplace");
                    return;
                }

                form.reset({
                    title: service.title,
                    category: service.category,
                    description: service.description,
                    priceHint: service.price_range,
                });
                setExistingImageUrl(service.image_url);
                setImagePreview(service.image_url);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Security access issue.");
            } finally {
                setLoading(false);
            }
        };

        fetchServiceAndVerifyOwner();
    }, [resolvedParams.id, router, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size must be less than 2MB");
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values: ServiceFormValues) => {
        setSaving(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Please log in.");

            let imageUrl = existingImageUrl;
            if (image) {
                const timestamp = Date.now();
                const fileName = `${timestamp}-${image.name.replace(/\s/g, "_")}`;
                const filePath = `services/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("uniagora")
                    .upload(filePath, image);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("uniagora")
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            const { error: updateError } = await supabase
                .from("services")
                .update({
                    title: values.title,
                    category: values.category,
                    description: values.description,
                    price_range: values.priceHint,
                    image_url: imageUrl,
                })
                .eq("id", resolvedParams.id)
                .eq("user_id", session.user.id);

            if (updateError) throw updateError;

            toast.success("Listing updated successfully!");
            router.push(`/service/${resolvedParams.id}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update listing.";
            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-zinc-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full">
                    <Button variant="ghost" asChild className="mb-8 font-bold text-zinc-500 hover:text-primary gap-2">
                        <Link href={`/service/${resolvedParams.id}`}>
                            <ChevronLeft size={20} /> Cancel Editing
                        </Link>
                    </Button>

                    <Card className="rounded-[2.5rem] shadow-sm border-border-soft overflow-hidden border-t-8 border-t-zinc-900">
                        <CardHeader className="text-center pt-10 pb-6">
                            <div className="w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center text-zinc-900 mx-auto mb-6 shadow-inner border border-zinc-200">
                                <FileText size={32} />
                            </div>
                            <CardTitle className="text-3xl font-black text-primary mb-2">Refine Your Listing</CardTitle>
                            <CardDescription className="font-medium text-zinc-500">Keep your service details fresh and attractive</CardDescription>
                        </CardHeader>

                        <CardContent className="px-8 md:px-12 pb-12">
                            {error && (
                                <Alert variant="destructive" className="mb-8 rounded-2xl border-red-100 bg-red-50 text-red-700">
                                    <AlertDescription className="font-bold">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                    <Tag size={16} /> Service Title
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. Laptop Repair, Essay Writing"
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
                                                    <Package size={16} /> Category
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                    <FileText size={16} /> Description
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe what you offer in detail..."
                                                        className="min-h-[120px] p-4 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="ml-1 text-[11px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="priceHint"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                                    <DollarSign size={16} /> Price Hint
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. Starting at ₦2,000"
                                                        className="h-14 px-4 bg-muted/50 border-transparent focus-visible:ring-primary rounded-2xl"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="ml-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    Helps students understand your pricing
                                                </FormDescription>
                                                <FormMessage className="ml-1 text-[11px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-primary ml-1 flex items-center gap-2">
                                            <ImageIcon size={16} /> Update Image (Optional)
                                        </label>
                                        <div
                                            className={`relative group border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer ${imagePreview ? 'border-primary/20 bg-primary/5' : 'border-zinc-200 hover:border-primary/30 bg-zinc-50/50'}`}
                                            onClick={() => document.getElementById("image-upload")?.click()}
                                        >
                                            {imagePreview ? (
                                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border-2 border-white">
                                                    <Image 
                                                        src={imagePreview} 
                                                        alt="Preview" 
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImage(null);
                                                            setImagePreview(existingImageUrl);
                                                        }}
                                                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-400 mb-3 group-hover:scale-110 transition-transform">
                                                        <Upload size={24} />
                                                    </div>
                                                    <p className="text-sm font-black text-primary">Click to change image</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-black">JPG, PNG (Max 2MB)</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                id="image-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full h-16 bg-zinc-900 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all gap-2 mt-4"
                                    >
                                        {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                                        Update Listing <Save size={20} />
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
