"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center shadow-inner">
          <AlertTriangle size={40} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-primary tracking-tight">Something went wrong!</h2>
          <p className="text-zinc-500 font-medium leading-relaxed">
            We encountered an unexpected error. Please try refreshing or return to the dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
          <Button 
            onClick={() => reset()}
            variant="outline"
            className="flex-1 rounded-2xl h-12 gap-2 border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100"
          >
            <RefreshCcw size={18} /> Try Again
          </Button>
          <Button 
            asChild
            className="flex-1 rounded-2xl h-12 gap-2 bg-primary hover:bg-primary-hover text-white font-bold"
          >
            <Link href="/dashboard">
              <Home size={18} /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
