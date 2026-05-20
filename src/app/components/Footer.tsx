import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
    return (
        <footer className="w-full bg-primary py-16 text-primary-foreground px-6 border-t-4 border-accent">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-lg shadow-black/20">
                                <ShieldCheck size={24} />
                            </div>
                            <Link href="/" className="text-3xl font-black tracking-tighter italic">UniAGORA</Link>
                        </div>
                        <p className="text-primary-foreground/60 max-w-sm leading-relaxed font-medium">
                            The first decentralized marketplace built by students, for students. Bridging the gap between skills and opportunities on campus.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black mb-6 text-accent uppercase tracking-widest text-sm">Company</h4>
                        <ul className="space-y-4 text-primary-foreground/60 text-sm font-bold">
                            <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
                            <li><Link href="/community-guidelines" className="hover:text-accent transition-colors">Community Guidelines</Link></li>
                            <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black mb-6 text-accent uppercase tracking-widest text-sm">Social</h4>
                        <ul className="space-y-4 text-primary-foreground/60 text-sm font-bold">
                            <li><a href="#" className="hover:text-accent transition-colors">Instagram</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Twitter / X</a></li>
                            <li><Link href="#" className="hover:text-accent transition-colors">Community</Link></li>
                        </ul>
                    </div>
                </div>
                <Separator className="bg-primary-foreground/10" />
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary-foreground/40">
                    <p>&copy; {new Date().getFullYear()} UniAGORA Marketplace. All rights reserved.</p>
                    <p className="flex items-center gap-1.5">
                        Made with <Heart size={12} className="text-accent fill-accent" /> for Students
                    </p>
                </div>
            </div>
        </footer>
    );
}
