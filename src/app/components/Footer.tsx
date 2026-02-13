import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full bg-primary py-16 text-white px-4 border-t-2 border-yellow-400">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary">
                                <ShieldCheck size={24} />
                            </div>
                            <Link href="/" className="text-3xl font-bold tracking-tighter">UniAGORA</Link>
                        </div>
                        <p className="text-white/60 max-w-sm leading-relaxed">
                            The first decentralized marketplace built by students, for students. Bridging the gap between skills and opportunities on campus.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-accent">Company</h4>
                        <ul className="space-y-4 text-white/60 text-sm">
                            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                            <li><Link href="/community-guidelines" className="hover:text-white">Community Guidelines</Link></li>
                            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-accent">Social</h4>
                        <ul className="space-y-4 text-white/60 text-sm">
                            <li><a href="#" className="hover:text-white">Instagram</a></li>
                            <li><a href="#" className="hover:text-white">Twitter / X</a></li>
                            <li><Link href="#" className="hover:text-white">Community</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
                    <p>&copy; {new Date().getFullYear()} UniAGORA Marketplace. All rights reserved.</p>
                    <p>Made with ❤️ for Students</p>
                </div>
            </div>
        </footer>
    );
}
