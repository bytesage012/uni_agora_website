"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    ShieldCheck,
    LogOut,
    LayoutDashboard,
    ShoppingBag,
    Menu,
    User as UserIcon,
    MessageSquare,
    Search,
    Users,
    Bell,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
    id: string;
    title: string;
    content: string;
    created_at: string;
    is_read: boolean;
    link?: string;
    type?: string;
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);



    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        const initNotifications = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: notifs, error: notifError } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (!notifError && notifs) {
                    setNotifications(notifs);
                    setUnreadCount(notifs.filter(n => !n.is_read).length);
                }

                const channel = supabase
                    .channel(`user-notifs-${session.user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: `user_id=eq.${session.user.id}`
                        },
                        (payload) => {
                            setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 5));
                            setUnreadCount(c => c + 1);
                        }
                    )
                    .subscribe();

                return channel;
            }
            return null;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let notificationChannel: any = null;
        initNotifications().then(channel => {
            notificationChannel = channel;
        });

        return () => {
            subscription.unsubscribe();
            if (notificationChannel) supabase.removeChannel(notificationChannel);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);

            if (!error) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);

            if (!error) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }
        if (notif.link) {
            router.push(notif.link);
        }
    };

    return (
        <nav className="sticky top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b shadow-sm transition-all duration-300">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border group-hover:scale-110 transition-transform">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-2xl font-black text-primary tracking-tighter italic">UniAGORA</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Link href="/marketplace" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        <ShoppingBag className="mr-2 h-4 w-4" /> Marketplace
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/community" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        <Users className="mr-2 h-4 w-4" /> Community
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-accent text-accent-foreground text-[10px] font-bold">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl">
                                <DropdownMenuLabel className="p-4 flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary">Notifications</span>
                                    <Button variant="ghost" size="sm" className="text-[10px] h-auto p-0 hover:bg-transparent text-muted-foreground hover:text-primary" onClick={markAllAsRead}>
                                        Mark all read
                                    </Button>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <ScrollArea className="h-80">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No notifications yet</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <DropdownMenuItem
                                                key={notif.id}
                                                className={`p-4 cursor-pointer focus:bg-muted ${!notif.is_read ? 'bg-primary/5' : ''}`}
                                                onClick={() => handleNotificationClick(notif)}
                                            >
                                                <div className="flex gap-3">
                                                    {!notif.is_read && <div className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />}
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black text-primary leading-none">{notif.title}</p>
                                                        <p className="text-[11px] text-muted-foreground line-clamp-2">{notif.content}</p>
                                                        <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
                                                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </ScrollArea>
                                <DropdownMenuSeparator />
                                <div className="p-2">
                                    <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest h-8" asChild>
                                        <Link href="/notifications">View All</Link>
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Link href="/about" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors px-3 py-2">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors px-3 py-2">
                        Support
                    </Link>

                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-24 rounded-xl" />
                            <Skeleton className="h-9 w-24 rounded-xl" />
                        </div>
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 overflow-hidden border bg-muted/50">
                                    <Avatar className="h-full w-full rounded-none">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {user.email?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground truncate">
                                    {user.email}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {user.email === 'bytesage013@gmail.com' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin" className="flex items-center text-red-600 focus:text-red-600 cursor-pointer">
                                            <ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="cursor-pointer">
                                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/messages" className="cursor-pointer">
                                        <MessageSquare className="mr-2 h-4 w-4" /> Messages
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <UserIcon className="mr-2 h-4 w-4" /> Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button className="rounded-xl shadow-lg shadow-primary/20" asChild>
                                <Link href="/signup">Join Now</Link>
                            </Button>
                        </div>
                    )}

                    {pathname === '/marketplace' && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-xl border shadow-sm"
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                if (params.get('f') === 'off') params.delete('f');
                                else params.set('f', 'off');
                                router.push(`/marketplace?${params.toString()}`, { scroll: false });
                            }}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="flex md:hidden items-center gap-2">
                    {pathname === '/marketplace' && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                if (params.get('f') === 'off') params.delete('f');
                                else params.set('f', 'off');
                                router.push(`/marketplace?${params.toString()}`, { scroll: false });
                            }}
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    )}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-lg">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader className="text-left">
                                <SheetTitle className="text-2xl font-black italic text-primary tracking-tighter">UniAGORA</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-6 py-8">
                                <Link href="/marketplace" className="flex items-center gap-3 text-lg font-black text-primary hover:text-accent transition-colors">
                                    <ShoppingBag size={20} /> Marketplace
                                </Link>
                                <Link href="/community" className="flex items-center gap-3 text-lg font-black text-primary hover:text-accent transition-colors">
                                    <Users size={20} /> Community
                                </Link>
                                <Link href="/about" className="text-lg font-black text-primary hover:text-accent transition-colors">About Us</Link>
                                <Link href="/contact" className="text-lg font-black text-primary hover:text-accent transition-colors">Support</Link>

                                <Separator />

                                {user ? (
                                    <>
                                        {user.email === 'bytesage013@gmail.com' && (
                                            <Link href="/admin" className="flex items-center gap-3 text-lg font-black text-red-600 hover:text-red-700">
                                                <ShieldCheck size={20} /> Admin Panel
                                            </Link>
                                        )}
                                        <Link href="/dashboard" className="flex items-center gap-3 text-lg font-black text-primary hover:text-accent transition-colors">
                                            <LayoutDashboard size={20} /> My Dashboard
                                        </Link>
                                        <Link href="/messages" className="flex items-center gap-3 text-lg font-black text-primary hover:text-accent transition-colors">
                                            <MessageSquare size={20} /> My Messages
                                        </Link>
                                        <Link href="/profile" className="text-lg font-black text-primary hover:text-accent transition-colors">My Profile</Link>
                                        <Button variant="secondary" className="mt-4 w-full justify-center gap-2" onClick={handleLogout}>
                                            <LogOut size={20} /> Logout
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <Button variant="secondary" className="w-full h-12 rounded-xl text-lg font-black" asChild>
                                            <Link href="/login">Login</Link>
                                        </Button>
                                        <Button className="w-full h-12 rounded-xl text-lg font-black shadow-lg" asChild>
                                            <Link href="/signup">Join Now</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav >
    );
}
