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
  LayoutDashboard
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { title: "Writing & Translation", icon: <PenTool size={24} />, count: "45+ Freelancers" },
    { title: "Graphic Design", icon: <Camera size={24} />, count: "32+ Freelancers" },
    { title: "Tutoring & Lessons", icon: <BookOpen size={24} />, count: "60+ Tutors" },
    { title: "Tech & Programming", icon: <Monitor size={24} />, count: "28+ Developers" },
    { title: "Marketing & Sales", icon: <Search size={24} />, count: "15+ Experts" },
    { title: "Product Marketplace", icon: <ShoppingBag size={24} />, count: "100+ Items" },
  ];

  const steps = [
    { title: "Create Profile", description: "Register with your student ID.", icon: <Users size={32} /> },
    { title: "Browse or Post", description: "Find services you need or list your own skills.", icon: <Search size={32} /> },
    { title: "Connect", description: "Message instantly via our platform to finalize deals.", icon: <MessageCircle size={32} /> },
  ];

  const testimonials = [
    { name: "Adebayo S.", role: "300L, Economics", text: "UniAGORA helped me find a tutor for Econometrics in less than an hour. Amazing service!", rating: 5 },
    { name: "Fatima R.", role: "400L, Law", text: "I've earned over 20k this month writing essays and summaries for classmates. The platform is safe and easy.", rating: 5 },
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
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground scroll-smooth">
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden w-full max-w-6xl mx-auto px-4 py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-6 border border-accent/20">
            <Star size={12} className="fill-accent" />
            The #1 Student Marketplace
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-primary leading-[1.1]">
              Earn. Find. <br className="md:hidden" />
              <span className="text-accent underline decoration-primary/20 decoration-8 underline-offset-8">Connect.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 max-w-[600px] mx-auto leading-relaxed">
              The verified student marketplace for all universities. <br className="hidden md:inline" />
              Hire skilled peers or sell your services safely on campus.
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {loading ? (
              <div className="h-16 w-64 bg-zinc-100 animate-pulse rounded-2xl"></div>
            ) : user ? (
              <>
                <Link href="/dashboard" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:bg-green-900 transition-all transform hover:-translate-y-0.5 active:scale-95 text-base sm:text-lg flex items-center justify-center gap-2">
                  <LayoutDashboard size={20} /> My Dashboard
                </Link>
                <Link href="/marketplace" className="px-8 py-4 bg-white text-primary border-2 border-primary font-black rounded-2xl shadow-sm hover:bg-bg-soft transition-all transform hover:-translate-y-0.5 active:scale-95 text-base sm:text-lg text-center">
                  Explore Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:bg-green-900 transition-all transform hover:-translate-y-0.5 active:scale-95 text-base sm:text-lg flex items-center justify-center gap-2">
                  Join the Ecosystem <ArrowRight size={20} />
                </Link>
                <Link href="/login" className="px-8 py-4 bg-white text-primary border-2 border-primary font-black rounded-2xl shadow-sm hover:bg-bg-soft transition-all transform hover:-translate-y-0.5 active:scale-95 text-base sm:text-lg text-center">
                  Freelancer Login
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section id="services" className="w-full py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="text-left">
                <h2 className="text-3xl font-black text-primary mb-2">Explore the Marketplace</h2>
                <p className="text-zinc-600">Find exactly what you need to succeed this semester.</p>
              </div>
              <Link href="/marketplace" className="text-primary font-bold flex items-center gap-1 hover:text-accent transition-colors">
                View all services <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => (
                <Link href={`/marketplace?category=${encodeURIComponent(cat.title)}`} key={i} className="group p-6 bg-white rounded-2xl border-premium shadow-premium hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer text-center md:text-left">
                  <div className="w-12 h-12 bg-bg-soft rounded-2xl flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-sm text-primary group-hover:text-primary transition-colors">{cat.title}</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">{cat.count}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Highlights */}
        <section className="w-full bg-primary py-20 text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-3">100% Student Verified</h3>
                <p className="text-white/70 leading-relaxed">
                  Every user must provide a valid student ID. We prioritize campus safety above all else.
                </p>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                  <MessageCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Instant Deals</h3>
                <p className="text-white/70 leading-relaxed">
                  Skip the middleman. Connect directly with sellers and buy via our platform for faster communication.
                </p>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                  <Star size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Skill Marketplace</h3>
                <p className="text-white/70 leading-relaxed">
                  Tired of being broke on campus? Turn your hobbies into a side hustle and reach thousands of students.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 bg-bg-soft/30">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-primary mb-12">Your Campus Side-Hustle in 3 Steps</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              {steps.map((step, i) => (
                <div key={i} className="flex-1 max-w-sm flex flex-col items-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border-2 border-primary/10 flex items-center justify-center text-primary mb-6">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full border-4 border-white flex items-center justify-center text-white font-black text-xs">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                  <p className="text-zinc-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="w-full py-20 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-black text-primary text-center mb-16 italic">&quot;UniAGORA changed how I survive school...&quot;</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <div key={i} className="p-8 bg-white rounded-2xl border-premium shadow-premium flex flex-col gap-4 relative hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex gap-1 text-accent">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} className="fill-accent" />)}
                  </div>
                  <div className="text-lg font-medium text-zinc-700 italic">&quot;{t.text}&quot;</div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-primary">{t.name}</div>
                      <div className="text-sm text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20 bg-bg-soft/30">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <HelpCircle size={48} className="text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-black text-primary">Got Questions?</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-border-soft hover:border-primary transition-colors">
                  <h3 className="font-bold text-primary mb-2 flex items-start gap-2">
                    <span className="text-accent">Q:</span> {faq.q}
                  </h3>
                  <p className="text-zinc-600 pl-7 text-sm leading-relaxed">
                    <span className="font-bold text-primary mr-1">A:</span> {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full px-4 py-20 bg-white">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-accent p-12 text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl"></div>

            <h2 className="text-4xl md:text-5xl font-black text-primary mb-6">Ready to start earning?</h2>
            <p className="text-primary/80 text-lg mb-10 max-w-xl mx-auto font-medium">
              Join thousands of students across campuses already using UniAGORA to scale their side hustles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {loading ? (
                <div className="h-16 w-48 bg-white/50 animate-pulse rounded-2xl"></div>
              ) : user ? (
                <Link href="/dashboard" className="px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-2xl hover:bg-green-900 active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <LayoutDashboard size={20} /> My Dashboard
                </Link>
              ) : (
                <Link href="/signup" className="px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-2xl hover:bg-green-900 active:scale-95 transition-transform flex items-center justify-center">
                  Sign Up Now
                </Link>
              )}
              <Link href="/marketplace" className="px-10 py-5 bg-white text-primary font-black rounded-2xl shadow-lg border border-primary/10 hover:bg-bg-soft transition-colors font-sans flex items-center justify-center gap-2">
                <ShoppingBag size={20} /> Browse Services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
