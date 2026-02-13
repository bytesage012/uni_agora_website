"use client";

import { useState, useEffect } from "react";
import { Palette } from "lucide-react";

export default function DevThemeToggler() {
    const [mounted, setMounted] = useState(false);
    const [isNavyTheme, setIsNavyTheme] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        // Check local storage or existing class if needed
    }, []);

    if (!mounted || process.env.NODE_ENV !== "development") {
        return null;
    }

    const toggleTheme = () => {
        const isNowNavy = !isNavyTheme;
        setIsNavyTheme(isNowNavy);
        console.log("Toggling theme. Is now navy:", isNowNavy);

        if (isNowNavy) {
            document.documentElement.classList.add("theme-navy");
            console.log("Added .theme-navy to html element");
        } else {
            document.documentElement.classList.remove("theme-navy");
            console.log("Removed .theme-navy from html element");
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-50 border-2 border-accent"
            title="Toggle Developer Theme"
        >
            <Palette size={24} />
            <span className="sr-only">Toggle Theme</span>
        </button>
    );
}
