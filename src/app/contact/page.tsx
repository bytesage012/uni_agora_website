"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    Mail,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    HelpCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "general",
        message: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("contact_submissions")
                .insert([formData]);

            if (error) throw error;

            setStatus("success");
            toast.success("Message received! We'll get back to you shortly.");
            setFormData({ name: "", email: "", subject: "general", message: "" });
        } catch (err: unknown) {
            console.error("Submission error:", err);
            setStatus("error");
            const msg = err instanceof Error ? err.message : "Failed to send message.";
            setErrorMessage(msg);
            toast.error(msg);
        }
    };

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-foreground scroll-smooth">
            <Navbar />

            <main className="flex-grow flex flex-col">
                {/* Hero Section */}
                <section className="w-full max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tight">
                        Need Help or Have a Suggestion?
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        UniAGORA is in Beta. Your feedback directly shapes our campus ecosystem.
                    </p>
                </section>

                {/* Contact Cards Section */}
                <section className="w-full pb-12 bg-transparent">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center group">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                                    <Mail size={36} />
                                </div>
                                <CardTitle className="text-2xl font-black text-primary mb-2">Email Support</CardTitle>
                                <CardDescription className="text-zinc-500 font-bold mb-10 text-lg">support@uniagora.com</CardDescription>
                                <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-2 border-zinc-100 font-black text-primary hover:bg-zinc-50">
                                    <a href="mailto:support@uniagora.com">Send an Email</a>
                                </Button>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-sm p-10 bg-white hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center group">
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600 group-hover:scale-110 transition-transform">
                                    <HelpCircle size={36} />
                                </div>
                                <CardTitle className="text-2xl font-black text-primary mb-2">FAQ Hub</CardTitle>
                                <CardDescription className="text-zinc-500 font-bold mb-10 text-lg">Quick answers & guides</CardDescription>
                                <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-2 border-zinc-100 font-black text-primary hover:bg-zinc-50">
                                    <Link href="/#faq">Read FAQs</Link>
                                </Button>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="w-full py-20 bg-transparent">
                    <div className="max-w-3xl mx-auto px-6">
                        <Card className="rounded-[3.5rem] p-10 md:p-16 border-none shadow-2xl bg-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                            
                            {status === "success" ? (
                                <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/5">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <CardTitle className="text-4xl font-black text-primary mb-4">Message Received!</CardTitle>
                                    <p className="text-zinc-500 font-medium text-lg mb-12 leading-relaxed">Thank you for your feedback. We&apos;ll get back to you shortly if needed.</p>
                                    <Button
                                        onClick={() => setStatus("idle")}
                                        className="h-16 px-12 bg-primary text-white font-black rounded-2xl text-lg shadow-xl shadow-primary/20"
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <CardTitle className="text-4xl font-black text-primary tracking-tight">Send a Message</CardTitle>
                                        <p className="text-zinc-500 font-medium text-lg">Fill out the form below and we&apos;ll be in touch.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {status === "error" && (
                                            <Alert variant="destructive" className="rounded-2xl border-none bg-red-50 p-6">
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                                <AlertTitle className="font-black text-red-700 ml-2">Oops!</AlertTitle>
                                                <AlertDescription className="font-bold text-red-600/80 ml-2 leading-relaxed">
                                                    {errorMessage}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-primary ml-1 uppercase tracking-widest">Full Name</label>
                                                <Input
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => handleChange("name", e.target.value)}
                                                    placeholder="e.g. John Doe"
                                                    className="h-16 px-6 bg-zinc-50 border-transparent focus-visible:ring-primary/20 rounded-2xl font-medium shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-primary ml-1 uppercase tracking-widest">Email Address</label>
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => handleChange("email", e.target.value)}
                                                    placeholder="Your student email"
                                                    className="h-16 px-6 bg-zinc-50 border-transparent focus-visible:ring-primary/20 rounded-2xl font-medium shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-primary ml-1 uppercase tracking-widest">Inquiry Type</label>
                                            <Select value={formData.subject} onValueChange={(val) => handleChange("subject", val)}>
                                                <SelectTrigger className="h-16 px-6 bg-zinc-50 border-transparent focus:ring-primary/20 rounded-2xl font-medium shadow-inner">
                                                    <SelectValue placeholder="Select a subject" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectItem value="general" className="rounded-xl my-1">General Inquiry</SelectItem>
                                                    <SelectItem value="report" className="rounded-xl my-1">Report a User</SelectItem>
                                                    <SelectItem value="bug" className="rounded-xl my-1">Bug Fix</SelectItem>
                                                    <SelectItem value="suggestion" className="rounded-xl my-1">Feature Suggestion</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-primary ml-1 uppercase tracking-widest">Your Message</label>
                                            <Textarea
                                                name="message"
                                                required
                                                value={formData.message}
                                                onChange={(e) => handleChange("message", e.target.value)}
                                                rows={6}
                                                placeholder="Tell us what's on your mind..."
                                                className="p-6 bg-zinc-50 border-transparent focus-visible:ring-primary/20 rounded-[1.5rem] font-medium shadow-inner resize-none text-lg leading-relaxed"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={status === "loading"}
                                            className="w-full h-18 bg-primary text-white font-black text-xl rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all gap-3"
                                        >
                                            {status === "loading" ? (
                                                <Loader2 size={28} className="animate-spin text-white" />
                                            ) : (
                                                <>Send Message <ArrowRight size={24} /></>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </Card>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
