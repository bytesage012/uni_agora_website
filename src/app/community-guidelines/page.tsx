import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import {
    Users,
    ShieldAlert,
    MessageCircle,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";

export default function CommunityGuidelines() {
    const freelancerRules = [
        "Be professional and punctual.",
        "Deliver what you promise.",
        "Keep communication clear."
    ];

    const clientRules = [
        "Respect the freelancer's time.",
        "Agree on a price before work starts.",
        "Pay promptly upon completion."
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans text-foreground scroll-smooth">
            <Navbar />

            <main className="flex-grow flex flex-col items-center">
                {/* Hero Section */}
                <section className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20">
                        <ShieldAlert size={12} className="text-primary" />
                        Safety & Trust
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-tight">
                        Keeping the Campus <br className="hidden md:inline" />
                        <span className="text-accent underline decoration-primary/20 decoration-8 underline-offset-8">Ecosystem Safe.</span>
                    </h1>
                    <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                        UniAGORA is built on trust. These guidelines ensure a safe and productive environment for every student on campus.
                    </p>
                </section>

                {/* Guidelines Grid */}
                <section className="w-full py-12 bg-white">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* For Freelancers */}
                            <div className="space-y-8 p-10 bg-bg-soft/30 rounded-[2.5rem] border border-border-soft hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-primary">For Freelancers</h2>
                                <ul className="space-y-4">
                                    {freelancerRules.map((rule, i) => (
                                        <li key={i} className="flex items-start gap-3 text-zinc-600 font-medium">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* For Clients */}
                            <div className="space-y-8 p-10 bg-bg-soft/30 rounded-[2.5rem] border border-border-soft hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary">
                                    <Users size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-primary">For Clients</h2>
                                <ul className="space-y-4">
                                    {clientRules.map((rule, i) => (
                                        <li key={i} className="flex items-start gap-3 text-zinc-600 font-medium">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Red Flags Section */}
                <section className="w-full py-20">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-red-50 p-10 md:p-16 rounded-[3rem] border-2 border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-red-100 opacity-50">
                                <AlertTriangle size={120} />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-red-900 mb-8 flex items-center gap-3">
                                    <ShieldAlert size={32} className="text-red-600" />
                                    The &apos;Red Flags&apos;
                                </h2>
                                <div className="space-y-6 text-red-800 font-bold text-lg md:text-xl leading-relaxed">
                                    <p>Never share your bank PIN.</p>
                                    <p>Avoid meeting in private, secluded off-campus locations.</p>
                                    <p>Report suspicious profiles immediately to Admin.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-20 text-center">
                    <div className="max-w-xl mx-auto px-4">
                        <h3 className="text-2xl font-bold text-primary mb-8">
                            Join the conversation and stay updated with the latest campus opportunities and safety tips.
                        </h3>
                        <Link href="/signup" className="px-10 py-5 bg-primary hover:bg-green-900 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 mx-auto max-w-sm">
                            <MessageCircle size={24} /> Join our Marketplace Community
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
