"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    ShieldCheck,
    AlertTriangle,
    Info,
    Calendar,
    CheckCircle2,
    Users,
    CreditCard
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 scroll-smooth">
            <Navbar />

            <main className="flex-grow flex flex-col items-center">
                <article className="max-w-4xl w-full px-6 py-20">
                    <header className="mb-16 space-y-4">
                        <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">Legal Agreement</Badge>
                        <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tight">Terms of Service</h1>
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                            <Calendar size={14} className="text-primary" />
                            Last Updated: February 8, 2026
                        </div>
                    </header>

                    <div className="space-y-16">
                        {/* Introduction */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <Info size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-primary tracking-tight">1. Introduction</h2>
                            </div>
                            <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                                Welcome to UniAGORA. By using this platform, you agree to these terms. These terms govern your access to and use of our services, including our website and any other software or tools provided by UniAGORA (collectively, the &quot;Platform&quot;).
                            </p>
                        </section>

                        <Separator className="opacity-50" />

                        {/* Platform Role */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <ShieldCheck size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-primary tracking-tight">2. The Platform&apos;s Role</h2>
                            </div>
                            
                            <Alert className="rounded-[2rem] p-8 border-none bg-accent shadow-xl shadow-accent/10">
                                <AlertTriangle className="h-6 w-6 text-primary" />
                                <AlertTitle className="text-xl font-black text-primary ml-2 mb-2">Important Notice</AlertTitle>
                                <AlertDescription className="text-primary/80 font-bold text-lg leading-relaxed ml-2">
                                    UniAGORA is a directory and connection platform only. We provide a space for students to list services and connect with peers.
                                </AlertDescription>
                            </Alert>

                            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
                                <CardContent className="p-0 space-y-6 text-lg font-medium text-zinc-600 leading-relaxed">
                                    <p className="text-primary font-black">
                                        We do not handle payments, escrow, or guarantee the quality of work. All transactions happen directly between students.
                                    </p>
                                    <p>
                                        UniAGORA is not a party to any agreement between users. We do not facilitate the transfer of funds or manage disputes between buyers and sellers.
                                    </p>
                                </CardContent>
                            </Card>
                        </section>

                        <Separator className="opacity-50" />

                        {/* User Conduct */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <Users size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-primary tracking-tight">3. User Conduct & Eligibility</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="rounded-[2rem] border-none bg-white p-6 shadow-sm">
                                    <CardTitle className="text-sm font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-500" /> Eligibility
                                    </CardTitle>
                                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">Users must be current university students with a valid student ID for verification.</p>
                                </Card>
                                <Card className="rounded-[2rem] border-none bg-white p-6 shadow-sm">
                                    <CardTitle className="text-sm font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-amber-500" /> Prohibited
                                    </CardTitle>
                                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">Illegal items, academic dishonesty services, or university policy violations are forbidden.</p>
                                </Card>
                                <Card className="rounded-[2rem] border-none bg-white p-6 shadow-sm">
                                    <CardTitle className="text-sm font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-primary" /> Bans
                                    </CardTitle>
                                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">Harassment, scams, or prohibited items result in a permanent ban from the Platform.</p>
                                </Card>
                            </div>
                        </section>

                        <Separator className="opacity-50" />

                        {/* Safety Disclaimer */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <ShieldCheck size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-primary tracking-tight">4. Safety Disclaimer</h2>
                            </div>

                            <Card className="rounded-[3rem] border-none bg-primary p-12 text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                <p className="text-xl font-bold mb-10 leading-relaxed text-zinc-300">
                                    Your safety is our priority, but you are responsible for your own interactions.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-8 bg-white/10 rounded-[1.5rem] border border-white/10 backdrop-blur-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary">
                                                <Users size={16} />
                                            </div>
                                            <p className="font-black text-[10px] uppercase tracking-[0.2em] text-accent">PUBLIC MEETINGS</p>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">Meet in public places (like the Library or Student Union) for physical services.</p>
                                    </div>
                                    <div className="p-8 bg-white/10 rounded-[1.5rem] border border-white/10 backdrop-blur-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary">
                                                <CreditCard size={16} />
                                            </div>
                                            <p className="font-black text-[10px] uppercase tracking-[0.2em] text-accent">PAYMENT SAFETY</p>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">Do not send money before verifying the service. Use caution with bank transfers.</p>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        <Separator className="opacity-50" />

                        {/* Limitation of Liability */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <AlertTriangle size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-primary tracking-tight">5. Limitation of Liability</h2>
                            </div>
                            <p className="text-lg font-medium text-zinc-400 italic leading-relaxed bg-zinc-100 p-8 rounded-2xl border-l-4 border-primary">
                                To the maximum extent permitted by law, UniAGORA and its creators shall not be liable for any damages, losses, or disputes arising from the use of the Platform or interactions between users.
                            </p>
                        </section>
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    );
}
