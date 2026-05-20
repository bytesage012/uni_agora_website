"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    Shield,
    Handshake,
    Rocket,
    ArrowRight,
    Target,
    Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
    const values = [
        {
            title: "Safety First",
            text: "Verified student profiles only. We manually review student identities to ensure a secure environment.",
            icon: <Shield size={32} />,
            color: "text-blue-600 bg-blue-50"
        },
        {
            title: "Campus Trust",
            text: "Building meaningful connections within the university ecosystem. Trust is our currency.",
            icon: <Handshake size={32} />,
            color: "text-emerald-600 bg-emerald-50"
        },
        {
            title: "Empowerment",
            text: "Helping you turn your inherent skills into stable income. Your growth is our success.",
            icon: <Rocket size={32} />,
            color: "text-amber-600 bg-amber-50"
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-foreground scroll-smooth">
            <Navbar />

            <main className="flex-grow flex flex-col">
                {/* Hero Section */}
                <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center space-y-8">
                    <Badge variant="secondary" className="px-6 py-2 rounded-full bg-primary/5 text-primary font-black uppercase tracking-[0.2em] text-[10px] border-primary/10">
                        Our Story
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-primary leading-[0.9] max-w-4xl drop-shadow-sm">
                        Built for Students, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">by Students.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Empowering the campus economy through trust, community, and skill-sharing.
                    </p>
                </section>

                {/* The Story Section */}
                <section className="w-full py-32 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="flex items-center gap-4 mb-10">
                            <Target className="text-accent h-10 w-10" />
                            <h2 className="text-4xl font-black text-primary tracking-tight">The Origin</h2>
                        </div>
                        <div className="space-y-8">
                            <p className="text-2xl font-black text-zinc-900 leading-tight">
                                We know the struggle. You have skills - graphic design, tutoring, repairs - but finding clients on campus is noisy and unorganized.
                            </p>
                            <Separator className="bg-primary/10" />
                            <div className="prose prose-zinc prose-xl max-w-none text-zinc-500 font-medium leading-relaxed space-y-6">
                                <p>
                                    UniAGORA was born from a simple observation: the campus marketplace is huge but fragmented. We saw students needing help and students offering it, but no secure bridge between them.
                                </p>
                                <p>
                                    We built UniAGORA to be that bridge. Starting with a mission to empower university students, we created a platform where every interaction starts with identity verification and ends with professional success.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Mission Section */}
                <section className="w-full py-24 bg-transparent">
                    <div className="max-w-5xl mx-auto px-6">
                        <Card className="bg-accent border-none rounded-[4rem] p-12 md:p-24 shadow-2xl shadow-accent/20 relative overflow-hidden text-center md:text-left">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="relative z-10 space-y-8">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-xl">
                                        <Zap size={40} className="fill-white" />
                                    </div>
                                    <h2 className="text-4xl font-black text-primary tracking-tight uppercase tracking-widest">Our Mission</h2>
                                </div>
                                <p className="text-primary text-3xl md:text-5xl font-black leading-[1.1] tracking-tighter italic">
                                    &quot;To create a secure, verified campus economy where every student can achieve financial independence using the skills they already have.&quot;
                                </p>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Core Values Section */}
                <section className="w-full py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center space-y-4 mb-24">
                            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">What We Stand For</Badge>
                            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Core Values</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {values.map((v, i) => (
                                <Card key={i} className="group rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-zinc-50 p-10 flex flex-col items-center text-center">
                                    <div className={`w-20 h-20 ${v.color} rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-black/5`}>
                                        {v.icon}
                                    </div>
                                    <CardTitle className="text-3xl font-black text-primary mb-6 leading-tight">{v.title}</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium text-lg leading-relaxed">
                                        {v.text}
                                    </CardDescription>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-32 bg-primary relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
                    <div className="max-w-7xl mx-auto px-6 text-center relative z-10 space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Ready to join the community?</h2>
                            <p className="text-zinc-300 text-xl md:text-2xl font-medium max-w-2xl mx-auto">Take the first step towards campus independence today.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Button asChild className="h-18 px-12 bg-accent text-primary font-black rounded-[1.5rem] shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all text-xl gap-3">
                                <Link href="/contact">
                                    Get Started <ArrowRight size={24} />
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="h-18 px-12 border-2 border-white/20 text-white font-black rounded-[1.5rem] hover:bg-white/10 transition-all text-xl">
                                <Link href="/contact">Contact the Team</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
