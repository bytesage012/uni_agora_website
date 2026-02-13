import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    MessageCircle,
    Mail,
    ArrowRight
} from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans text-foreground scroll-smooth">
            <Navbar />

            <main className="flex-grow flex flex-col">
                {/* Hero Section */}
                <section className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-primary mb-6">
                        Need Help or Have a Suggestion?
                    </h1>
                    <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                        We are currently in Beta. Your feedback helps us build better.
                    </p>
                </section>

                {/* Contact Cards Section */}
                <section className="w-full py-12 bg-white">
                    <div className="max-w-2xl mx-auto px-4">
                        <div className="flex flex-col items-center">
                            {/* Email Card */}
                            <div className="w-full p-8 bg-bg-soft/30 rounded-3xl border-2 border-primary/5 hover:border-primary/20 transition-all flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                    <Mail size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-primary mb-2">Email Us</h3>
                                <p className="text-zinc-600 mb-8 font-medium">support@uniagora.com</p>
                                <a href="mailto:support@uniagora.com" className="w-full py-4 bg-white text-primary border-2 border-primary/10 hover:border-primary hover:bg-primary hover:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                                    Send an Email
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="w-full py-20 bg-bg-soft/20">
                    <div className="max-w-2xl mx-auto px-4">
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border-soft">
                            <h2 className="text-3xl font-black text-primary mb-8">Send a Message</h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-primary ml-1">Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-primary ml-1">Email</label>
                                        <input
                                            type="email"
                                            placeholder="Your Student Email"
                                            className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-primary ml-1">Subject</label>
                                    <select className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all appearance-none cursor-pointer">
                                        <option value="general">General Inquiry</option>
                                        <option value="report">Report a User</option>
                                        <option value="bug">Bug Fix</option>
                                        <option value="suggestion">Feature Suggestion</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-primary ml-1">Message</label>
                                    <textarea
                                        rows={4}
                                        placeholder="How can we help you?"
                                        className="w-full p-4 bg-bg-soft/50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button className="w-full py-5 bg-primary text-accent font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2">
                                    Send Message <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
