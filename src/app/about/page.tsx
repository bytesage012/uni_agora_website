import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    Shield,
    Handshake,
    Rocket,
    ArrowRight
} from "lucide-react";

export default function AboutPage() {
    const values = [
        {
            title: "Safety First",
            text: "Verified student profiles only.",
            icon: <Shield size={32} />
        },
        {
            title: "Campus Connection",
            text: "Building trust within the university.",
            icon: <Handshake size={32} />
        },
        {
            title: "Growth",
            text: "Helping you turn skills into income.",
            icon: <Rocket size={32} />
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans text-foreground scroll-smooth">
            <Navbar />

            <main className="flex-grow flex flex-col">
                {/* Hero Section */}
                <section className="w-full max-w-6xl mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary leading-tight mb-6">
                        Built for Students, <br className="md:hidden" />
                        <span className="text-accent">by Students.</span>
                    </h1>
                    <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed italic">
                        Empowering the campus economy through trust and skill.
                    </p>
                </section>

                {/* The Story Section */}
                <section className="w-full py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4">
                        <h2 className="text-3xl font-black text-primary mb-8 text-center md:text-left">The Story</h2>
                        <div className="prose prose-lg text-zinc-600 leading-relaxed space-y-6">
                            <p>
                                We know the struggle. You have skills - graphic design, tutoring, repairs - but finding clients on campus is hard. And for students needing help, finding a trustworthy person is even harder.
                            </p>
                            <p>
                                We built UniAGORA to bridge that gap. Starting with a mission to empower university students, our goal was to create a place where every interaction starts with verification and ends with mutual success.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Our Mission Section */}
                <section className="w-full py-20 bg-bg-soft/50">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-accent p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden transform rotate-1 md:rotate-0">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                            <h2 className="text-3xl font-black text-primary mb-6 relative z-10">Our Mission</h2>
                            <p className="text-primary text-xl md:text-2xl font-bold leading-tight relative z-10">
                                &quot;To create a safe, verified campus economy where every student can achieve financial independence using the skills they already have.&quot;
                            </p>
                        </div>
                    </div>
                </section>

                {/* Core Values Section */}
                <section className="w-full py-20 bg-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-black text-primary mb-16 text-center">Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {values.map((v, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-8 bg-bg-soft/30 rounded-3xl border border-transparent hover:border-primary transition-all">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 text-primary">
                                        {v.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-primary mb-4">{v.title}</h3>
                                    <p className="text-zinc-600 leading-relaxed">
                                        {v.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-20 bg-primary text-white">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">Ready to join the community?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact" className="px-10 py-5 bg-accent text-primary font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                Join Waitlist <ArrowRight size={20} />
                            </Link>
                            <Link href="/contact" className="px-10 py-5 bg-white/10 text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-colors flex items-center justify-center">
                                Contact the Team
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
