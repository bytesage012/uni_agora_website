"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  Users,
  MessageCircle,
  Search,
  PenTool,
  Monitor,
  BookOpen,
  Camera,
  ShoppingBag,
  ArrowRight,
  HelpCircle,
  Star,
  ShieldCheck,
  LayoutDashboard,
  CheckCircle2,
  Trophy,
  Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { title: "Writing & Translation", icon: <PenTool size={24} />, count: "45+ Freelancers", color: "bg-blue-50 text-blue-600" },
    { title: "Graphic Design", icon: <Camera size={24} />, count: "32+ Freelancers", color: "bg-purple-50 text-purple-600" },
    { title: "Tutoring & Lessons", icon: <BookOpen size={24} />, count: "60+ Tutors", color: "bg-orange-50 text-orange-600" },
    { title: "Tech & Programming", icon: <Monitor size={24} />, count: "28+ Developers", color: "bg-emerald-50 text-emerald-600" },
    { title: "Fashion & Style", icon: <ShoppingBag size={24} />, count: "20+ Designers", color: "bg-pink-50 text-pink-600" },
    { title: "Food & Groceries", icon: <ShoppingBag size={24} />, count: "15+ Vendors", color: "bg-amber-50 text-amber-600" },
  ];

  const steps = [
    { title: "Create Profile", description: "Register with your verified student identity.", icon: <Users size={32} /> },
    { title: "Browse or Post", description: "Find services you need or list your own skills.", icon: <Search size={32} /> },
    { title: "Connect", description: "Message instantly to finalize deals on campus.", icon: <MessageCircle size={32} /> },
  ];

  const testimonials = [
    { name: "Adebayo S.", role: "300L, Economics", text: "UniAGORA helped me find a tutor for Econometrics in less than an hour. Amazing service!", rating: 5, avatar: "AS" },
    { name: "Fatima R.", role: "400L, Law", text: "I've earned over 20k this month writing essays and summaries for classmates. The platform is safe and easy.", rating: 5, avatar: "FR" },
  ];

  const faqs = [
    { q: "Is UniAGORA only for specific students?", a: "No, we are open to students from all universities to ensure a wide and trusted marketplace." },
    { q: "How are students verified?", a: "We use a combination of student IDs and university verification to ensure every user is a real student." },
    { q: "Is there a fee for using the platform?", a: "Joining and browsing is free. We may introduce small commission fees for premium listings in the future." },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-foreground scroll-smooth">
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden w-full max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10"></div>
          
          <Badge variant="secondary" className="mb-8 px-6 py-2 rounded-full bg-accent/10 text-primary font-black uppercase tracking-[0.2em] text-[10px] border-accent/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Trophy size={14} className="text-accent fill-accent" />
            The #1 Student Marketplace in Nigeria
          </Badge>

          <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-primary leading-[0.95] drop-shadow-sm">
              Earn. Find. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Connect.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
              The verified student marketplace for all universities. <br className="hidden md:inline" />
              Hire skilled peers or sell your services safely on campus.
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            {loading ? (
              <div className="h-16 w-64 bg-zinc-200 animate-pulse rounded-[1.5rem]"></div>
            ) : user ? (
              <>
                <Button asChild className="h-16 px-10 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-lg gap-2">
                  <Link href="/dashboard">
                    <LayoutDashboard size={22} /> Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-16 px-10 border-2 border-primary text-primary font-black rounded-2xl shadow-sm hover:bg-primary/5 transition-all text-lg">
                  <Link href="/marketplace">Explore Marketplace</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="h-16 px-10 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-lg gap-3">
                  <Link href="/signup">
                    Join the Ecosystem <ArrowRight size={22} />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-16 px-10 border-2 border-primary text-primary font-black rounded-2xl shadow-sm hover:bg-primary/5 transition-all text-lg">
                  <Link href="/login">Merchant Login</Link>
                </Button>
              </>
            )}
          </div>

          {/* Floating Elements - Decorative */}
          <div className="absolute top-1/4 left-10 w-20 h-20 bg-accent/20 rounded-3xl rotate-12 blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-bounce"></div>
        </section>

        {/* Categories Grid */}
        <section className="w-full py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-3">
                <Badge variant="outline" className="text-primary font-black uppercase tracking-widest text-[10px] rounded-md px-3 py-1 border-primary/20">Marketplace</Badge>
                <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Browse Categories</h2>
                <p className="text-zinc-500 font-medium text-lg">Find exactly what you need to succeed this semester.</p>
              </div>
              <Button variant="ghost" asChild className="text-primary font-black gap-2 hover:bg-primary/5 p-4 rounded-xl">
                <Link href="/marketplace">
                  View all services <ArrowRight size={20} />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat, i) => (
                <Card key={i} className="group rounded-[2rem] border-none shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden bg-zinc-50/50">
                  <Link href={`/marketplace?category=${encodeURIComponent(cat.title)}`} className="p-8 block text-center md:text-left h-full">
                    <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                      {cat.icon}
                    </div>
                    <CardTitle className="text-sm font-black text-primary leading-tight mb-2">{cat.title}</CardTitle>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{cat.count}</p>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="w-full py-32 bg-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -ml-48 -mb-48"></div>
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-8 text-center md:text-left animate-in fade-in duration-1000">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-accent shadow-inner border border-white/5 backdrop-blur-sm mx-auto md:mx-0">
                  <ShieldCheck size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white">100% Verified</h3>
                  <p className="text-zinc-300 text-lg leading-relaxed font-medium">
                    Every user must provide a valid student ID. We prioritize campus safety and trust above all else.
                  </p>
                </div>
              </div>

              <div className="space-y-8 text-center md:text-left animate-in fade-in duration-1000 delay-200">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-accent shadow-inner border border-white/5 backdrop-blur-sm mx-auto md:mx-0">
                  <Zap size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white">Instant Deals</h3>
                  <p className="text-zinc-300 text-lg leading-relaxed font-medium">
                    Skip the middleman. Connect directly with student sellers via our secure real-time messaging platform.
                  </p>
                </div>
              </div>

              <div className="space-y-8 text-center md:text-left animate-in fade-in duration-1000 delay-400">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-accent shadow-inner border border-white/5 backdrop-blur-sm mx-auto md:mx-0">
                  <Star size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white">Skill Economy</h3>
                  <p className="text-zinc-300 text-lg leading-relaxed font-medium">
                    Turn your hobbies into a side hustle. Reach thousands of students looking for your unique skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="space-y-4 mb-20">
              <Badge className="bg-accent/10 text-primary font-black uppercase tracking-widest text-[10px] rounded-md px-3 py-1 border-none">Workflow</Badge>
              <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Your Side-Hustle in 3 Steps</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
              {steps.map((step, i) => (
                <div key={i} className="flex-1 max-w-sm group">
                  <div className="relative mb-10 mx-auto w-fit">
                    <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] shadow-inner border-2 border-zinc-100 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      {step.icon}
                    </div>
                    <Badge className="absolute -top-3 -right-3 w-10 h-10 bg-accent text-primary rounded-full border-4 border-white flex items-center justify-center font-black text-base shadow-lg">
                      {i + 1}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-4">{step.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section className="w-full py-32 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] px-3 py-1">Voices from Campus</Badge>
              <h2 className="text-4xl md:text-5xl font-black text-primary italic tracking-tight leading-tight">
                &quot;UniAGORA changed how I survive school...&quot;
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {testimonials.map((t, i) => (
                <Card key={i} className="rounded-[3rem] border-none shadow-sm p-10 bg-white hover:shadow-2xl transition-all duration-500 group">
                  <div className="flex gap-1 text-accent mb-6">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={18} className="fill-accent" />)}
                  </div>
                  <blockquote className="text-xl font-medium text-zinc-700 italic mb-10 leading-relaxed">
                    &quot;{t.text}&quot;
                  </blockquote>
                  <div className="flex items-center gap-4 mt-auto">
                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/10 shadow-sm">
                      <AvatarFallback className="bg-primary/5 text-primary font-black">{t.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-black text-primary text-lg">{t.name}</div>
                      <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{t.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-32 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <HelpCircle size={56} className="text-accent mx-auto mb-2" />
              <h2 className="text-4xl font-black text-primary tracking-tight">Got Questions?</h2>
              <p className="text-zinc-500 font-medium">Everything you need to know about the marketplace.</p>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border rounded-[1.5rem] px-8 py-2 bg-zinc-50/50 hover:bg-white transition-colors border-zinc-100">
                  <AccordionTrigger className="text-lg font-black text-primary hover:no-underline text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-600 font-medium text-base leading-relaxed pb-6 pt-2">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-6 py-32 bg-white">
          <div className="max-w-6xl mx-auto rounded-[4rem] bg-accent p-16 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-accent/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter leading-none">Ready to start earning?</h2>
              <p className="text-primary/70 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-black leading-relaxed">
                Join thousands of students already using UniAGORA to scale their campus side hustles.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                {loading ? (
                  <div className="h-16 w-64 bg-white/30 animate-pulse rounded-2xl"></div>
                ) : user ? (
                  <Button asChild className="h-18 px-12 bg-primary text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-xl gap-2">
                    <Link href="/dashboard">
                      <LayoutDashboard size={24} /> My Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="h-18 px-12 bg-primary text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-xl">
                    <Link href="/signup">Sign Up Now</Link>
                  </Button>
                )}
                <Button variant="outline" asChild className="h-18 px-12 bg-white/90 backdrop-blur-sm border-none text-primary font-black rounded-[1.5rem] shadow-xl hover:bg-white transition-all text-xl gap-3">
                  <Link href="/marketplace">
                    <ShoppingBag size={24} /> Browse Services
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
