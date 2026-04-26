import Link from "next/link";

interface GameModeCardProps {
    href: string;
    emoji: string;
    title: string;
    description: string;
    badgeLabel: string;
}

export default function GameModeCard({ href, emoji, title, description, badgeLabel }: GameModeCardProps) {
    return (
        <Link
            href={href}
            className="col-span-1 sm:col-span-2 lg:col-span-3 group relative bg-bg-main rounded-2xl shadow-sm border border-border-muted p-4 flex items-center justify-between hover:shadow-md hover:bg-bg-subtle transition-all duration-200 cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#f8fafc] rounded-xl flex items-center justify-center text-2xl border border-border-muted/50 group-hover:bg-white transition-colors duration-200">
                    {emoji}
                </div>
                <div className="flex flex-col text-left">
                    <h2 className="text-base font-bold text-text-main">{title}</h2>
                    <p className="text-sm text-text-dim mt-0.5 leading-tight">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex-shrink-0 ml-4">
                <div className="bg-[#dbeafe] rounded-full px-2.5 py-1">
                    <span className="text-xs font-bold text-[#1e3a8a] whitespace-nowrap">
                        {badgeLabel}
                    </span>
                </div>
            </div>
        </Link>
    );
}