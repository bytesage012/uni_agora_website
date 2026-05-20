"use client";

import Link from "next/link";
import { SearchX, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel p-12 rounded-[3rem] flex flex-col items-center text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="relative">
          <div className="w-24 h-24 bg-emerald-50 text-primary rounded-[2rem] flex items-center justify-center shadow-inner relative z-10">
            <SearchX size={48} />
          </div>
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full transform scale-150 -z-10"></div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-5xl font-black text-primary tracking-tighter">404</h2>
          <h3 className="text-2xl font-bold text-zinc-800 tracking-tight">Page not found</h3>
          <p className="text-zinc-500 font-medium leading-relaxed max-w-sm mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
          <Button 
            asChild
            variant="outline"
            className="flex-1 rounded-2xl h-14 gap-2 border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100"
          >
            <Link href="/marketplace">
              <Search size={18} /> Browse Marketplace
            </Link>
          </Button>
          <Button 
            asChild
            className="flex-1 rounded-2xl h-14 gap-2 bg-primary hover:bg-primary-hover text-white font-bold"
          >
            <Link href="/">
              <Home size={18} /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
