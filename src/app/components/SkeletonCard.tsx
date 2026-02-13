export default function SkeletonCard() {
    return (
        <div className="bg-white border border-border-soft rounded-[2rem] p-6 shadow-sm flex flex-col h-full animate-pulse relative overflow-hidden">
            {/* Shimmer Overlay effect can be added here if needed, but animate-pulse is standard. 
                To make it 'shimmer' more like a wave, we would need a custom animation. 
                For now, we'll keep the pulse but make it sychronized. 
            */}
            {/* Image Placeholder */}
            <div className="w-full aspect-[16/10] bg-zinc-100 rounded-[1.5rem] mb-6"></div>

            {/* Title Placeholder */}
            <div className="h-8 bg-zinc-100 rounded-xl w-3/4 mb-4"></div>

            {/* Rating Placeholder */}
            <div className="h-4 bg-zinc-100 rounded-lg w-1/3 mb-6"></div>

            {/* User Info Placeholder */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-zinc-100 rounded-2xl"></div>
                <div className="flex flex-col gap-2">
                    <div className="h-3 bg-zinc-100 rounded-lg w-24"></div>
                    <div className="h-2 bg-zinc-100 rounded-lg w-16"></div>
                </div>
            </div>

            {/* Price Placeholder */}
            <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                <div className="h-8 bg-zinc-100 rounded-xl w-20"></div>
                <div className="w-10 h-10 bg-zinc-100 rounded-xl"></div>
            </div>
        </div>
    );
}
