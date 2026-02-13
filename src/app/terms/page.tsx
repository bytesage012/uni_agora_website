import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-zinc-900 scroll-smooth">
            <Navbar />

            <main className="flex-grow flex flex-col items-center">
                <article className="max-w-3xl w-full px-6 py-20">
                    <header className="mb-16">
                        <h1 className="text-4xl md:text-5xl font-black text-primary mb-4">Terms of Service</h1>
                        <p className="text-zinc-500 text-sm">Last Updated: February 8, 2026</p>
                    </header>

                    <div className="space-y-12 text-[15px] leading-relaxed text-zinc-700">
                        {/* Introduction */}
                        <section>
                            <h2 className="text-xl font-bold text-primary mb-4">1. Introduction</h2>
                            <p>
                                Welcome to UniAGORA. By using this platform, you agree to these terms. These terms govern your access to and use of our services, including our website and any other software or tools provided by UniAGORA (collectively, the &quot;Platform&quot;).
                            </p>
                        </section>

                        {/* Platform Role */}
                        <section className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <h2 className="text-xl font-bold text-primary mb-4">2. The Platform&apos;s Role</h2>
                            <div className="space-y-4">
                                <p className="font-bold text-zinc-900 uppercase text-xs tracking-wider">Important Notice</p>
                                <p>
                                    UniAGORA is a directory and connection platform only. We provide a space for students to list services and connect with peers.
                                </p>
                                <p className="font-medium text-primary">
                                    We do not handle payments, escrow, or guarantee the quality of work. All transactions happen directly between students. UniAGORA is not a party to any agreement between users.
                                </p>
                            </div>
                        </section>

                        {/* User Conduct */}
                        <section>
                            <h2 className="text-xl font-bold text-primary mb-4">3. User Conduct & Eligibility</h2>
                            <ul className="list-disc pl-5 space-y-3">
                                <li><strong>Eligibility:</strong> Users must be current university students with a valid student ID.</li>
                                <li><strong>Prohibited Items:</strong> Listing illegal items, academic dishonesty services, or any content that violates university policies is strictly forbidden.</li>
                                <li><strong>Enforcement:</strong> Harassment, scams, or listing prohibited items will result in an immediate and permanent ban from the Platform.</li>
                            </ul>
                        </section>

                        {/* Safety Disclaimer */}
                        <section className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                                4. Safety Disclaimer
                            </h2>
                            <div className="space-y-4">
                                <p>
                                    Your safety is our priority, but you are responsible for your own interactions.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 bg-white rounded-xl shadow-sm">
                                        <p className="font-bold text-xs mb-1 text-accent">PUBLIC MEETINGS</p>
                                        <p className="text-sm">Please meet in public places (like the Library or Student Union) for physical services.</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl shadow-sm">
                                        <p className="font-bold text-xs mb-1 text-accent">PAYMENT SAFETY</p>
                                        <p className="text-sm">Do not send money before verifying the service. Use caution with bank transfers.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Limitation of Liability */}
                        <section>
                            <h2 className="text-xl font-bold text-primary mb-4">5. Limitation of Liability</h2>
                            <p className="text-sm italic">
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
