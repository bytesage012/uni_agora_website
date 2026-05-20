"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import {
    Users,
    ShieldAlert,
    MessageCircle,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Star,
    Handshake,
    Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function CommunityGuidelines() {
    const freelancerRules = [
        "Be professional and punctual with all deliveries.",
        "Deliver precisely what was promised in the listing.",
        "Maintain proactive and clear communication.",
        "Respect client privacy and confidentiality."
    ];

    const clientRules = [
        "Respect the freelancer's time and creative process.",
        "Finalize scope and price before work begins.",
        "Pay promptly upon successful completion of work.",
        "Provide constructive and honest feedback."
    ];

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-foreground scroll-smooth">
            <Navbar />

            <main className="flex-grow flex flex-col items-center">
                {/* Hero Section */}
                <section className="w-full max-w-5xl mx-auto px-6 py-24 text-center space-y-8">
                    <Badge variant="outline" className="px-5 py-2 rounded-full border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] bg-white shadow-sm gap-3">
                        <ShieldAlert size={14} className="text-primary" />
                        Safety & Trust First
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-primary leading-[0.9] tracking-tighter">
                        Keeping the Campus <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ecosystem Safe.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        UniAGORA is built on a foundation of trust. These guidelines ensure a secure and productive environment for every student.
                    </p>
                </section>

                {/* Guidelines Grid */}
                <section className="w-full py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* For Freelancers */}
                            <Card className="group rounded-[3.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-zinc-50 p-12 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="space-y-10 relative z-10">
                                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-md flex items-center justify-center text-primary border border-zinc-100">
                                        <Star size={40} className="fill-primary/10" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black text-primary tracking-tight">For Service Providers</h2>
                                        <p className="text-zinc-500 font-medium text-lg leading-relaxed">Excellence and professionalism are the standards of our marketplace.</p>
                                    </div>
                                    <ul className="space-y-5">
                                        {freelancerRules.map((rule, i) => (
                                            <li key={i} className="flex items-start gap-4 text-zinc-700 font-bold text-lg leading-snug">
                                                <div className="mt-2 w-2 h-2 rounded-full bg-accent shrink-0"></div>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>

                            {/* For Clients */}
                            <Card className="group rounded-[3.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-primary p-12 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="space-y-10 relative z-10">
                                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] shadow-md flex items-center justify-center text-accent border border-white/10 backdrop-blur-sm">
                                        <Handshake size={40} />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black text-white tracking-tight">For Service Buyers</h2>
                                        <p className="text-zinc-300 font-medium text-lg leading-relaxed">Fairness and respect build a stronger campus community.</p>
                                    </div>
                                    <ul className="space-y-5">
                                        {clientRules.map((rule, i) => (
                                            <li key={i} className="flex items-start gap-4 text-zinc-100 font-bold text-lg leading-snug">
                                                <div className="mt-2 w-2 h-2 rounded-full bg-accent shrink-0"></div>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Red Flags Section */}
                <section className="w-full py-32 bg-transparent">
                    <div className="max-w-4xl mx-auto px-6">
                        <Alert className="rounded-[4rem] p-12 md:p-20 border-none bg-red-600 shadow-2xl shadow-red-600/20 relative overflow-hidden text-white">
                            <div className="absolute -top-10 -right-10 p-12 text-white/5 opacity-50 rotate-12">
                                <AlertTriangle size={240} />
                            </div>
                            <div className="relative z-10 space-y-12">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/20 backdrop-blur-md">
                                            <ShieldAlert size={36} className="text-accent" />
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tight uppercase tracking-widest">The Red Flags</h2>
                                    </div>
                                    <p className="text-red-100 text-xl font-medium max-w-2xl">Protect yourself and your peers by staying vigilant against these behaviors.</p>
                                </div>
                                <Separator className="bg-white/10" />
                                <div className="space-y-8 text-2xl md:text-3xl font-black leading-tight tracking-tighter">
                                    <div className="flex items-center gap-6">
                                        <Badge className="bg-accent text-primary h-10 w-10 flex items-center justify-center rounded-full border-none">1</Badge>
                                        <p>Never share your bank PIN or sensitive credentials.</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Badge className="bg-accent text-primary h-10 w-10 flex items-center justify-center rounded-full border-none">2</Badge>
                                        <p>Avoid meeting in private, secluded off-campus locations.</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Badge className="bg-accent text-primary h-10 w-10 flex items-center justify-center rounded-full border-none">3</Badge>
                                        <p>Report suspicious profiles or spam immediately to Admin.</p>
                                    </div>
                                </div>
                            </div>
                        </Alert>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-32 text-center bg-white">
                    <div className="max-w-2xl mx-auto px-6 space-y-12">
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto shadow-inner">
                                <MessageCircle size={40} />
                            </div>
                            <h3 className="text-4xl font-black text-primary tracking-tight">
                                Join the conversation and stay updated with the latest campus tips.
                            </h3>
                        </div>
                        <Button asChild size="lg" className="h-18 px-12 bg-primary text-white font-black text-xl rounded-[1.5rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-4">
                            <Link href="/community">
                                Join Our Community <ArrowRight size={24} />
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
