"use client";

import { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DevThemeToggler() {
    const [mounted, setMounted] = useState(false);
    const [isNavyTheme, setIsNavyTheme] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || process.env.NODE_ENV !== "development") {
        return null;
    }

    const toggleTheme = (checked: boolean) => {
        setIsNavyTheme(checked);
        if (checked) {
            document.documentElement.classList.add("theme-navy");
        } else {
            document.documentElement.classList.remove("theme-navy");
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-border p-3 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
            <Palette size={18} className="text-muted-foreground" />
            <div className="flex items-center gap-2">
                <Switch
                    id="theme-toggle"
                    checked={isNavyTheme}
                    onCheckedChange={toggleTheme}
                />
                <Label htmlFor="theme-toggle" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {isNavyTheme ? "Navy" : "Forest"}
                </Label>
            </div>
        </div>
    );
}
