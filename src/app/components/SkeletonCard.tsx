import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCard() {
    return (
        <div className="bg-white border border-border-soft rounded-[2rem] p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
            {/* Image Placeholder */}
            <Skeleton className="w-full aspect-[16/10] rounded-[1.5rem] mb-6" />

            {/* Title Placeholder */}
            <Skeleton className="h-8 w-3/4 mb-4" />

            {/* Rating Placeholder */}
            <Skeleton className="h-4 w-1/3 mb-6" />

            {/* User Info Placeholder */}
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                </div>
            </div>

            {/* Price Placeholder */}
            <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
        </div>
    );
}
