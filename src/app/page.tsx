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
  Trophy,
  Zap,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { title: "Writing & Translation", icon: <PenTool size={24} />, count: "45+ Freelancers", color: "bg-emerald-50 text-emerald-700" },
    { title: "Graphic Design", icon: <Camera size={24} />, count: "32+ Freelancers", color: "bg-amber-50 text-amber-700" },
    { title: "Tutoring & Lessons", icon: <BookOpen size={24} />, count: "60+ Tutors", color: "bg-green-50 text-green-700" },
    { title: "Tech & Programming", icon: <Monitor size={24} />, count: "28+ Developers", color: "bg-teal-50 text-teal-700" },
    { title: "Fashion & Style", icon: <ShoppingBag size={24} />, count: "20+ Designers", color: "bg-yellow-50 text-yellow-700" },
    { title: "Food & Groceries", icon: <ShoppingBag size={24} />, count: "15+ Vendors", color: "bg-lime-50 text-lime-700" },
  ];

  const steps = [
    { title: "Create Profile", description: "Register with your verified student identity and set up your portfolio.", icon: <Users size={32} /> },
    { title: "Browse or Post", description: "Discover high-quality campus services or post your own skill listing.", icon: <Search size={32} /> },
    { title: "Connect Safely", description: "Chat in real-time, negotiate details, and close the deal on campus.", icon: <MessageCircle size={32} /> },
  ];

  const testimonials = [
    { name: "Adebayo S.", role: "300L, Economics", text: "UniAGORA helped me find a tutor for Econometrics in less than an hour. Amazing service!", rating: 5, avatar: "AS", university: "Unilag" },
    { name: "Fatima R.", role: "400L, Law", text: "I've earned over ₦20,000 this month writing essays and summaries for classmates. The platform is safe, easy, and payout is direct.", rating: 5, avatar: "FR", university: "UI" },
  ];

  const faqs = [
    { q: "Is UniAGORA only for specific students?", a: "No, we are open to students from all universities to ensure a wide and trusted peer-to-peer marketplace." },
    { q: "How are students verified?", a: "We require student ID documentation or a school email to ensure every buyer and seller is a real, active university student." },
    { q: "Is there a fee for using the platform?", a: "Joining and browsing is completely free. Listings are free for all students to foster a strong campus economy." },
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
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] font-sans text-[#002217] scroll-smooth">
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mesh-gradient-light">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-8 text-left max-w-3xl animate-in fade-in slide-in-from-left-8 duration-1000">
            <Badge variant="secondary" className="px-5 py-2 rounded-full bg-accent/20 text-[#003D29] font-black uppercase tracking-[0.15em] text-[10px] border border-accent/30 flex items-center gap-2 w-fit">
              <Trophy size={12} className="text-accent fill-accent animate-pulse" />
              The #1 Student Marketplace in Nigeria
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight text-primary leading-[1.0] drop-shadow-sm">
              Hire Student Talents. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-800 to-accent drop-shadow-sm">
                Earn on Campus.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-600 max-w-xl leading-relaxed font-medium">
              The verified peer-to-peer marketplace. Buy study guides, design services, or tutoring from talented classmates safely.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              {loading ? (
                <div className="h-16 w-56 bg-zinc-200 animate-pulse rounded-2xl"></div>
              ) : user ? (
                <>
                  <Button asChild className="h-16 px-8 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-base gap-2">
                    <Link href="/dashboard">
                      <LayoutDashboard size={20} /> Go to Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-16 px-8 border-2 border-primary text-primary font-black rounded-2xl hover:bg-primary/5 transition-all text-base">
                    <Link href="/marketplace">Explore Marketplace</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="h-16 px-8 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-base gap-2">
                    <Link href="/signup">
                      Join the Ecosystem <ArrowRight size={20} />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-16 px-8 border-2 border-primary text-primary font-black rounded-2xl hover:bg-primary/5 transition-all text-base">
                    <Link href="/login">Merchant Login</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-zinc-200 max-w-md">
              <div>
                <p className="text-3xl font-black text-primary">10k+</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Students</p>
              </div>
              <div>
                <p className="text-3xl font-black text-primary">₦5M+</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Classroom Earned</p>
              </div>
              <div>
                <p className="text-3xl font-black text-primary">100%</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Verified Users</p>
              </div>
            </div>
          </div>

          {/* Right Cards Collage (Visual Proof of Marketplace) */}
          <div className="lg:col-span-5 relative w-full h-[500px] hidden md:block animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            
            {/* Card 1: Tutoring */}
            <div className="absolute top-4 left-6 w-72 bg-white rounded-3xl p-6 shadow-xl border border-zinc-100/80 -rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 z-20">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-green-50 text-green-700 hover:bg-green-50 text-[10px] font-black uppercase tracking-wider rounded-lg border-none px-2.5 py-1">
                  Tutoring
                </Badge>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-primary">5.0</span>
                </div>
              </div>
              <h4 className="text-base font-black text-primary mb-4 leading-snug">Calculus & Algebra Exam Prep sessions</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">AS</AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-black text-zinc-700">Adebayo S.</p>
                </div>
                <Badge className="bg-primary text-white text-xs font-black px-3 py-1 rounded-xl">₦3,000/hr</Badge>
              </div>
            </div>

            {/* Card 2: Design */}
            <div className="absolute top-48 right-6 w-72 bg-white rounded-3xl p-6 shadow-2xl border border-zinc-100/80 rotate-6 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 z-30">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50 text-[10px] font-black uppercase tracking-wider rounded-lg border-none px-2.5 py-1">
                  Design
                </Badge>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-primary">4.9</span>
                </div>
              </div>
              <h4 className="text-base font-black text-primary mb-4 leading-snug">Sleek Pitch-Deck & PDF Assignment Design</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">FR</AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-black text-zinc-700">Fatima R.</p>
                </div>
                <Badge className="bg-primary text-white text-xs font-black px-3 py-1 rounded-xl">₦8,000</Badge>
              </div>
            </div>

            {/* Card 3: Programming */}
            <div className="absolute bottom-4 left-10 w-72 bg-white rounded-3xl p-6 shadow-xl border border-zinc-100/80 -rotate-2 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 z-10 opacity-90">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 text-[10px] font-black uppercase tracking-wider rounded-lg border-none px-2.5 py-1">
                  Programming
                </Badge>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-primary">4.8</span>
                </div>
              </div>
              <h4 className="text-base font-black text-primary mb-4 leading-snug">Next.js & Flask Web Development Help</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">TO</AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-black text-zinc-700">Tobi O.</p>
                </div>
                <Badge className="bg-primary text-white text-xs font-black px-3 py-1 rounded-xl">₦15,000</Badge>
              </div>
            </div>

            {/* Visual glow element behind the cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="w-full py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-3">
                <Badge variant="outline" className="text-primary font-black uppercase tracking-widest text-[10px] rounded-md px-3 py-1 border-primary/20 bg-[#F0F4F1]">
                  Marketplace Catalog
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Explore Top Campus Categories</h2>
                <p className="text-zinc-500 font-medium text-lg">Hire peers for custom projects, tutoring, or fast campus deliveries.</p>
              </div>
              <Button variant="ghost" asChild className="text-primary font-black gap-2 hover:bg-[#F0F4F1] p-4 rounded-xl">
                <Link href="/marketplace">
                  View all services <ArrowRight size={18} />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {categories.map((cat, i) => (
                <Card key={i} className="group rounded-[2rem] border border-zinc-100 hover:border-emerald-700/20 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden bg-white">
                  <Link href={`/marketplace?category=${encodeURIComponent(cat.title)}`} className="p-8 flex flex-col items-center text-center h-full justify-between">
                    <div className={`w-16 h-16 ${cat.color} rounded-[1.25rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-sm`}>
                      {cat.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-primary leading-tight">{cat.title}</h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{cat.count}</p>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="w-full py-32 bg-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-[250px] -mt-[250px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -ml-[250px] -mb-[250px]"></div>
          
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <Badge className="bg-white/10 text-accent font-black uppercase tracking-widest text-[10px] rounded-md px-3 py-1 border-none">
                Safety & Trust
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Built Exclusively for Students</h2>
              <p className="text-zinc-300 text-lg font-medium">A marketplace model optimized for university campuses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              
              {/* Feature 1 */}
              <div className="glass-panel-dark rounded-[2.5rem] p-10 border border-white/5 space-y-8 flex flex-col justify-between hover:scale-[1.02] hover:bg-white/5 duration-300">
                <div className="w-16 h-16 bg-white/10 rounded-[1.25rem] flex items-center justify-center text-accent shadow-inner border border-white/10">
                  <ShieldCheck size={36} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">Student ID Verification</h3>
                  <p className="text-zinc-300 text-base leading-relaxed font-medium">
                    Every member registers using valid university credentials. Our team manually verifies student identities so you know who you are transacting with.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel-dark rounded-[2.5rem] p-10 border border-white/5 space-y-8 flex flex-col justify-between hover:scale-[1.02] hover:bg-white/5 duration-300">
                <div className="w-16 h-16 bg-white/10 rounded-[1.25rem] flex items-center justify-center text-accent shadow-inner border border-white/10">
                  <Zap size={36} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">Direct Real-Time Chat</h3>
                  <p className="text-zinc-300 text-base leading-relaxed font-medium">
                    No middlemen or commission delays. Text listings and chat instantly with classmates using our custom, high-speed campus message suite.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel-dark rounded-[2.5rem] p-10 border border-white/5 space-y-8 flex flex-col justify-between hover:scale-[1.02] hover:bg-white/5 duration-300">
                <div className="w-16 h-16 bg-white/10 rounded-[1.25rem] flex items-center justify-center text-accent shadow-inner border border-white/10">
                  <Sparkles size={36} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">Monetize Your Skills</h3>
                  <p className="text-zinc-300 text-base leading-relaxed font-medium">
                    Whether you write codes, design graphics, bake pastries, or prep peers for exams, you can list your side hustle for free to reach your entire university client base.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
            <div className="space-y-4 mb-24">
              <Badge className="bg-accent/15 text-primary font-black uppercase tracking-widest text-[10px] rounded-md px-3 py-1">
                How It Works
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Start Buying & Selling in 3 Steps</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center group relative z-10">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-[#F0F4F1] rounded-[2rem] shadow-inner border border-zinc-200/50 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      {step.icon}
                    </div>
                    <Badge className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-primary rounded-full border-2 border-white flex items-center justify-center font-black text-sm shadow-md">
                      {i + 1}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3">{step.title}</h3>
                  <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-xs">{step.description}</p>
                </div>
              ))}

              {/* Decorative Connector Line */}
              <div className="absolute top-12 left-[15%] right-[15%] h-0.5 bg-zinc-100 hidden md:block -z-0"></div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section className="w-full py-32 bg-[#F8FAF7]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-3">
                <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] px-3 py-1 bg-[#F0F4F1]">
                  Testimonials
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Loved by Student Merchants</h2>
                <p className="text-zinc-500 font-medium text-lg">See how UniAGORA members are scaling their campus economies.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {testimonials.map((t, i) => (
                <Card key={i} className="rounded-[2.5rem] border border-zinc-100 shadow-sm p-10 bg-white hover:shadow-xl transition-all duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-0.5 text-accent">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} className="fill-accent text-accent" />)}
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 border-none">
                      {t.university} Verified
                    </Badge>
                  </div>
                  <blockquote className="text-lg font-medium text-zinc-700 italic mb-8 leading-relaxed">
                    &quot;{t.text}&quot;
                  </blockquote>
                  <div className="flex items-center gap-4 mt-auto">
                    <Avatar className="h-12 w-12 rounded-xl border border-zinc-100 shadow-sm">
                      <AvatarFallback className="bg-primary/5 text-primary font-black">{t.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-black text-primary text-base">{t.name}</div>
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t.role}</div>
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
              <HelpCircle size={48} className="text-accent mx-auto mb-2" />
              <h2 className="text-4xl font-black text-primary tracking-tight">Got Questions?</h2>
              <p className="text-zinc-500 font-medium">Everything you need to know about navigating the ecosystem.</p>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl px-6 py-1 bg-[#F8FAF7] hover:bg-white transition-colors border-zinc-200/50">
                  <AccordionTrigger className="text-base font-black text-primary hover:no-underline text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-600 font-medium text-sm leading-relaxed pb-6 pt-2">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-6 py-32 bg-white">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-accent p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-accent/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent"></div>
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tight leading-none">Ready to Start Earning?</h2>
              <p className="text-primary/70 text-lg md:text-xl max-w-xl mx-auto font-bold leading-relaxed">
                Join thousands of student vendors and clients scaling campus side hustles today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                {loading ? (
                  <div className="h-16 w-52 bg-white/20 animate-pulse rounded-2xl"></div>
                ) : user ? (
                  <Button asChild className="h-16 px-10 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-base gap-2">
                    <Link href="/dashboard">
                      <LayoutDashboard size={20} /> My Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="h-16 px-10 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-base">
                    <Link href="/signup">Sign Up Now</Link>
                  </Button>
                )}
                <Button variant="outline" asChild className="h-16 px-10 bg-white/95 border-none text-primary font-black rounded-2xl shadow-lg hover:bg-white transition-all text-base gap-2">
                  <Link href="/marketplace">
                    <ShoppingBag size={20} /> Browse Services
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
